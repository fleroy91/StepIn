// 
//  PresentDetailWindow.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-26.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var AppUser = require("/model/AppUser");
var Image = require("/etc/AppImage");

function PresentDetailWindow(present, x, y, tabGroup, displayMorePoints) { 'use strict';
    var t = Titanium.UI.create2DMatrix({ scale : 0 });
    
    var buttonHeight = 25;
    
    var self = Ti.UI.createWindow({
        width : '100%',
        height : '100%'
    });

    var view = Ti.UI.createView({
        borderRadius : 4,
        borderColor : "#d92276",
        borderWidth : 2,
        transform : t,
        left : x,
        top : y,
        width : '90%',
        height : '90%',
        backgroundColor : '#f0f0f0',
        anchorPoint:{x:0.5,y:0.5}
    });
    
    var user = AppUser.getCurrentUser();
    var points = user.getTotalPoints() || 0;
    
    var isEnabled = (user.getTotalPoints() >= present.points);
    var pointsRequired = present.points; 
    var convert = true;

    var lblTitle = Ti.UI.createLabel({
        text : present.title,
        top : 10,
        color : 'black',
        font : {fontSize : 20, fontWeight : 'bold'}
    });
    view.add(lblTitle);
    
    var img = Ti.UI.createImageView({
        top : 40, 
        height : 150,
        width : 150
    });
    view.add(img);
    Image.cacheImage(present.getPhotoUrl(0), function(image) {
        img.setImage(image); 
    });
    
    var lblDetails = Ti.UI.createLabel({
        text : present.desc,
        left : 5, 
        right : 5,
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER, 
        top : img.top + img.height + 10,
        color : 'gray',
        font: {fontSize : 14, fontWeight : 'normal'}
    });
    view.add(lblDetails);

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
    view.add(lblConditions);
    
    var lblPoints = Ti.UI.createLabel({
        bottom : 60,
        color : '#d92276',
        font : {fontSize : 14},
        height : 18
    });
    view.add(lblPoints);
    
    var bt = Ti.UI.createButtonBar({
        bottom : 10,
        backgroundColor:'#d92276',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height:25,
        width : '70%'
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
                        alert("Votre bon cadeau vous sera envoyé par email dans un délai de 15 jours maximum !");
                        niceClose();
                    });
                }
            });
            dlg.show();
        } else {
            niceClose(displayMorePoints);
        }
    });
    
    view.update = function(totalPoints) {
        if(pointsRequired <= totalPoints || (totalPoints - pointsRequired) >= 1000) {
            convert = true;
            lblPoints.setText(pointsRequired + ' steps');
            bt.setLabels([{title:'Echanger ce cadeau'}]);
            bt.setBackgroundColor('#d92276');
        } else {
            convert = false;
            lblPoints.setText('Il vous manque ' + (pointsRequired - totalPoints) + ' steps');
            bt.setLabels([{title:'Gagner plus de points'}]);
            bt.setBackgroundColor('#dedede');
        }
    };
    
    view.update(user.getTotalPoints());
    
    var btClose = Ti.UI.createButton({
        image : '/images/close.png',
        top : 5,
        right : 5
    });
    view.add(btClose);
    
    btClose.addEventListener('click', function(e) {
        niceClose();
    });
    self.add(view);
    
    self.addEventListener('open', function() {
        var t2 = Ti.UI.create2DMatrix({scale : 1});
        var a = Ti.UI.createAnimation({transform : t2, top: 20, left : 20, duration : 500});
        view.animate(a); 
    });
    
    self.addEventListener('open', function(e) {
        Ti.App.testflight.passCheckpoint("View detail of a present : " + present.inspect());
    });
    return self;
}

module.exports = PresentDetailWindow;
