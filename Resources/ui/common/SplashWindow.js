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

    var screens = ['tutorial1.png', 'tutorial2.jpg', 'tutorial3.jpg'];    
    var i, views = [];
    for(i = 0; i < screens.length; i ++) {
        var img = Ti.UI.createImageView({
            image : '/images/' + screens[i]
        });
        views.push(img);
    }
    var tutorial = Ti.UI.createScrollableView({
        showPagingControl : true,
        views : views,
        visible : false
    });
    win.add(tutorial);
    
    var btClose = Ti.UI.createButton({
        style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
        right : 120,
        bottom : 0,
        visible : false,
        image : "/images/bullet.png"
    });
    win.add(btClose);
    
    var _callback = null;
    btClose.addEventListener('click', function(e) {
        tutorial.visible = false;
        btClose.visible = false;
        if(_callback) {
            _callback();
        }
    });
    
    tutorial.addEventListener('scrollEnd', function(e) {
        btClose.visible = (e.currentPage === screens.length - 1); 
    });
    
    win.displayTutorial = function(func) {
        _callback = func;
        tutorial.visible = true;
    };
    
    return win;
}

module.exports = SplashWindow;


