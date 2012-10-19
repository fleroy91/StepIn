// 
//  LoginWindow.js
//  StepIn
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

function LoginWindow(args) {'use strict';

    var modal = (args && args.modal);

    var win = Ti.UI.createWindow({
        backgroundColor : '#f0f0f0',
        barColor : 'black',
        navBarHidden : modal,
        modal : modal,
        modalTransition : (modal ? Ti.UI.iPhone.MODAL_TRANSITION_STYLE_CROSS_DISSOLVE : null),
        modalStyle : (modal ? Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET : null)
    });

    var tabGroup = args.tabGroup;
    
    var sc = Ti.UI.createScrollView({});
    
    function onClose() {
        win.close();
    }
    
    var sheader = Ti.UI.createView({
        height : 40,
        top : 0,
        backgroundColor : '#d92276'
    });
    var lbl = Ti.UI.createLabel({
        text : "Connectez-vous avec",
        top : 2,
        left : 2,
        color : 'white',
        font : {fontSize : '15', fontWeight : 'normal'},
        textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
        height : 40
    });
    sheader.add(lbl);
    
    var LoginView = require("/ui/common/LoginView"),
        loginView = new LoginView(tabGroup, sheader, onClose);
    sc.add(loginView);
    
    win.add(sc);
    
    tabGroup.createTitle(win, "Connexion");
    
    return win;
}

module.exports = LoginWindow;
