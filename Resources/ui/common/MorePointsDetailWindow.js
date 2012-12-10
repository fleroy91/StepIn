// 
//  MorePointsDetailWindow.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-26.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var AppUser = require("/model/AppUser");
var Image = require("/etc/AppImage");

function MorePointsDetailWindow(tabGroup, action) { 'use strict';
    var buttonHeight = 25;
    
    var self = Ti.UI.createWindow({
        backgroundColor : 'white'
    });

    var user = AppUser.getCurrentUser();
    var points = user.getTotalPoints() || 0;
    
    var convert = true;
    var lblTitle = Ti.UI.createLabel({
        text : action.title,
        top : 10,
        color : 'black',
        font : {fontSize : 20, fontWeight : 'bold'}
    });
    self.add(lblTitle);
    
    var img = Ti.UI.createImageView({
        top : 40, 
        height : 100,
        width : 100,
        image : action.image
    });
    self.add(img);
    
    var lblDetails = Ti.UI.createLabel({
        text : action.detail,
        left : 5, 
        right : 5,
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER, 
        top : img.top + img.height + 10,
        color : 'gray',
        font: {fontSize : 14, fontWeight : 'normal'}
    });
    self.add(lblDetails);

    // TODO : implement nicer conditions
    var lblConditions = Ti.UI.createLabel({
        text : "Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un peintre anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page de texte, comme Aldus PageMaker.",
        top : lblDetails.top + 40,
        height : 80,
        left : 5,
        right : 5,
        color : '#1ca5d2',
        font: {fontSize : 10, fontWeight : 'normal'}
    });
    self.add(lblConditions);
    
    var lblPoints = Image.createPointView(action.points, 40, 120, null, {
        bottom : 60,
        color : Ti.App.PinkColor,
        font : {fontSize : 14},
        height : 18
    }); 
    self.add(lblPoints);
    
    var bt = Ti.UI.createButtonBar({
        bottom : 10,
        backgroundColor:Ti.App.PinkColor,
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height:25,
        width : '70%'
    });
    self.add(bt);
    
    function niceClose() {
        self.close();
    }
    
    bt.addEventListener('click', function(e) {
        action.action();
        niceClose();
    });
    bt.setLabels([{title:'Gagner ces points'}]);
    bt.setBackgroundColor(Ti.App.PinkColor);
    
    self.addEventListener('open', function(e) {
        Ti.App.testflight.passCheckpoint("View detail of a more points : " + action.title);
    });
    return self;
}

module.exports = MorePointsDetailWindow;
