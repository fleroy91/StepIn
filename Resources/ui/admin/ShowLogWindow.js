// 
//  ShowLogWindow.js
//  StepIn
//  
//  Created by Damien Bigot on 2013-01-07.
//  Copyright 2013 Damien Bigot. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

function ShowLogWindow(tabGroup, shop, scans) { 'use strict';
        
    var self = Ti.UI.createWindow({ 
        title : 'Mes logs', 
        backgroundColor : '#ffffff',
        barImage : '/images/topbar-stepin.png',
        barColor : 'black'
    });
    
    
    return self;
}

module.exports = ShowLogWindow;