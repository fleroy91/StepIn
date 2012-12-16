// 
//  NewRewardWindow.js
//  StepInShopApp
//  
//  Created by Frederic Leroy on 2012-10-02.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/AppImage");
var Spinner = require("/etc/AppSpinner");
var AppUser = require("/model/AppUser");
var Reward = require("/model/Reward");

// Parameters : args.title, args.details, args.nb_points
function NewRewardWindow(tabGroup, reward) { 'use strict';

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
        zIndex : -2,
        width : '100%',
        height : '100%'
    });
    main.add(blackView);
    
   
    
    var view = Ti.UI.createScrollView({
        backgroundImage : '/images/popup-bck-pink.jpg',
		width : '100%',
        height : 430 - 200,
        visible : false,
        borderRadius : 5,
    	borderColor : '#ba307c',
    	borderWidth : 2
    });
    
     var containerView=Ti.UI.createView({
    	height:'auto',
    	width:'95%',
    	backgroundColor:'transparent'
    })
    
    containerView.add(view);
    
    var yeah = Ti.UI.createImageView({
        image : '/images/yay.png',
        top : 10
    });
    view.add(yeah);
    
    var middleView = Ti.UI.createView({
        height : 100,
        top : 70 
    });
    
    var lblDescAction = Ti.UI.createLabel({
        text : 'Ce ' + reward.getActionKindTitle() + ' vous a rapporté',
        font : {fontSize : 19, fontWeight : 'bold'},
        top : 0
    });
    // middleView.add(lblDescAction);

    var vPoints = Ti.UI.createLabel({
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {fontSize : 70, fontWeight : 'bold'},
        bottom : 0,
        right : 120,
        color : 'white',
        shadowColor : Ti.App.PinkColor,
        shadowOffset : {x:3, y:3}
    });
    middleView.add(vPoints);
    
    var lblSmall = Ti.UI.createLabel({
        textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
        right : 72,
        bottom : 12,
        text : "steps",
        font : {fontSize : 20, fontWeight : 'normal'},
        color : 'white',
        shadowColor : Ti.App.PinkColor,
        shadowOffset : {x:3, y:3}
    });
    middleView.add(lblSmall);
    view.add(middleView);
    
    /*    
    var continueButton = Ti.UI.createButtonBar({
        labels : ['Continuer à gagner des points'],
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        backgroundColor : Ti.App.PinkColor,
        height : 40,
        width : '90%',
        top : 220
    });
    view.add(continueButton);
    */
    
    var lblLoginAction = Ti.UI.createLabel({
        text : 'Vous devez avoir un compte pour collecter vos points :',
        font : {fontSize : 19, fontWeight : 'bold'},
        top : 0,
        height : 50,
        right : 15,
        left : 15
    });
    var soundWin = Titanium.Media.createSound({url : '/sounds/gain.mp3'});
    var soundOpen = Titanium.Media.createSound({url :'/sounds/ouverture.mp3'});
    
    function niceClose() {
        if(reward.getNbPoints() > 0) {
            soundWin.play();
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
    
    function none() {
        var i =0;
    }
    
    var _timer = null;
    function displayPoints(from, to, maxTime, func) {
        if(! _timer) {
            var timeout = Math.round(maxTime / (to - from));
            Ti.API.info("Timeout pour display Points : " + timeout);
            _timer = setInterval(function() {
                if (from <= to) {
                    vPoints.setText('+ ' + from);
                    from++;
                } else {
                    clearInterval(_timer);
                    _timer = null;
                    Ti.Media.vibrate();
                    if(func) {
                        func();
                    }
                }
            }, timeout);
        }
    }
    
    function onClose(bonus) {
        Spinner.show(self);
        reward.bonusFB = bonus;
        var prevPoints = reward.getNbPoints();
        reward = user.updateReward(reward);
        self.object = reward;
        var newPoints = reward.getNbPoints();
        Spinner.hide(self);
        if(newPoints > prevPoints) {
            soundOpen.play();
            displayPoints(prevPoints, newPoints, 2000, niceClose);
        } else {
            setTimeout(niceClose, 250);
        }
    }

    var LoginView = require("/ui/common/LoginView"),
        loginView = new LoginView(tabGroup, lblLoginAction, onClose);
    loginView.top = 480;
    view.add(loginView);

    if(! user.isDummy()) {
        view.addEventListener('click', niceClose);
    }
    
    function manageLogin() {
        // We animate the window to display the loginView
        var a = Ti.UI.createAnimation({height : 430, top : 10});
        view.animate(a);
        // middleView.animate({top:70});
        loginView.animate({top:160});
        
        var btClose = Ti.UI.createButton({
            image : '/images/close.png',
            style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
            top : 5,
            right : 5 
        });
        view.add(btClose);
        
        btClose.addEventListener('click', function(e) {
            if(user.isDummy()) {
                self.close();
            } else {
                niceClose();
            }
        });
    }
	
	///  TEST  /////
    main.add(containerView);
    
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
            soundOpen.play();
            
            view.visible = true;
            // simply reset animation
            var t2 = Ti.UI.create3DMatrix();
            var a2 = Titanium.UI.createAnimation();
            a2.transform = t2;
            a2.duration = 750;
            a2.addEventListener('complete', function(e) {
                setTimeout((user.isDummy() ? manageLogin : none), 1750);
                displayPoints(0, reward.getNbPoints(), 1500);
            });
            view.animate(a2);
        });
        view.animate(a1);
    });
        
    Spinner.add(self);
    
    self.addEventListener('open', function(e) {
        Ti.App.testflight.passCheckpoint("New reward : " + reward.inspect());
    });

    return self;
}

module.exports = NewRewardWindow;
