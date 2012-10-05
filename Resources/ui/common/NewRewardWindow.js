// 
//  NewRewardWindow.js
//  StepInShopApp
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-02.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/Image");

// Parameters : args.title, args.details, args.nb_points
function NewRewardWindow(args) { 'use strict';
    var t = Titanium.UI.create2DMatrix();
    t = t.scale(0);

    var self = Ti.UI.createWindow({
        navBarHidden : true,
        backgroundImage : '/iphone/Default.png',
        width : '90%',
        height : '80%',
        zIndex : 10,
        borderRadius : 5,
        borderColor : '#ba307c',
        borderWidth : 2
    });
    
    // create first transform to go beyond normal size
    var t1 = Titanium.UI.create2DMatrix();
    t1 = t1.scale(1.1);
    var animation = Titanium.UI.createAnimation();
    animation.transform = t1;
    animation.duration = 200;

    // when this animation completes, scale to normal size
    animation.addEventListener('complete', function() {
        // Titanium.API.info('here in complete');
        var t2 = Titanium.UI.create2DMatrix();
        t2 = t2.scale(1.0);
        self.animate({
            transform : t2,
            duration : 200
        });
    });

    var title = Ti.UI.createLabel({
        top : 5,
        text : args.title || "Bravo !",
        font:{fontSize : 18, fontWeight : 'bold'}
    });
    
    self.add(title);
    
    var details = Ti.UI.createLabel({
        top : 40,
        width : '80%',
        text : args.details || "Vous venez de gagner de nouveaux points !"
    });
    
    self.add(details);
    
    var nbPoints = args.points;
    var nbCentaines = Math.floor(nbPoints / 100);
    var nbDizaines = nbPoints - 100*nbCentaines;
    var nbImages = nbCentaines + 1;
    var i, v;
    var view = Ti.UI.createView({
        top : 100 
    });
    var widthOfCentaine = 80;
    var widthOfDizaine = 50;
    var nleft = 5;
    
    for(i = 0; i < nbCentaines; i++) {
        v = Image.createPointView(100, widthOfCentaine, widthOfCentaine);
        v.left = nleft;
        nleft += v.width + 5;
        view.add(v);
    }
    v = Image.createPointView(nbDizaines, widthOfDizaine, widthOfDizaine);
    v.left = nleft;
    view.add(v);
    self.add(view);
    
    var button = Ti.UI.createButtonBar({
        labels : ['Ok'],
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 30,
        bottom : 5,
        width : '80%' 
    });
    self.add(button);
    
    button.addEventListener('click', function(e) {
        self.close();
    });
    
    self.animation = animation;
    
    self.addEventListener('open', function(e) {
        // Animate and then vibrate :-)
        self.animate(animation, Ti.Media.vibrate);
    });
    
    return self;
}

module.exports = NewRewardWindow;
