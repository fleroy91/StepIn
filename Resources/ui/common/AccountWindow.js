// 
//  ShopAccountWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
Ti.include("/etc/image.js");

function AccountWindow(args) {'use strict';
	var self = Ti.UI.createWindow({ 
	    title : 'Mon compte', 
	    backgroundColor : 'white'
    });
    var tabGroup = args.tabGroup;
    
	var Shop = require("/model/Shop"),
	   shop = Shop.getCurrentShop();
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
    var mainObject = (Ti.App.adminMode ? shop : user); 
	
	var header = Ti.UI.createView({ height : 65});   
	var img = Image.createImageView('read', mainObject.getPhotoUrl(0), null, {id:'imgShop', top:15, left:15, height:50, width:50});
	header.add(img);
	
	var lbl = Ti.UI.createLabel({
		text : mainObject.getName(),
		height : 50,
		top : 15,
		width:'auto',
		left : 80 
	});
	header.add(lbl);
	
	var data = [];
	var s1 = Ti.UI.createTableViewSection({});
	
    var r10 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'}, title : Ti.Locale.getString('profil_text', 'Mon profil'), hasChild : true });
	var r11 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'}, title : Ti.Locale.getString('boutique_text', 'Boutique'), hasChild : true });
	var r12 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'}, title : Ti.Locale.getString('payments_text', 'Factures'), hasChild : true });
	var r13 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'}, title : Ti.Locale.getString('share_fb_text', 'Partager'), hasChild : true });
    s1.add(r10);
    if(Ti.App.adminMode) {
	   s1.add(r11);
	}
	s1.add(r12);
	s1.add(r13);
	
    r10.addEventListener('click', function(e) {
        var ShopFormWindow = require("/ui/common/FormWindow"),
           win = new ShopFormWindow({ title : "Mon compte"}, 'update', user, tabGroup);
        win.addEventListener('close', function(e) {
           if(e.source.object) {
               e.source.object.setCurrentUser();
                mainObject = e.source.object;
                img.img.setImage(mainObject.getPhotoUrl(0));
                lbl.setText(mainObject.getName());
           } 
        });
        self.containingTab.open(win, {animated:true});
    });

	r11.addEventListener('click', function(e) {
	    var ShopFormWindow = require("/ui/common/FormWindow"),
	       win = new ShopFormWindow({ title : "Edition"}, 'update', shop, tabGroup, {addLocalizationButton : true});
	       
        win.addEventListener('close', function(e) {
           if(e.source.object) {
               e.source.object.setCurrentShop();
               if(Ti.App.adminMode) {
                    mainObject = e.source.object;
                    img.img.setImage(mainObject.getPhotoUrl(0));
                    lbl.setText(mainObject.getName());
               }
           } 
        });
	    self.containingTab.open(win, {animated:true});
	});
	
	function notImplemented() { alert("Not implemented !");}
	r12.addEventListener('click', notImplemented);
    r13.addEventListener('click', notImplemented);
    
	var s2 = Ti.UI.createTableViewSection({});
	var r21 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : 'Comment ça marche', hasChild : true });
	var r22 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : 'Foire aux questions', hasChild : true });
	var r23 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : "Conditions d'utilisations", hasChild : true });
	s2.add(r21);
	s2.add(r22);
	s2.add(r23);
	
    r21.addEventListener('click', notImplemented);
    r22.addEventListener('click', notImplemented);
    r23.addEventListener('click', notImplemented);

	var s3 = Ti.UI.createTableViewSection({});
	var r31 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : 'Contactez-nous', hasChild : true });
	s3.add(r31);
    r31.addEventListener('click', notImplemented);

	var s4 = Ti.UI.createTableViewSection({});
	var r41 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : 'Déconnexion'});
	s4.add(r41);
	
	r41.addEventListener('click', function(e) {
        var AppUser = require("/model/AppUser"),
           user = AppUser.getCurrentUser();
        
	    // TODO : use the real username
	    var dlg = Ti.UI.createAlertDialog({
            buttonNames: [Ti.Locale.getString('deconnexion_button', 'Déconnexion'), Ti.Locale.getString('cancel_button', 'Annuler')],
            message: "Vous êtes connecté en tant que " + user.getEmail(),
            title: Ti.Locale.getString('deconnexion_title','Déconnexion'),
            bottom : 400
          });

        dlg.addEventListener('click', function(e) {
            Ti.API.info("Dans click : " + e.index);
            if (e.index === 0) {
                Ti.App.Properties.setString('user', null);
                Ti.Facebook.logout();
                self.close();
                args.tagGroup.close();
            }
        });
        dlg.show();
	});
	
	data.push(s1);
	data.push(s2);
	data.push(s3);
	data.push(s4);
	
	var email = user.getEmail();
	// TODO : debug - check if the user is marked in the DB as super admin
	if(true || Tools.startsWith(email, "flperso@gmail.com") || (Tools.startsWith(email, "flperso+") && Tools.endsWith(email, "@gmail.com"))) {
        var s5 = Ti.UI.createTableViewSection({});
        var r51 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : 'Super-admin page'});
        s5.add(r51);
        
        r51.addEventListener('click', function(e) {
            var SuperAdminWindow = require("/ui/common/SuperAdminWindow"),
                win = new SuperAdminWindow();
            self.containingTab.open(win, {animated:true}); 
        });
        
	    data.push(s5);
	}
	
	var fv = Ti.UI.createView({
	    bottom : 0,
	    height : 15,
	    width : '100%'
	});
	
	var lversion = Ti.UI.createLabel({
	    text : 'Version : ' + Ti.App.getVersion(),
	    left : 5,
	    font:{fontSize : 10}
	});
    fv.add(lversion);
    var lcopyright = Ti.UI.createLabel({
        text : '© ' + Ti.App.getName() + ' - 2012',
        textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
        right : 5,
        font:{fontSize : 10}
    });
    fv.add(lcopyright);
	
	lversion.addEventListener('click', function(e) {
	    var InfoWindow = require("/ui/common/InfoWindow"),
	       win = new InfoWindow();
	    self.containingTab.open(win, {animated : true});
	});

	var tv = Ti.UI.createTableView({
		data:data, 
		footerView : fv,
		headerView : header,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED
	});
	self.add(tv);
	
	return self;
}

module.exports = AccountWindow ;