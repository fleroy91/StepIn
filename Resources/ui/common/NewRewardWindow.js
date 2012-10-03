// 
//  NewRewardWindow.js
//  StepInShopApp
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-02.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

// Parameters : args.title, args.details, args.nb_points
function NewRewardWindow(args) { 'use strict';
    var t = Titanium.UI.create2DMatrix();
    t = t.scale(0);

    var self = Ti.UI.createWindow({
        modal : true,
        modalStyle : Titanium.UI.iPhone.MODAL_PRESENTATION_PAGESHEET,
        modalTransitionStyle :  Titanium.UI.iPhone.MODAL_TRANSITION_STYLE_CROSS_DISSOLVE,
        navBarHidden : true,
        backgroundColor : '#fff'
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
        top : 60 
    });
    var widthOfCentaine = 80;
    var widthOfDizaine = 50;
    var nleft = 5;
    
    function createPointView(points, width, left) {
        var pv = Ti.UI.createView({
            width : width,
            height : width,
            left : left
        });
        
        var img = Ti.UI.createImageView({
            image : '/images/stepin.png',
            width : width,
            height : width,
            left : 0,
            top : 0
        });
        pv.add(img);
        
        var lbl = Ti.UI.createLabel({
            text : points,
            top : width / 3,
            left : width / 2,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            font : {fontSize : (points > 100 ? 12 : 10), fontWeight : 'bold'},
            color : 'black'
        });
        pv.add(lbl);
        
        return pv;
    }
    
    for(i = 0; i < nbCentaines; i++) {
        v = createPointView(100, widthOfCentaine, nleft);
        nleft += v.width + 5;
        view.add(v);
    }
    v = createPointView(nbDizaines, widthOfDizaine, nleft);
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
        Ti.Media.vibrate();
    });
    
    return self;
}

module.exports = NewRewardWindow;
