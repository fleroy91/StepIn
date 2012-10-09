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
    
    var actions = [
        {title : 'Partager sur FB', image : '/images/171-sun.png', points : 150},
        {title : 'Partager sur Twitter', image : '/images/171-sun.png', points : 100},
        {title : 'Inviter vos amis', image : '/images/people_family.png', points : 500},
        {title : 'Réussir des missions', image : '/images/169-8ball.png', points : 250}
    ];

    function createRow(options) {
        var row = Ti.UI.createTableViewRow(options);
        row.height = 44;
        
        var img = Image.createImageView('read', options.image, null, {noEvent : true, borderWidth : 0, left : 2, top : 2, width : 40, height : 40});
        row.add(img);
        
        var lbl = Ti.UI.createLabel({
            left : 44,
            top : 2,
            font : {fontSize : 14},
            text : options.title,
            width : 220
        });
        row.add(lbl);
        
        var pt = Image.createPointView(options.points, 40, 40);
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
       data : data
    });
    self.add(tv);
    
    return self;
}

module.exports = MorePointsWindow;