// 
//  PresentListWindow.js
//  StepInShopApp
//  
//  Created by Frederic Leroy on 2012-09-25.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/AppImage");

function PresentListWindow(tabGroup, options) {'use strict';
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
        
	var self = Ti.UI.createWindow({ 
	    title : 'Les cadeaux !', 
	    backgroundColor : '#ffffff',
        barImage : '/images/topbar-stepin.png',
        barColor : 'black'
    });
    
    function displayMorePoints() {
        var MorePointsWindow = require("/ui/common/MorePointsWindow"),
         swin = new MorePointsWindow(tabGroup, {
             top : 44,
             width : '100%',
             height : 366,
             opacity : 0.92,
             borderWidth : 1,
             borderColor : 'black',
             popup : true
         });
         
         swin.open();
    }
    
    function createPresentView(present) {
        var isEnabled = (user.getTotalPoints() >= present.points);
        var pointsRequired = present.points; 
        var convert = true;

        var view = Ti.UI.createView({
            width : 142,
            height : 125
        });
        
        var lblTitle = Ti.UI.createLabel({
            text : present.title,
            top : 3,
            height : 15,
            color : 'black',
            font : {fontSize : 11, fontWeight : 'bold'}
        });
        view.add(lblTitle);
        
        var img = Ti.UI.createImageView({
            top : 20, 
            height : 75,
            width : 75
        });
        view.add(img);
        Image.cacheImage(present.getPhotoUrl(0), function(image) {
            img.setImage(image); 
        });
        
        var lblPoints = Image.createPointView(pointsRequired, 30, Ti.UI.FILL, null, {
            top : 90,
            color : Ti.App.PinkColor,
            font : {fontSize : 10},
            height : 30,
            right : 20
        });
        view.add(lblPoints);
        
        var bt = Ti.UI.createButtonBar({
            bottom : 2,
            backgroundColor:Ti.App.PinkColor,
            style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
            height:25,
            present : present,
            width : 135
        });
        // view.add(bt);
        
        bt.addEventListener('click', function(e) {
            if(convert) {
                var dlg = Ti.UI.createAlertDialog({
                    title : "Conversion",
                    message : "Voulez-vous convertir vos points en ce cadeau ?",
                    buttonNames : ['Confirmer', 'Annuler'] 
                });
                dlg.addEventListener('click', function(e) {
                    if (e.index === 0) {
                        // We just create a new reward with negative points
                        var Reward = require("/model/Reward"),
                            rew = new Reward();
                        rew.setUser(user);
                        rew.setNbPoints(-1 * present.points);
                        user.setTotalPoints(user.getTotalPoints() - present.points);
                        rew.setActionKind(present.title);
                        rew.create( function(e) {
                            alert("Votre bon cadeau vous sera envoyé par email dans quelques instants !");
                            self.close();
                        });
                    }
                });
                dlg.show();
            } else {
                displayMorePoints();
            }
        });
        
        img.addEventListener('click', function(e) {
            // We need to open a bigger detailed window
            var PresentDetailWindow = require("ui/common/PresentDetailWindow"),
                swin = new PresentDetailWindow(present, e.x, e.y, tabGroup, displayMorePoints);
            swin.open();
        });
        
        view.update = function(totalPoints) {
            if(pointsRequired <= totalPoints || (totalPoints - pointsRequired) >= 1000) {
                convert = true;
                // lblPoints.setText(pointsRequired + ' steps');
                bt.setLabels([{title:'Echanger ce cadeau'}]);
                bt.setBackgroundColor(Ti.App.PinkColor);
            } else {
                convert = false;
                // lblPoints.setText('Il vous manque ' + (pointsRequired - totalPoints) + ' steps');
                bt.setLabels([{title:'Gagner plus de points'}]);
                bt.setBackgroundColor('#d9b9c8');
            }
        };
        
        view.update(user.getTotalPoints());
        
        return view;
    }
    
    var i, data = [];
    self.setPresents = function(presents) {
        for(i = 0; i < presents.length; i++) {
            data.push(createPresentView(presents[i]));
        }
        var BigScrollView = require("ui/common/BigScrollView"),
            bsv = new BigScrollView({data : data, top : 0, left : 0});
        self.add(bsv);
    };
    
    self.addEventListener('focus', function(e) {
        var user = AppUser.getCurrentUser();
        var points = (user.getTotalPoints() || 0);
        for(i = 0; i < data.length; i++) {
            data[i].update(points);
        }
    });
    
	return self;
}

module.exports = PresentListWindow ;