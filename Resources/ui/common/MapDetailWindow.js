// 
//  MapDetailWindow.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-12.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, TV : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var AppUser = require("/model/AppUser");

function MapDetailWindow(shop) { 'use strict';
    var self = Ti.UI.createWindow({
        backgroundColor : '#f0f0f0',
        barImage : '/images/topbar-stepin.png',
        barColor : 'black'
    });
    
    var shoploc = shop.location;
    var region = {latitude: shoploc.lat,longitude:shoploc.lng,latitudeDelta:0.01, longitudeDelta:0.01, regionFit:false},
        user = AppUser.getCurrentUser();

    if(user.location) {
        var userloc = user.location;
        var w = Math.abs(shoploc.lat - userloc.lat);
        var h = Math.abs(shoploc.lng - userloc.lng);
        region.latitudeDelta = w * 1.15;
        region.longitudeDelta = h * 1.15;
    }
    var m = Ti.Map.createView({
        mapType: Titanium.Map.STANDARD_TYPE,
        animate:true,
        userLocation:false,
        region : region,
        location : region
    });
    self.add(m);
    
    self.addEventListener('open', function(e) {
        // We add the annotations of the mapview
        var annotation = shop.createAnnotation();
        m.addAnnotation(annotation);
        m.selectAnnotation(annotation);    
        m.setUserLocation(true);
    });
    
    self.addEventListener('blur', function(e) {
        m.setUserLocation(false);
    });
    self.addEventListener('close', function(e) {
        m.setUserLocation(false);
    });
    self.addEventListener('focus', function(e) {
        m.setUserLocation(true);
    });
    return self;
}

module.exports = MapDetailWindow;
