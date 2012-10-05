// 
//  ShopLogin.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

function Login(_args) {'use strict';
    var win = Ti.UI.createWindow({ });
    Titanium.Facebook.appid = "228159347198277";
    Titanium.Facebook.permissions = ['publish_stream', 'read_stream'];
    //
    // Login Button
    //
    var ntop = 10;
    if(Titanium.Platform.name === 'iPhone OS'){
        win.add(Titanium.Facebook.createLoginButton({
            style:Ti.Facebook.BUTTON_STYLE_WIDE,
            top: ntop
        }));
    }
    else{
        win.add(Titanium.Facebook.createLoginButton({
            style:'wide',
            top: ntop
        }));
    }
    ntop += 30;
    //
    //  CREATE FIELD ONE
    //
    var lEmail = Titanium.UI.createLabel({
        color:'white',
        text:Ti.Locale.getString('email_text'),
        top: ntop,
        left:30,
        width:'auto',
        height:'auto'
    });
    win.add(lEmail);
    ntop += 30;
    
    var emailField = Titanium.UI.createTextField({
        hintText:Ti.Locale.getString('email_hint'),
        height:35,
        top: ntop,
        // TODO : debug
        value:'test@gmail.com',
        left:30,
        width:250,
        borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        keyboardType : Titanium.UI.KEYBOARD_EMAIL,
        returnKeyType : Titanium.UI.RETURNKEY_NEXT    
    });
    ntop += 37;
    
    win.add(emailField);
    
    var passwordField = Titanium.UI.createTextField({
        hintText:Ti.Locale.getString('password_hint'),
        height:35,
        // TODO : debug
        value:'1234',
        top: ntop,
        left:30,
        width:250,
        borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        passwordMask :true,
        returnKeyType : Titanium.UI.RETURNKEY_DONE    
    });
    ntop += 40;
    
    win.add(passwordField);
    
    //
    // CREATE BUTTON
    //
    var loginButton = Titanium.UI.createButtonBar({
        labels:['Connexion'],
        top: ntop,
        left:30,
        backgroundColor:'#336699',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 25,
        width:250
    });
    win.add(loginButton);
    
    function checkLogin(e) {
        var p = passwordField.value;
        var l = emailField.value;
        var User = require('model/AppUser'),
            user = new User();
        var qparams = {is_user : false, email : l, password: p};
        user.retrieveUser(qparams, function(user) {
            if(user) {
                user.setCurrentUser();
                win.close();
            } else {
                // We open the new account window
                var CreateAccountWindow = require('ui/common/CreateAccount'),
                    swin = new CreateAccountWindow(qparams);
                swin.addEventListener('close', function(e) {
                    if(swin.accountCreated) {
                        win.close();
                    }
                });
                swin.open();
            }
        });
    } 
    
    passwordField.addEventListener('return', checkLogin);
    loginButton.addEventListener('click', checkLogin);
    
    //
    // Login Status
    //
    var label = Ti.UI.createLabel({
        text:'Logged In = ' + Titanium.Facebook.loggedIn,
        font:{fontSize:14},
        height:'auto',
        textAlign:'center'
    });
    // win.add(label);
    
    function updateLoginStatus() {
        label.text = 'Logged In = ' + Titanium.Facebook.loggedIn;
    }
    
    // capture
    Titanium.Facebook.addEventListener('login', function (e) {
        var User = require('model/AppUser'),
            user = new User();
        var qparams = { is_user : false, fb_token : Titanium.Facebook.accessToken};
        user.retrieveUser(qparams, function (user) {
            if(user) {
                user.setCurrentUser();
                win.close();
            } else {
                // We open the new account window
                var CreateAccountWindow = require('ui/common/CreateAccount'),
                    swin = new CreateAccountWindow(qparams);
                swin.addEventListener('close', function(e) {
                    if(swin.accountCreated) {
                        win.close();
                    }
                });
                swin.open();
            }
        });    
    });
    Titanium.Facebook.addEventListener('logout', updateLoginStatus);
    
    return win;
}

module.exports = Login;
