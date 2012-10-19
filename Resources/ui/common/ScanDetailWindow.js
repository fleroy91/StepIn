// 
//  ScanDetailWindow.js
//  StepIn
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-18.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Tools = require("/etc/Tools");
var Image = require("/etc/AppImage");

function ScanDetailWindow(scan, tabGroup, args) { 'use strict';
    var self = Ti.UI.createWindow({
        backgroundColor : '#d92276'
    });
    
    var canScan = args.canScan;
    
    var view = scan.createReadView(tabGroup);
    view.top = 0;
    
    // We display the picture of the scan instead of the scan
    view.top = 0;
    var img = Ti.UI.createView({
        top : view.height - 5
    });
    self.add(img);
    self.add(view);
    Image.cacheImage(scan.getPhotoUrl(0), function(image) {
        img.setBackgroundImage(image); 
    });
    function launchScan() {
        var TiBar = require("tibar");
        
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
                "showsHelpOnFail" : true,
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
                backgroundImage : "/images/scanner.png"
            });
            
            var view2 = scan.createReadView(tabGroup);
            view2.top = 0;
            view2.zIndex = 200;

            overlayView.add(view2);
            
            self.addEventListener('open', function(e) {
                TiBar.scan({
                    configure: config,
                    overlay : overlayView, 
                    success:function(data){
                        if(data && data.barcode){
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
            });
        }
    }
    
    if(canScan) {
        var btScan = Ti.UI.createButtonBar({
            labels : ['Scanner le produit'],
            style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
            backgroundColor : 'green',
            height : 35,
            width : '70%',
            bottom : 10
        });
        self.add(btScan);
        btScan.addEventListener('click', launchScan);
        
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
            launchScan();
        }

    }

    tabGroup.createTitle(self, "Scan");
    
    return self;
}

module.exports = ScanDetailWindow;
