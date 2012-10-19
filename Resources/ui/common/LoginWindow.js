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
    var view = Ti.UI.createScrollView({
    });
    
    var tabGroup = args.tabGroup;
    //
    // Login Button
    //
    var ntop = 10;
    if(Titanium.Platform.name === 'iPhone OS'){
        view.add(Titanium.Facebook.createLoginButton({
            style:Ti.Facebook.BUTTON_STYLE_WIDE,
            top: ntop
        }));
    }
    else{
        view.add(Titanium.Facebook.createLoginButton({
            style:'wide',
            top: ntop
        }));
    }
    ntop += 30;
    //
    //  CREATE FIELD ONE
    //
    var lEmail = Titanium.UI.createLabel({
        color:'#d92276',
        text:Ti.Locale.getString('email_text'),
        top: ntop,
        left:30,
        width:'auto',
        height:'auto'
    });
    view.add(lEmail);
    ntop += 30;
    
    var emailField = Titanium.UI.createTextField({
        hintText:Ti.Locale.getString('email_hint'),
        height:35,
        top: ntop,
        // TODO : debug
        // value:'test@gmail.com',
        left:30,
        width:250,
        autocorrect : false,
        borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        keyboardType : Titanium.UI.KEYBOARD_EMAIL,
        returnKeyType : Titanium.UI.RETURNKEY_NEXT    
    });
    ntop += 37;
    
    view.add(emailField);
    
    var passwordField = Titanium.UI.createTextField({
        hintText:Ti.Locale.getString('password_hint'),
        height:35,
        // TODO : debug
        // value:'1234',
        top: ntop,
        left:30,
        width:250,
        borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        passwordMask :true,
        returnKeyType : Titanium.UI.RETURNKEY_DONE    
    });
    ntop += 40;
    
    view.add(passwordField);
    
    //
    // CREATE BUTTON
    //
    var loginButton = Titanium.UI.createButtonBar({
        labels:['Connexion'],
        top: ntop,
        backgroundColor:'#d92276',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 30
    });
    win.setRightNavButton(loginButton);
    ntop += 35;
    
    function checkLogin(e) {
        var p = passwordField.value;
        var l = emailField.value;
        var User = require('model/AppUser'),
            user = new User();
        var qparams = {is_user : false, email : l, password: p};
        user.retrieveUser(qparams, function(user) {
            if(user) {
                user.setCurrentUser();
                win.object = user;
                if(win.nav) {
                    win.nav.close(win, {animated:true});
                } else {
                    win.close();
                }
            } else {
                alert("Erreur dans la saisie de l'email / mot de passe !");
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
                win.object = user;
                win.close();
            } else {
                alert("Ce compte est inconnu. Vous devez dabord créer le compte !");
            }
        });    
    });
    Titanium.Facebook.addEventListener('logout', updateLoginStatus);
    win.add(view);
    
    win.setTitle(null);
    
    return win;
}

module.exports = LoginWindow;
