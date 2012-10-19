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
var Spinner = require("/etc/Spinner");
var AppUser = require("/model/AppUser");
var Reward = require("/model/Reward");

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
        top : 220
    });
    view.add(continueButton);
    
    var lblLoginAction = Ti.UI.createLabel({
        text : 'Vous devez avoir un compte pour collecter vos points :',
        font : {fontSize : 19, fontWeight : 'bold'},
        top : 0,
        height : 50
    });
    
    function niceClose() {
        if(reward.getNbPoints() > 0) {
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
        } else {
            self.close();
            alert("Vous aviez déjà gagné ces points récemment !\nGagnez des points avec une autre action !");
        }
    }
    
    // TODO : ugly but ...
    var prevPoints = 0;
    function incrPrevPoints() { prevPoints++; }
    
    function onClose(bonus) {
        reward.bonusFB = bonus;
        prevPoints = reward.getNbPoints();
        reward = user.updateReward(reward);
        self.object = reward;
        var newPoints = reward.getNbPoints();
        var timeout = 200;
        if(newPoints > prevPoints) {
            timeout = Math.round(2000 / (newPoints - prevPoints));
            var sound = Titanium.Media.createSound();
            sound.url='/sounds/ouverture.mp3'; 
            sound.play();
            while(prevPoints <= newPoints) {
                vPoints.setText(prevPoints);
                setTimeout(incrPrevPoints, timeout);
            }
            timeout = 1000;
            setTimeout(niceClose, timeout);
        } else {
            setTimeout(niceClose, timeout);
        }
    }

    var LoginView = require("/ui/common/LoginView"),
        loginView = new LoginView(tabGroup, lblLoginAction, onClose);
    loginView.top = 480;
    view.add(loginView);

    button.addEventListener('click', function(e) {
        if(user.isDummy()) {
            self.close();
        } else {
            niceClose();
        }
    });
    
    function manageLogin() {
        // We animate the window to display the loginView
        var a = Ti.UI.createAnimation({height : 430, top : 10});
        continueButton.visible = false;
        view.animate(a);
        middleView.animate({top:50});
        loginView.animate({top:160});
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
            var sound = Titanium.Media.createSound();
            sound.url='/sounds/ouverture.mp3'; 
            sound.play();
            
            view.visible = true;
            // simply reset animation
            var t2 = Ti.UI.create3DMatrix();
            var a2 = Titanium.UI.createAnimation();
            a2.transform = t2;
            a2.duration = 750;
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
    
    Spinner.add(self);

    return self;
}

module.exports = NewRewardWindow;
