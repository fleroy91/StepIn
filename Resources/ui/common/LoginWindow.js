// 
//  LoginWindow.js
//  StepIn
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

function LoginWindow(tabGroup, headerView, beforeClose) {'use strict';

    var win = Ti.UI.createWindow({
        backgroundColor : '#f0f0f0',
        barImage : '/images/topbar-stepin.png',
        barColor : 'black',
        navBarHidden : false
    });

    var sc = Ti.UI.createScrollView({});
    
    function onClose() {
        win.close();
    }
    
    var LoginView = require("/ui/common/LoginView"),
        loginView = new LoginView(tabGroup, headerView, onClose, beforeClose);
    sc.add(loginView);
    
    win.add(sc);
    
    tabGroup.createTitle(win, "Connexion");
    
    return win;
}

module.exports = LoginWindow;
