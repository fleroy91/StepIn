// 
//  ShopAccountWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/AppImage");
var Tools = require("/etc/Tools");
var AppUser = require("/model/AppUser");

function AccountWindow(args) {'use strict';
	var self = Ti.UI.createWindow({ 
	    title : 'Mon compte', 
	    backgroundColor : '#f0f0f0',
	    barColor : 'black'
    });
    var tabGroup = args.tabGroup;
    
    var user = AppUser.getCurrentUser();
	
    var sheader = Ti.UI.createView({
        height : 40,
        top : 0,
        backgroundColor : '#d92276'
    });
    var lbl = Ti.UI.createLabel({
        text : "Configurez votre compte :",
        top : 2,
        left : 2,
        color : 'white',
        font : {fontSize : '15', fontWeight : 'normal'},
        textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
        height : 40
    });
    sheader.add(lbl);
    self.add(sheader);
    
    var header = Ti.UI.createView({ height : 65});   
	var img = Ti.UI.createImageView({
	    top:15, 
	    left:15, 
	    height:50, 
	    width:50,
	    borderRadius : 0,
	    barderWidth : 2,
	    borderColor : 'white'
	});
	header.add(img);
	
	var lbl2 = Ti.UI.createLabel({
		text : "",
		height : 50,
		top : 15,
		width:'auto',
		left : 80 
	});
	header.add(lbl2);
	
	var data = [];
	var sProfil = Ti.UI.createTableViewSection({});
	
    var r10 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'}, title : Ti.Locale.getString('profil_text', 'Mon profil'), hasChild : true });
	var r12 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'}, title : Ti.Locale.getString('payments_text', 'Factures'), hasChild : true });
	var r13 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'}, title : Ti.Locale.getString('share_fb_text', 'Partager'), hasChild : true });
    sProfil.add(r10);
	// sProfil.add(r12);
	// sProfil.add(r13);
	
	function displayAccount() {
        var FormWindow = require("/ui/common/FormWindow"),
           win = new FormWindow({ title : "Mon compte"}, 'update', user, tabGroup);
        win.addEventListener('close', function(e) {
           if(e.source.object) {
                user = e.source.object;
                updateWindow(null, user);
           } 
        });
        self.containingTab.open(win, {animated:true});
	}

    function doLogin() {
        var LoginWindow = require("/ui/common/LoginWindow"), 
            win = new LoginWindow({ tabGroup : tabGroup });

        win.addEventListener('close', function(e) {
            if (e.object) {
                user = e.object;
                updateWindow(null, user);
                displayAccount();
            }
        });
        self.containingTab.open(win, {
            animated : true
        });
    }
	
    r10.addEventListener('click', function(e) {
        user = AppUser.getCurrentUser();
        if(user.isDummy()) {
            // We need to login first
            doLogin();
        } else {
            displayAccount();
        }
    });

	function notImplemented() { alert("Not implemented !");}
	r12.addEventListener('click', notImplemented);
    r13.addEventListener('click', notImplemented);
    
	var sInfo = Ti.UI.createTableViewSection({});
	var r21 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : 'Comment ça marche', hasChild : true });
	var r22 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : 'Foire aux questions', hasChild : true });
	var r23 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : "Conditions d'utilisations", hasChild : true });
	sInfo.add(r21);
	sInfo.add(r22);
	sInfo.add(r23);
	
    r21.addEventListener('click', notImplemented);
    r22.addEventListener('click', notImplemented);
    r23.addEventListener('click', notImplemented);

	var sContact = Ti.UI.createTableViewSection({});
	var r31 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : 'Feedback', hasChild : true });
	sContact.add(r31);
    r31.addEventListener('click', function(e) {
        Ti.App.testflight.openFeedbackView();
    });

	var sLogin = Ti.UI.createTableViewSection({});
	var r41 = Ti.UI.createTableViewRow({ font:{fontWeight:'normal'},title : 'Connexion'});
	sLogin.add(r41);
	
	var sSuperAdmin = null, email = user.getEmail();
	// TODO : debug - check if the user is marked in the DB as super admin
	// if(! user.isDummy() || Tools.startsWith(email, "test2@gmail.com") || (Tools.startsWith(email, "flperso+") && Tools.endsWith(email, "@gmail.com"))) {
	if(! sSuperAdmin) {
        sSuperAdmin = Ti.UI.createTableViewSection({});
        var r51 = Ti.UI.createTableViewRow({ hasChild : true, font:{fontWeight:'normal'},title : 'Super-admin page'});
        sSuperAdmin.add(r51);
        
        r51.addEventListener('click', function(e) {
            var SuperAdminWindow = require("/ui/common/SuperAdminWindow"),
                win = new SuperAdminWindow({ tabGroup : tabGroup});
            self.addEventListener('close', updateWindow);
            self.containingTab.open(win, {animated:true}); 
        });
	}
    data.push(sProfil);
    if(sSuperAdmin) { 
        data.push(sSuperAdmin);
    }
    // data.push(sInfo);
    data.push(sContact);
    data.push(sLogin);
	
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
	    data : data,
		footerView : fv,
		headerView : header,
		backgroundColor : '#f0f0f0',
		top : 40,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED
	});
	self.add(tv);
	
	function updateWindow(e, user) {
	    if(user) {
            user.setCurrentUser();
            tabGroup.updateTitle();
            user.checkAll(tabGroup.updateAllRows);
            tabGroup.closeAllWindows();
	    } else {
            user = AppUser.getCurrentUser();
        }
        if(user.isDummy()) {
           img.setImage("/images/unknown_user.png");
           lbl2.setText("Vous n'êtes pas connecté !");
           r41.setTitle('Connexion'); 
        } else {
           Image.cacheImage(user.getPhotoUrl(0), function(image) {
                if(image) {
                    img.setImage(image);
                }
           });
           lbl2.setText(user.firstname);
           r41.setTitle('Déconnexion');
        }
        tabGroup.updateTitle(self);
	}
    r41.addEventListener('click', function(e) {
        user = AppUser.getCurrentUser();
           
        if(user.isDummy()) {
            doLogin();
        } else {
            // TODO : use the real username
            var dlg = Ti.UI.createAlertDialog({
                buttonNames: [Ti.Locale.getString('deconnexion_button', 'Déconnexion'), Ti.Locale.getString('cancel_button', 'Annuler')],
                message: "Vous êtes connecté en tant que " + (user.firstname || user.getEmail()),
                title: Ti.Locale.getString('deconnexion_title','Déconnexion'),
                bottom : 400
              });
    
            dlg.addEventListener('click', function(e) {
                if (e.index === 0) {
                    Ti.App.Properties.setString('user', null);
                    Ti.Facebook.logout();
                    user = new AppUser();
                    updateWindow(null, user);
                }
            });
            dlg.show();
        }
    });
	
	self.addEventListener('focus', updateWindow);
	
	return self;
}

module.exports = AccountWindow ;