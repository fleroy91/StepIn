// 
//  ScanDetailWindow.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-18.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Tools = require("/etc/Tools");
var Image = require("/etc/AppImage");

function ScanDetailWindow(scan, tabGroup, args) { 'use strict';
    var self = Ti.UI.createWindow({
        backgroundColor:'#f0f0f0'
    });
   
    var canScan = args && args.canScan;
    
    var view = scan.createHeaderView();
   
    // We display the picture of the scan instead of the scan
    view.top = 0;
    var img = Ti.UI.createView({
        top : view.height - 7,
        width:300,
        height:300
    });
   
    self.add(img);
     
    self.add(view);
    //self.add(PinkBanner);
    Image.cacheImage(scan.getPhotoUrl(0), function(image) {
        img.setBackgroundImage(image); 
    });
    
    scan.addOverHeader(self);
    
    var TiBar = require("tibar");
    function launchScan() {
        // Configuration
        // VC - ZBarReaderViewController
        // C - ZBarReaderController
        //
        var config = {
            classType : "ZBarReaderViewController", // ZBarReaderViewController, ZBarReaderController
            sourceType : "Camera", // Library(C), Camera(VC), Album(C)
            cameraMode : "Sampling", // Default, Sampling, Sequence
            config : {
                "showsCameraControls" : true, // (VC)
                "showsZBarControls" : true,
                "tracksSymbols" : true,
                "enableCache" : true,
                "showsHelpOnFail" : false,
                "takesPicture" : false
            },
            custom : {// not implemented yet
                "scanCrop" : '',
                "CFG_X_DENSITY" : '',
                "CFG_Y_DENSITY" : '',
                "continuous" : ''
            },
            symbol : {
                "QR-Code" : true,
                "CODE-128" : false,
                "CODE-39" : false,
                "I25" : false,
                "DataBar" : false,
                "DataBar-Exp" : false,
                "EAN-13" : true,
                "EAN-8" : false,
                "UPC-A" : false,
                "UPC-E" : false,
                "ISBN-13" : false,
                "ISBN-10" : false,
                "PDF417" : false
            }
        };
        if(! Tools.isSimulator()) {
            var overlayView = Ti.UI.createView({
                backgroundImage : "/images/scanner.png",
                zIndex : 999,
                width : Ti.Platform.displayCaps.platformWidth,
                height : Ti.Platform.displayCaps.platformHeight
            });
            
            var viewH = scan.createHeaderView();
            viewH.top = 0;            
            overlayView.add(viewH);

            scan.addOverHeader(overlayView);
            var image = overlayView.toImage(null, true);
            
            var overlayImgView = Ti.UI.createImageView({image : image, zIndex : 999});            
            
            TiBar.scan({
                configure: config,
                overlay : overlayImgView, 
                success:function(data)
                {
                    if(data && data.barcode)
                    {
                        Ti.API.info("TiBar success callback ! Barcode: " + data.barcode + " Symbology:"+data.symbology);
                        // We need to find the article in the DB
                        if(scan) {
                            scan.newObjectScanned(data.barcode, tabGroup, function(obj) {
                                self.object = obj;
                                self.close({animated:true});
                            });
                        }
                    }
                },
                cancel:function(){
                    Ti.API.info('TiBar cancel callback!');
                },
                error:function(){
                    Ti.API.info('TiBar error callback!');
                }
            });
        }
    }
    
    var btScan = Ti.UI.createButton({
        image : "/images/tag.png",
        style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        backgroundColor : 'white',
        borderColor : Ti.App.PinkColor,
        borderWidth : 1,
        borderRadius : 2,
        height : 35,
        width : 35,
        bottom : 10,
        left : 10,
        zIndex : 10000
    });
    btScan.addEventListener('click', function(e) {
        if(canScan) {
            launchScan();
        } else {
            // TODO : replace by a nice window
            alert("Vous devez d'abord faire un Step-In dans la boutique pour pouvoir scanner des articles !");
        }
    });
    // self.add(btScan);
    
    if(canScan) {
        if(Tools.isSimulator()) {
            var bt = Ti.UI.createButtonBar({
                labels : ["Simuler Scan OK"],
                color : 'red',
                height : 35,
                width : 200,
                bottom : 50 
            });
            self.add(bt);
            bt.addEventListener('click', function(e) {
                // We need to find the article in the DB
                scan.newObjectScanned(scan.code, tabGroup, function(obj) {
                    self.object = obj;
                    self.close({animated:true});
                });
            });
        } else {
            // We run it immediately
            self.addEventListener('open', launchScan);
        }
    }

    tabGroup.createTitle(self, "Scan");
    
    self.addEventListener('open', function(e) {
        Ti.App.testflight.passCheckpoint("View detail of a scan : " + scan.inspect());
    });
    
    return self;
}

module.exports = ScanDetailWindow;
