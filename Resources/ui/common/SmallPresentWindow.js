// 
//  SmallPresentWindow.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-26.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var AppUser = require("/model/AppUser");
var Image = require("/etc/AppImage");
require("ti.viewshadow");

function SmallPresentWindow(prevPresents, nextPresent, tabGroup) { 'use strict';
    var t = Titanium.UI.create2DMatrix({ scale : 0 });
    
    var buttonHeight = 25;
    var height = Math.min(2, prevPresents.length) * 40 + 60 + buttonHeight;
    
    var self = Ti.UI.createWindow({
        width : '100%',
        height : '100%'
    });

    var view = Ti.UI.createView({
        borderRadius : 1,
        borderColor : "#d92276",
        borderWidth : 1,
        transform : t,
        top : 45,
        right : 5,
        backgroundColor : 'white',
        width : 260,
        height : height,
        anchorPoint:{x:1,y:0}
    });
    
    var internView = Ti.UI.createView({
        top : 5, left : 5,
        right : 5, bottom : 5,
        backgroundColor : 'white',
        shadow : {
                shadowOffset : {x:2,y:2},
                shadowRadius : 2
            }
    });
    view.add(internView);
    
    var user = AppUser.getCurrentUser();
    var points = user.getTotalPoints() || 0;
    
    function createRow(present, disabled, height) {
        var row = Ti.UI.createTableViewRow({
            height : height
        });
        
        var leftImg = Ti.UI.createImageView({
            width : 40,
            height : 40,
            left : 2
        });
        row.add(leftImg);
        Image.cacheImage(present.getPhotoUrl(0), function(image) {
            leftImg.setImage(image); 
        });
        
        var rightWidth = 0, rightImg;
        if(disabled) {
            rightImg = Ti.UI.createImageView({ 
                image:'/images/checked.png',
                width : 18,
                height : 18,
                right : 2
            });
            rightWidth = 20;
        } else {
            var t = Ti.UI.create2DMatrix({scale : 0.75});
            rightImg = Image.createPointView(present.points - points, height, null, null, { transform : t});
            rightImg.right = -20;
        }
        row.add(rightImg);

        var lbl = Ti.UI.createLabel({
            color : (disabled ? 'lightgray' : 'black'),
            font : {fontSize : 14, fontWeight : 'normal'},
            text : present.title,
            left : leftImg.width + 4,
            right : rightWidth + 4,
            top : (disabled ? null : 12)  
        });
        row.add(lbl);
        
        if(! disabled) {
            var lblDetails =  Ti.UI.createLabel({
                color : 'lightgray',
                font : {fontSize : 12, fontWeight : 'normal'},
                text : 'Il vous manque',
                left : leftImg.width + 4,
                right : rightWidth + 4,
                bottom : 10  
            });
            row.add(lblDetails);
        }
        
        return row;
    }
    
    var i, nb = 0, data = [];
    for(i = prevPresents.length - 1; nb < 2 && i >= 0; i --) {
        var present = prevPresents[i];
        data.push(createRow(present, true, 40));
        nb ++;
    }
    
    var rowNext = createRow(nextPresent, false, 60); 
    data.push(rowNext);
    
    var tv = Ti.UI.createTableView({
        data : data,
        top : 0,
        height : height - buttonHeight
    });
    internView.add(tv);
    var bt = Ti.UI.createButton({
        style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
        title : "Voir tous les cadeaux",
        font:{fontSize : 14, fontWeight : 'normal'},
        color : Ti.App.PinkColor,
        backgroundImage : '/images/bck-gradient-button.png',
        borderRadius : 0,
        borderColor : '#bdbfc3',
        width : '100%',
        height : buttonHeight,
        bottom : 0,
        zIndex : 10
    });
    view.add(bt);
    
    function niceClose(func) {
        var t3 = Ti.UI.create2DMatrix({scale : 0});
        var a = Ti.UI.createAnimation({transform : t3, duration : 500});
        a.addEventListener('complete', function(e) {
            self.close();
            if(func) {
                func();
            }
        });
        view.animate(a);
    }
    
    bt.addEventListener('click', function(e) {
        niceClose(function() {          
            tabGroup.setActiveTab(tabGroup.indexTabPresents);
        });
    });
    self.add(view);
    
    tv.addEventListener('click', function() { niceClose(); });
    
    self.addEventListener('open', function() {
        var t2 = Ti.UI.create2DMatrix({scale : 1});
        var a = Ti.UI.createAnimation({transform : t2, duration : 500});
        view.animate(a); 
    });
    
    self.addEventListener('click', function() { niceClose(); });
    
    return self;
}

module.exports = SmallPresentWindow;
