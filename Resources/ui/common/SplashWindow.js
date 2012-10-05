// 
//  ShopSplashWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-21.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
//
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var Image = require("/etc/Image");
var Spinner = require("etc/Spinner");

function SplashWindow() { 'use strict';
    var win = Ti.UI.createWindow({
        backgroundImage : "/iphone/Default.png",
        navBarHidden : true
    });
    
    var modalWin = Ti.UI.createWindow({ navBarHidden : true});
    Spinner.add(modalWin);
    
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
    
    var vtop = Ti.UI.createView({
        top : 30,
        left : 20,
        right : 20,
        height : 80,
        zIndex : 1
    });
    var img = Image.createImageView('read', (user ? user.getPhotoUrl(0) : null), null, {id:'imgShop', top:5, left:5, height:60, width:60});
    vtop.add(img);
    vtop.img = img;
    
    var lbl = Ti.UI.createLabel({
        text : "Welcome back !",
        height : 50,
        top : 5,
        width:'auto',
        left : 80 
    });
    vtop.add(lbl);
    
    var adminButton = Ti.UI.createButtonBar({
        labels : ["Admin"],
        top : 15,
        right : 5,
        backgroundColor:'black',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 30
    });
    vtop.add(adminButton);
    vtop.adminButton = adminButton;
    
    if(!user) {
        vtop.hide();
    }
    modalWin.add(vtop);
    win.vtop = vtop;
    
    var imgback = Ti.UI.createLabel({
        top : 210,
        height : 130,
        width : 302,
        borderWidth : 1,
        borderRadius : 2,
        borderColor : 'white',
        backgroundColor : 'white',
        opacity : 0.8
    });
    // modalWin.add(imgback);

    var imgNew = Ti.UI.createLabel({
        top : 240,
        height : 130-10,
        width : 302-10,
        text : "What's new !\nEt pares venustatis venustatis gratiarum pares urbibus Damascus  !",
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        borderWidth : 1,
        borderRadius : 2,
        borderColor : 'lightgray',
        font : { fontSize : 18},
        color : 'blue'
    });
    // modalWin.add(imgNew);
    
    var vb = Ti.UI.createView({bottom : 10});
    
    var button = Ti.UI.createButtonBar({
        labels : [Ti.Locale.getString('start_button_title', "Let's start !")],
        bottom : 10,
        backgroundColor:'#ba307c',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 35,
        width : '80%'
    });
    vb.add(button);
    
    modalWin.add(vb);
       
    win.button = button;
    win.adminButton = adminButton;

    var nav = Ti.UI.iPhone.createNavigationGroup({
        window : modalWin
    });
    win.add(nav);
    win.navGroup = nav;
    this.win = win;
    
    win.update = function() {
        var user = AppUser.getCurrentUser();
        if(! user) {
            win.vtop.hide();
        } else {
            win.vtop.img.setImage(user.getPhotoUrl(0));
            win.vtop.show();
            
            if(user.isAdmin) {
                win.vtop.adminButton.show();
            } else { 
                win.vtop.adminButton.hide(); 
            }
        }
    };
    
    win.addEventListener('focus', function(e) { e.source.update(); });
    
    return win;
}

module.exports = SplashWindow;


