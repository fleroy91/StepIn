// 
//  ShopSplashWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-21.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
//
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var Spinner = require("etc/Spinner");

function SplashWindow() { 'use strict';
    var win = Ti.UI.createWindow({
        backgroundImage : "/iphone/Default.png",
        navBarHidden : true
    });
    Spinner.add(win);
    
    return win;
}

module.exports = SplashWindow;


