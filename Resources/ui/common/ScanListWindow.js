// 
//  ScanListWindow.js
//  StepIn
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-18.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require('/etc/AppImage');

function ScanListWindow(shop, tabGroup) { 'use strict';
    var self = Ti.UI.createWindow({
        barColor : 'black'
    });
    
    var sheader = Ti.UI.createView({
        height : 40,
        top : 0,
        backgroundColor : '#d92276'
    });
    var lbl = Ti.UI.createLabel({
        text : "Scannez ces articles :",
        top : 2,
        left : 2,
        color : 'white',
        font : {fontSize : '15', fontWeight : 'normal'},
        textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
        height : 40
    });
    sheader.add(lbl);
    self.add(sheader);

    var tv = Ti.UI.createTableView({
        scrollable : true,
        allowsSelection : false,
        top : 40,
        separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.NONE
    });
    
    function createScanView(scan) {
        var v = Ti.UI.createButton({
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            width : '50%',
            height : 170,
            borderRadius : 0,
            borderWidth : 1,
            borderColor : '#e0e0e0'
        });
        
        var img = Image.createImageView('read', scan.getPhotoUrl(0), null, { borderWidth : 0,height : 100, width : 100});
        img.top = 2;
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
        /*
        var bt = Ti.UI.createButtonBar({
            labels : [scan.points],
            top : lbl2.top+lbl2.height+5,
            backgroundColor:'#d92276',
            backgroundImage : '/images/stepin-star.png',
            style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
            height:30,
            object : scan,
            width : '80%'
        });
        v.add(bt);
        v.bt = bt;
        */
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
                    newView.backgroundColor = '#f0f0f0';
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
    
    function createRow(scans, index1, index2) {
        var row = Ti.UI.createTableViewRow({
            className : 'scanRow',
            backgroundColor : 'white'
        });
        
        var p1 = scans[index1];
        var v1 = createScanView(p1);
        v1.left = 0;
        row.add(v1);
        row.bt1 = v1.bt;
        row.p1 = p1;
        
        if(index2 < scans.length) {
            var p2 = scans[index2];
            var v2 = createScanView(p2);
            v2.right = 0;
            row.add(v2);
            row.p2 = p2;
            row.bt2 = v2.bt;
        }
        return row;
    }
    var i, data = [], scans = shop.scans;
    for(i = 0; i < scans.length; i+=2) {
        data.push(createRow(scans, i, i+1));
    }
    tv.setData(data);
    
    self.add(tv);
   
    tabGroup.createTitle(self, "Scans");
   
    return self;
}

module.exports = ScanListWindow;
