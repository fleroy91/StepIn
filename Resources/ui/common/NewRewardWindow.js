// 
//  NewRewardWindow.js
//  StepInShopApp
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-02.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/AppImage");
var AppUser = require("/model/AppUser");
var Reward = require("/model/Reward");

var FB_POINTS = 150;

// Parameters : args.title, args.details, args.nb_points
function NewRewardWindow(tabGroup, reward, nextActions) { 'use strict';

    var self = Ti.UI.createWindow({
        navBarHidden : true
    });
    
    var main = Ti.UI.createWindow({
        navBarHidden : true
    });
    
    var nav = Ti.UI.iPhone.createNavigationGroup({
        window : main
    });
    self.add(nav);

    var user = AppUser.getCurrentUser();
    if(! user.isDummy()) {
        self.object = reward;
    }
    
    var blackView = Ti.UI.createView({
        backgroundColor : 'black',
        opacity : 0.5,
        zIndex : -1,
        width : '100%',
        height : '100%'
    });
    main.add(blackView);
    
    var view = Ti.UI.createScrollView({
        backgroundImage : '/images/back-popup.png',
        width : '95%',
        height : 430 - 150,
        borderRadius : 5,
        borderColor : '#ba307c',
        borderWidth : 2,
        visible : false
    });
    
    var yeah = Ti.UI.createImageView({
        image : '/images/felicitations-small.png',
        top : 10
    });
    view.add(yeah);
    
    var middleView = Ti.UI.createView({
        height : 140,
        top : 50 
    });
    
    var lblDescAction = Ti.UI.createLabel({
        text : 'Ce ' + reward.getActionKindTitle() + ' vous a rapporté',
        font : {fontSize : 19, fontWeight : 'bold'},
        top : 0
    });
    middleView.add(lblDescAction);

    var vPoints = Ti.UI.createLabel({
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {fontSize : 70, fontWeight : 'bold'},
        text : reward.getNbPoints(),
        right : 120,
        color : '#d92276',
        shadowColor : 'white',
        shadowOffset : {x:3, y:3}
    });
    middleView.add(vPoints);
    view.add(middleView);
    var vIn = Image.createStepInStar({width : 60, height : 60, right : 50});
    middleView.add(vIn);
   
    var button = Ti.UI.createButton({
        image : '/images/close.png',
        style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        top : 5,
        right : 5 
    });
    view.add(button);
    
    var continueButton = Ti.UI.createButtonBar({
        labels : ['Continuer à gagner des points'],
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        backgroundColor : '#d92276',
        height : 40,
        width : '90%',
        top : 230
    });
    view.add(continueButton);
    
    var loginView = Ti.UI.createView({
        height : Ti.UI.FILL,
        top : 480
    });
    
    var lblLoginAction = Ti.UI.createLabel({
        text : 'Vous devez avoir un compte pour collecter vos points :',
        font : {fontSize : 19, fontWeight : 'bold'},
        top : 0
    });
    loginView.add(lblLoginAction);
    
    var FBButton = Ti.UI.createButtonBar({
        labels : ['Connexion avec Facebook'],
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        backgroundColor : '#36549a',
        height : 40,
        width : '90%',
        top : 55
    });
    loginView.add(FBButton);
    
    var FBpoints = Ti.UI.createLabel({
        borderRadius : 10,
        borderWidth : 2,
        borderColor : 'white',
        backgroundColor : '#d92276',
        color: 'white',
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {fontSize : 12, fontWeight : 'bold'},
        text : '+' + FB_POINTS + ' pts',
        width : 70,
        height : 20,
        right : 3,
        top : FBButton.top - 12
    });
    loginView.add(FBpoints);
    
    var lblOr = Ti.UI.createLabel({
        top : 105,
        color : '#32342',
        font : {fontSize : 12, fontWeight : 'bold'},
        text : 'Ou'
    });
    
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
        top : 100,
        allowsSelection : false, 
        scrollable : false,
        data : [rowEmail, rowPassword]
    });
    loginView.add(tv);

    var btConnect = Ti.UI.createButtonBar({
        labels : ['Valider'],
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        backgroundColor : '#d92276',
        height : 40,
        width : '90%',
        bottom : 5
    });
    loginView.add(btConnect);
    view.add(loginView);
    
    function niceClose() {
        var sound = Titanium.Media.createSound();
        sound.url='/sounds/gain.mp3'; 
        sound.play();
        var t1 = Ti.UI.create3DMatrix();
        t1 = t1.scale(0.00001);
        t1 = t1.rotate(180,0,0,1);
        var a1 = Titanium.UI.createAnimation();
        a1.transform = t1;
        a1.duration = 750;
        a1.addEventListener('complete', function()
        {
            setTimeout(function() { self.close();}, 250);
        });
        view.animate(a1);
    }
    button.addEventListener('click', function(e) {
        if(user.isDummy()) {
            self.close();
        } else {
            niceClose();
        }
    });
    
    function setNewUserAndClose(user) {
        user.setCurrentUser();
        user.checkAll(tabGroup.updateAllRows);
        tabGroup.updateTitle();
        self.object = reward;
        setTimeout(niceClose,250);
    }
    
    var FBResult = null;
    
    function createUser(user, withFB) {
        user.create(function(newUser) {
            if(newUser) {
                reward.setNbPoints(reward.getNbPoints() + (withFB ? FB_POINTS : 0));
                setNewUserAndClose(newUser);
            } else {
                alert("Une erreur s'est produite dans la création du compte. Recommencez !");
            }
        });
    }
    
    function doLogin(withFB, result) {
        var qparams;
        var email = tfEmail.getValue();
        var password = tfPassword.getValue();
        tfEmail.blur();
        tfPassword.blur(); 
        var ok = true;
        if(withFB) {
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
            user.retrieveUser(qparams, function (user) {
                if(user) {
                    if(! withFB && user.password !== password) {
                        alert("L'email '" + email + "' est déjà utilisé !");
                    } else {
                        setNewUserAndClose(user, withFB);
                    }
                } else {
                    var dlg = Ti.UI.createAlertDialog({
                        buttonNames : ['On continue', 'Annuler'],
                        title : 'Création de compte',
                        message : 'Le compte ' + (withFB ? 'Facebook' : email) + ' va être créé'
                    });
                    dlg.addEventListener('click', function(e) {
                        if(e.index === 0) {
                            user = new AppUser();
                            if(withFB) {
                                user.setFBToken(Ti.Facebook.getAccessToken());
                                user.is_user = true;
                                if(FBResult) {
                                    user.firstname = FBResult.first_name;
                                    if(FBResult.picture) {
                                        Image.loadImage(FBResult.picture, function(blob) {
                                            // TODO : we should be abel to send the url to the back end directly without loading first the image
                                            // via the client and send the file to the back end
                                            user.setPhoto(0, blob);
                                            createUser(user);
                                        });
                                    } else {
                                        createUser(user);
                                    }
                                }
                            } else {
                                user.setEmail(email);
                                user.setPassword(password);
                                createUser(user);
                            }
                        }
                    });
                    dlg.show();
                }
            });
        }
    }
    var logged = false;    
    function manageFBLogin() {
        Ti.Facebook.requestWithGraphPath('me', {}, 'GET', function(e) {
            if(e.success && e.result) {
                doLogin(true, e.result);
            }
        });
    }
    
    Titanium.Facebook.addEventListener('login', function (e) {
        if(e.success && Ti.Facebook.loggedIn && !logged) {
            logged = true;
            manageFBLogin();
        }
    });
    
    FBButton.addEventListener('click', function(e) {
        if(Ti.Facebook.loggedIn) {
            logged = true;
            manageFBLogin();
        } else {
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
    
    function manageLogin() {
        // We animate the window to display the loginView
        var a = Ti.UI.createAnimation({height : 430, top : 10});
        continueButton.visible = false;
        view.animate(a);
        middleView.animate({top:50});
        loginView.animate({top:170});
    }

    main.add(view);
    
    self.addEventListener('open', function(e) {
        Titanium.Media.vibrate();
        var t1 = Ti.UI.create3DMatrix();
        t1 = t1.scale(0.00001);
        t1 = t1.rotate(180,0,0,1);
        var a1 = Titanium.UI.createAnimation();
        a1.transform = t1;
        a1.duration = 1;
        a1.addEventListener('complete', function()
        {
            view.visible = true;
            // simply reset animation
            var t2 = Ti.UI.create3DMatrix();
            var a2 = Titanium.UI.createAnimation();
            a2.transform = t2;
            a2.duration = 1000;
            a2.addEventListener('complete', function(e) {
                Ti.Media.vibrate();
            });
            view.animate(a2);
        });
        view.animate(a1);
    });
    continueButton.addEventListener('click', function(e) {
        if(! user.isDummy()) {
            niceClose();
        } else {
            manageLogin();
        }
    });

    return self;
}

module.exports = NewRewardWindow;
