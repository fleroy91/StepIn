// 
//  ShopCreateAccount.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Tools = require("/etc/Tools");

function CreateAccountWindow(args) {'use strict';
    var ntop = 10;
    var AppUser = require('model/AppUser'), user = new AppUser();
    user.setIsUser(false);
    var tabGroup = args.tabGroup;
    
    if (Titanium.Facebook.loggedIn) {
        // We will use the TB account
        // The user just have to add his phone number
        user.setFBToken(Ti.Facebook.accessToken);
    }
    
    var FormWindow = require("ui/common/FormWindow"),
        win = new FormWindow({ title : "Nouveau compte"}, 'create', user, tabGroup);
        
    win.addEventListener('close', function(e) {
        if(e.source.object) {
            var u = e.source.object;
            u.setCurrentUser();
            win.object = u;
        }
    });
    
    return win;
}

module.exports = CreateAccountWindow;
