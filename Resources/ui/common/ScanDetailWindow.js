// 
//  ScanDetailWindow.js
//  StepIn
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-12.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Tools = require("/etc/Tools");
var Image = require("/etc/AppImage");

function ScanDetailWindow(object, tabGroup, args) { 'use strict';
    var self = Ti.UI.createWindow({
        backgroundColor : '#f0f0f0'
    });
    
    var canScan = args.canScan;
    
    var view = object.createReadView(tabGroup);
    view.top = 0;
    
    if(canScan) {
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
        if(Tools.isSimulator()) {
            self.add(view);
            var bt = Ti.UI.createButtonBar({
                labels : ["Simuler Scan OK"],
                height : 35,
                width : 200,
                top : 150 
            });
            self.add(bt);
            bt.addEventListener('click', function(e) {
                // We need to find the article in the DB
                object.newObjectScanned(object.code, tabGroup, function(obj) {
                    self.object = obj;
                    self.close({animated:true});
                });
            });
        } else {
            var overlayView = Ti.UI.createView({
                backgroundImage : "/images/scanner.png"
            });
            
            // We need to create a nav bar
            var btBack = Ti.UI.createButtonBar({
                labels : ['Retour'],
                height : 35,
                backgroundColor : 'black'
            });
            btBack.addEventListener('click', function(e) {
                alert("On click ici pour fermer mais ça ne marche pas encore !");
                Ti.UI.currentWindow.close();
                self.object = null;
                self.close({animated:true}); 
            });
            
            var fb = Ti.UI.createButton({
                systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
            });
            
            var btPoints = tabGroup.createPointsButton();
            
            var navBar = Ti.UI.iOS.createToolbar({
               items : [btBack, fb, btPoints],
               height : 40,
               top : 0,
               backgroundColor : 'black' 
            });
            overlayView.add(navBar);
            view.top = 40;
            view.left = 0;
            overlayView.add(view);
            
            self.addEventListener('open', function(e) {
                TiBar.scan({
                    configure: config,
                    overlay : overlayView, 
                    success:function(data){
                        if(data && data.barcode){
                            Ti.API.info("TiBar success callback ! Barcode: " + data.barcode + " Symbology:"+data.symbology);
                            // We need to find the article in the DB
                            if(object) {
                                object.newObjectScanned(data.barcode, tabGroup, function(obj) {
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
    } else {
        // We display the picture of the object instead of the scan
        view.top = 0;
        var img = Ti.UI.createView({
            top : view.height
        });
        self.add(img);
        self.add(view);
        Image.cacheImage(object.getPhotoUrl(0), function(image) {
            img.setBackgroundImage(image); 
        });
        tabGroup.createTitle(self);
    }
    return self;
}

module.exports = ScanDetailWindow;
