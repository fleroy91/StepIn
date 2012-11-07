// 
//  LoginView.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-19.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var AppUser = require("/model/AppUser");
var Spinner = require("/etc/AppSpinner");
var Image = require("/etc/AppImage");

function LoginView(tabGroup, header, onClose) { 'use strict';
    var bonus = 0;
    var loginView = Ti.UI.createView({
        height : Ti.UI.FILL
    });
    var ntop = 0;
    if(header) {
        header.top = ntop;
        loginView.add(header);
        ntop += header.height + 15;
    } else {
        ntop += 15;
    }
    
    var FBButton = Ti.UI.createButtonBar({
        labels : ['Connexion avec Facebook'],
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        backgroundColor : '#36549a',
        height : 40,
        width : '90%',
        top : ntop
    });
    loginView.add(FBButton);
    
    var FBpoints = Ti.UI.createLabel({
        borderRadius : 10,
        borderWidth : 2,
        borderColor : 'white',
        backgroundColor : Ti.App.PinkColor,
        color: 'white',
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {fontSize : 12, fontWeight : 'bold'},
        text : '+' + Ti.App.FB_POINTS + ' pts',
        width : 70,
        height : 20,
        right : 3,
        top : ntop - 12
    });
    loginView.add(FBpoints);
    ntop += 42;
    
    var lblOr = Ti.UI.createLabel({
        top : ntop,
        color : '#32342a',
        font : {fontSize : 12, fontWeight : 'bold'},
        text : 'Ou'
    });
    loginView.add(lblOr);
    ntop += 2;
    
    var prevnext = Titanium.UI.createButtonBar({
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        labels : ['Précédent', 'Suivant'],
        height : 30 
    });
    var flexSpace = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    var done = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.DONE
    });
    
    var tb = Ti.UI.iOS.createToolbar({
        opacity : 0.9,
        color : 'black',
        height : 40,
        items : [prevnext, flexSpace, done]
    });
    
    var rowEmail = Ti.UI.createTableViewRow({
        height : 40,
        backgroundColor : '#fefefe'
    });
    var tfEmail = Ti.UI.createTextField({
        borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
        hintText : 'Email',
        keyboardToolbar : tb,
        textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT, 
        autocorrect : false,
        keyboardType : Ti.UI.KEYBOARD_EMAIL,
        width : Ti.UI.FILL,
        left : 10,
        right : 10
    });
    rowEmail.add(tfEmail);
    var rowPassword = Ti.UI.createTableViewRow({
        height : 40,
        backgroundColor : '#fefefe'
    });
    var tfPassword = Ti.UI.createTextField({
        borderStyle : Ti.UI.INPUT_BORDERSTYLE_NONE,
        hintText : 'Mot de passe',
        textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT, 
        keyboardToolbar : tb,
        autocorrect : false,
        passwordMask : true,
        width : Ti.UI.FILL,
        left : 10,
        right : 10
    }); 
    rowPassword.add(tfPassword);
    
    var tv = Ti.UI.createTableView({
        backgroundColor : 'transparent',
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        top : ntop,
        width : '90%',
        allowsSelection : false, 
        scrollable : false,
        data : [rowEmail, rowPassword]
    });
    loginView.add(tv);
    
    ntop += 110;

    var btConnect = Ti.UI.createButtonBar({
        labels : ['Valider'],
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        backgroundColor : Ti.App.PinkColor,
        height : 40,
        width : '90%',
        top : ntop
    });
    loginView.add(btConnect);
    
    function setNewUserAndClose(user) {
        user.setCurrentUser();
        user.checkAll(function(e) {
            tabGroup.updateAllRows();
            Spinner.hide();
            onClose(bonus);
        });
    }
    
    var FBResult = null;
    
    function createUser(user, withFB) {
        user.create(function(newUser) {
            if(newUser) {
                bonus = (withFB ? Ti.App.FB_POINTS : 0);
                setNewUserAndClose(newUser);
            } else {
                Spinner.hide();
                alert("Une erreur s'est produite dans la création du compte. Recommencez !");
            }
        });
    }
    function doLogin(withFB, result) {
        Spinner.show();
        var qparams;
        var email = tfEmail.getValue();
        var password = tfPassword.getValue();
        tfEmail.blur();
        tfPassword.blur();
        var ok = true;
        if(withFB) {
            Ti.API.info("Retour de FB : " + result);
            FBResult = JSON.parse(result);
            qparams = { fb_token : Titanium.Facebook.getAccessToken()};
        } else {
            qparams = { email : email};
            if(email.length < 5 || email.indexOf('@') === -1) {
                alert("Email incorrect !");
                tfEmail.focus();
                ok = false;
            } else if(password.length <= 3) {
                alert("Mot de passe trop petit !");
                ok = false;
                tfPassword.focus();
            }
        }
        
        if(ok) {
            var user = new AppUser();
            user.retrieveUser(qparams, function (user) {
                if(user) {
                    if(! withFB && user.password !== password) {
                        alert("L'email '" + email + "' est déjà utilisé !");
                    } else {
                        setNewUserAndClose(user, withFB);
                    }
                } else {
                    Spinner.hide();
                    var dlg = Ti.UI.createAlertDialog({
                        buttonNames : ['On continue', 'Annuler'],
                        title : 'Création de compte',
                        message : 'Le compte ' + (withFB ? 'Facebook' : email) + ' va être créé'
                    });
                    dlg.addEventListener('click', function(e) {
                        if(e.index === 0) {
                            Spinner.show();
                            user = new AppUser();
                            if(withFB) {
                                user.setFBToken(Ti.Facebook.getAccessToken());
                                user.is_user = true;
                                if(FBResult) {
                                    user.firstname = FBResult.first_name;
                                    user.email = FBResult.email;
                                    if(FBResult.picture && FBResult.picture.data && FBResult.picture.data.url) {
                                        Spinner.show();
                                        Image.loadImage(FBResult.picture.data.url, function(blob) {
                                            // TODO : we should be able to send the url to the back end directly without loading first the image
                                            // via the client and send the file to the back end
                                            user.setPhoto(0, blob);
                                            createUser(user, withFB);
                                        });
                                    } else {
                                        createUser(user, withFB);
                                    }
                                }
                            } else {
                                user.setEmail(email);
                                user.setPassword(password);
                                createUser(user, withFB);
                            }
                        }
                    });
                    dlg.show();
                }
            });
        }
    }
    var logged = false;
    var FB_Listener = null;    
    function manageFBLogin() {
        if(FB_Listener) {
            Ti.Facebook.removeEventListener('login', FB_Listener);
        }
        Spinner.show();
        Ti.Facebook.requestWithGraphPath('me', {fields:'id,name,first_name,email,picture'}, 'GET', function(e) {
            if(e.success && e.result) {
                doLogin(true, e.result);
            }
        });
    }
    
    FB_Listener = function (e) {
        if(e.success && Ti.Facebook.loggedIn && !logged) {
            logged = true;
            manageFBLogin();
        }
    };
    
    
    FBButton.addEventListener('click', function(e) {
        tfEmail.blur();
        tfPassword.blur(); 
        if(Ti.Facebook.loggedIn) {
            logged = true;
            manageFBLogin();
        } else {
            Titanium.Facebook.addEventListener('login', FB_Listener);
            Ti.Facebook.authorize();
        }    
    });
    btConnect.addEventListener('click', function(e) { doLogin(false);});
    done.addEventListener('click', function(e) {
        doLogin(false);
    });
    prevnext.addEventListener('click', function(e) {
        if(e.index === 0) {
            tfEmail.focus();
        } else {
            tfPassword.focus();
        }
    });
    
    return loginView;
}

module.exports = LoginView;
