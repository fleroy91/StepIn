// 
//  ScanListWindow.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-18.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require('/etc/AppImage');

function ScanListWindow(shop, tabGroup) { 'use strict';
    var self = Ti.UI.createWindow({
        barImage : '/images/topbar.png',
        barColor : 'black',
        backgroundColor : '#f0f0f0'
    });
    
    var header = shop.createHeader(false);
    self.add(header);    
    
    shop.addOverHeader(self, tabGroup, false);
    
    function createScanView(scan) {
        var v = Ti.UI.createButton({
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            width : 142,
            height : 170
        });
        
        var img = Ti.UI.createImageView({
            borderWidth : 0,
            height : 100, 
            width : 100,
            top : 2
        });
        Image.cacheImage(scan.getPhotoUrl(0), function(image) {
            img.setImage(image); 
        });
        v.add(img);
        
        var lbl1 = Ti.UI.createLabel({
            text : scan.title,
            top : 105,
            height : 15,
            color : 'blue',
            font : {fontSize : 11, fontWeight : 'bold'}
        });
        v.add(lbl1);
        var lbl2 = Ti.UI.createLabel({
            text : scan.desc,
            top : lbl1.top + lbl1.height,
            left : 2, right : 2,
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER, 
            height : 25,
            color : 'gray',
            font : {fontSize : 9, fontWeight : 'normal'}
        });
        v.add(lbl2);
        
        var vPoints = Image.createPointView(scan.points, 30, Ti.UI.FILL, scan.scanned);
        vPoints.top = 140;
        vPoints.width = Ti.UI.FILL;
        vPoints.right = 40;
        v.add(vPoints);
        v.addEventListener('click', function(e) {
            var ScanDetailWindow = require("/ui/common/ScanDetailWindow"),
                swin = new ScanDetailWindow(scan, tabGroup, {canScan : shop.checkin && ! scan.scanned});
            swin.addEventListener('close', function(e) {
                if(e.source.object) {
                    // The object was scanned
                    scan = e.source.object;
                    var newView = Image.createPointView(scan.points, 30, Ti.UI.FILL, scan.scanned);
                    newView.top = vPoints.top;
                    newView.right = vPoints.right;
                    newView.backgroundColor = 'white';
                    v.add(newView);
                    vPoints.animate({view : newView, duration : 500}, function(e) {
                        vPoints.visible = false;
                    });
                    shop.setScan(scan);
                }
            });
                
            tabGroup.openWindow(null, swin, {animated:true});
        });
        return v;
    }
    
    var i, data = [], scans = shop.scans;
    for(i = 0; i < scans.length; i++) {
        data.push(createScanView(scans[i]));
    }
    var BigScrollView = require("ui/common/BigScrollView"),
        bsv = new BigScrollView({data : data, top : header.height - 10}, 142, 170);
    self.add(bsv);
   
    tabGroup.createTitle(self, "Scans");
   
    return self;
}

module.exports = ScanListWindow;
