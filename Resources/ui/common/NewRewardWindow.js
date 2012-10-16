// 
//  NewRewardWindow.js
//  StepInShopApp
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-02.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/Image");
var AppUser = require("/model/AppUser");

// Parameters : args.title, args.details, args.nb_points
function NewRewardWindow(tabGroup, reward, nextActions) { 'use strict';

    var self = Ti.UI.createWindow({
        navBarHidden : true
        /*,
        modal:true,
        modalTransition : Ti.UI.iPhone.MODAL_TRANSITION_STYLE_CROSS_DISSOLVE,
        modalStyle : Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
        */
    });
    
    var main = Ti.UI.createWindow({
        navBarHidden : true
    });
    
    var nav = Ti.UI.iPhone.createNavigationGroup({
        window : main
    });
    self.add(nav);

    var user = AppUser.getCurrentUser();
    if(! user.isDummy()) {
        self.object = reward;
    }
    
    var blackView = Ti.UI.createView({
        backgroundColor : 'black',
        opacity : 0.5,
        zIndex : -1,
        width : '100%',
        height : '100%'
    });
    main.add(blackView);
    
    var view = Ti.UI.createView({
        backgroundImage : '/images/gain-points.jpg',
        width : '95%',
        height : '95%',
        borderRadius : 5,
        borderColor : '#ba307c',
        borderWidth : 2
    });
    
    var button = Ti.UI.createButtonBar({
        labels : ['Fermer'],
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        backgroundColor : 'black',
        height : 30,
        top : 5,
        right : 5 
    });
    view.add(button);
    
    button.addEventListener('click', function(e) {
        self.close();
    });
    
    var vPoints = Ti.UI.createLabel({
        backgroundColor : '#fbdd31',
        top : 80,
        height : 60,
        width : Ti.UI.FILL,
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {fontSize : 50, fontWeight : 'bold'},
        text : reward.getNbPoints(),
        shadowOffset : { x: 1, y : 1},
        color : '#d92276',
        shadowColor : 'white'
    });
    view.add(vPoints);

    var goToPresents = Ti.UI.createButtonBar({
        labels : ['Les échanger contre un cadeau'],
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        backgroundColor : '#d92276',
        height : 40,
        width : '90%',
        top : 175
    });
    view.add(goToPresents);
    
    goToPresents.addEventListener('click', function(e) {
        self.managedWindow = true;
        tabGroup.setActiveTab(1);
        setTimeout(function(e) { self.close();}, 250);
    });
    
    // TODO : implement the next actions and the window if we're not logged !
    if(user.isDummy()) {
        var yellow = Ti.UI.createView({
            backgroundColor : '#fbdd31',
            width : '100%',
            height : Ti.UI.FILL,
            top : 170             
        });
        
        var lbl = Ti.UI.createLabel({
            text : "Connectez vous\npour gagner vos points !",
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
            backgroundColor : '#d92276',
            width : '100%',
            color : 'white',
            top : 0,
            height : 60
        });
        yellow.add(lbl);
        
        var tv = Ti.UI.createTableView({
            style : Ti.UI.iPhone.TableViewStyle.GROUPED,
            backgroundColor : 'transparent',
            top : 60
        });
        
        var s1 = Ti.UI.createTableViewSection({
            headerTitle : "Je crée mon compte avec"
        });
        
        var rowFBView = Ti.UI.createView({
            height : 35,
            backgroundColor : '#3c5a98'
        });
        var imgFB = Ti.UI.createImageView({
            image : "/images/fblogo.png",
            top : 0,
            left : 0,
            width : 35,
            height : 35
        });
        rowFBView.add(imgFB);
        var lblFB = Ti.UI.createLabel({
            text : "Facebook",
            left : 40,
            color : 'white'
        });
        rowFBView.add(lblFB);
        var ptFB = Image.createPointView(150, 35, null, false);
        ptFB.right = 2;
        rowFBView.add(ptFB);
        
        var rowFB = Ti.UI.createTableViewRow({
        });
        rowFB.add(rowFBView);
        s1.add(rowFB);
        
        var rowNormal = Ti.UI.createTableViewRow({
            title : "email / mot de passe"
        });
        s1.add(rowNormal);
        
        var s2 = Ti.UI.createTableViewSection({
            headerTitle : "Je me connecte"
        });

        var rowLogin = Ti.UI.createTableViewRow({
            height : 35,
            title : "avec mon compte existant"
        });
        s2.add(rowLogin);
        tv.setData([s1, s2]);
        tv.addEventListener('click', function(e) {
            var swin = null;
            
            if(e.index === 0) {
                // TODO : to implement
                alert("Not implemented");
            } else if(e.index === 1) {
                var CreateAccountWindow = require("/ui/common/CreateAccount");
                swin = new CreateAccountWindow({tabGroup : tabGroup, modal : false});
            } else if(e.index === 2) {
                var LoginWindow = require("/ui/common/LoginWindow");
                swin = new LoginWindow({tabGroup : tabGroup, modal : false});
            }
            if(swin) {                    
                swin.addEventListener('close', function(e) {
                    if(swin.object) {
                        var user = swin.object; 
                        user.checkAll(function(e) {
                            // We need to check if the current reward is ok
                            reward = user.updateReward(reward);
                            vPoints.setText(reward.getNbPoints());
                            
                            // TODO : to implement -> update the bottom view
                            tabGroup.updateAllRows();
                            yellow.hide();
                            swin.object = reward;
                        });
                    }
                });
                swin.nav = nav;
                nav.open(swin, {animated:true});
            }
        });
        yellow.add(tv);
        view.add(yellow);
    }
    
    main.add(view);
    
    self.addEventListener('open', function(e) {
        Titanium.Media.vibrate();
    });
    
    return self;
}

module.exports = NewRewardWindow;
