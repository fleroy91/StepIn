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
            height : 140
        });
        
        var lblTitle = Ti.UI.createLabel({
            text : present.title,
            top : 3,
            height : 30,
            color : 'black',
            font : {fontSize : 14, fontWeight : 'bold'}
        });
        view.add(lblTitle);
        
        var img = Ti.UI.createImageView({
            top : 30, 
            height : 110,
            width : 110
        });
        view.add(img);
        Image.cacheImage(present.getPhotoUrl(0), function(image) {
            img.setImage(image); 
        });
        
        var imgCorner = Ti.UI.createImageView({
            height : view.height,
            width : view.width,
            bottom : 0,
            right : 0,
            image : "/images/corner-pink.png",
            zIndex : 1
        });
        view.add(imgCorner);
        
        var lblPoints = Image.createPointView(pointsRequired, 18, 70, null, {
            color : 'white',
            ratio : 0.7,
            height : 18
        });
        lblPoints.right = 1;
        lblPoints.bottom = 2;
        lblPoints.zIndex = 10;
        view.add(lblPoints);
        
        function openPresent(e) {
            // We need to open a bigger detailed window
            var PresentDetailWindow = require("ui/common/PresentDetailWindow"),
                swin = new PresentDetailWindow(present, e.x, e.y, tabGroup, displayMorePoints);
            swin.open();
        }
        
        view.addEventListener('click', openPresent);
        
        view.update = function(totalPoints) {
            if(pointsRequired <= totalPoints || (totalPoints - pointsRequired) >= 1000) {
                convert = true;
                lblPoints.setColor('white');
            } else {
                convert = false;
                lblPoints.setColor('#d9b9c8');
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