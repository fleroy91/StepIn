// 
//  ShopSplashWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-21.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
//
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var Spinner = require("etc/AppSpinner");

function SplashWindow() { 'use strict';
    var win = Ti.UI.createWindow({
        //backgroundImage : "/images/default.png",
        navBarHidden : true,
        width:'100%',
        height:'100%'
    });
    
    var view1,view2,view3,view4,view5,view6;
    
    view1 = Ti.UI.createView({backgroundImage:'/images/ecran1.jpg'});
    view2 = Ti.UI.createView({backgroundImage:'/images/ecran2.jpg'});
    view3 = Ti.UI.createView({backgroundImage:'/images/ecran3.jpg'});
    view4 = Ti.UI.createView({backgroundImage:'/images/ecran4.jpg'});
    view5 = Ti.UI.createView({backgroundImage:'/images/ecran5.jpg'});
    view6 = Ti.UI.createView({backgroundImage:'/images/ecran6.jpg'});

    var screens = [view1,view2,view3,view4,view5,view6];    

    var tutorial = Ti.UI.createScrollableView({
        showPagingControl : true,
        width:'100%',
        height:'100%',
        views : screens,
        disableBounce:true,
        maxZoomScale:2.0,
        currentPage:0,
        visible : false
    });
    
    var btClose = Ti.UI.createButton({
        style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
        right : 10,
        top : 0,
        visible : false,
        image : "/images/bt_fermer.png"
    });
    
    
    var _callback = null;
    btClose.addEventListener('click', function(e) {
        tutorial.visible = false;
        btClose.visible = false;
        win.remove(tutorial,btClose);
        win.close();
        win=null;
        if(_callback) {
            _callback();
        }
    });
    
    tutorial.addEventListener('scrollEnd', function(e) {
        btClose.visible = (e.currentPage === screens.length - 1); 
    });
    
    win.displayTutorial = function() {
         win.add(tutorial);
         win.add(btClose);
        tutorial.visible = true;
    };
    
    return win;
}

module.exports = SplashWindow;


