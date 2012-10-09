// 
//  MorePointsWindow.js
//  StepIn
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-09.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/Image");

function MorePointsWindow(args) {'use strict';
    var self = Ti.UI.createWindow(args);
    self.backgroundColor = '#f0f0f0';

    var sheader = Ti.UI.createView({
        height : 40,
        top : 0,
        backgroundColor : '#d92276'
    });
    var lbl = Ti.UI.createLabel({
        text : "Gagnez plus de points avec ces actions :",
        top : 2,
        left : 2,
        color : 'white',
        font : {fontSize : '15', fontWeight : 'normal'},
        textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
        height : 40
    });
    sheader.add(lbl);
    self.add(sheader);

    var actions = [
        {title : 'Partager sur FB', image : '/images/facebook.png', points : 150},
        {title : 'Partager sur Twitter', image : '/images/twitter.png', points : 100},
        {title : 'Inviter vos amis', image : '/images/people_family.png', points : 500},
        {title : 'Réussir des missions', image : '/images/169-8ball.png', points : 250}
    ];

    function createRow(options) {
        var row = Ti.UI.createTableViewRow({});
        row.height = 50;
        
        var img = Image.createImageView('read', options.image, null, {noEvent : true, borderWidth : 0, left : 2, top : 2, width : 40, height : 40});
        row.add(img);
        
        var lbl = Ti.UI.createLabel({
            left : 48,
            top : 2,
            font : {fontSize : 14},
            color : '#4d4d4d',
            text : options.title,
            width : 220
        });
        row.add(lbl);
        
        var pt = Image.createPointView(options.points, 40, 80);
        pt.right = 2;
        row.add(pt);
        return row;
    }
    
    var i, data = [];
    for(i = 0;i < actions.length; i++) {
        var row = createRow(actions[i]);
        data.push(row);
    }

    var tv = Ti.UI.createTableView({
       data : data,
       top : 40
    });
    self.add(tv);
    
    return self;
}

module.exports = MorePointsWindow;