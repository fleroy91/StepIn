// 
//  ShopFormView.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
// Parameters :
// - options : graphical options (like top, height, etc...)
// - object : the object to create or update - we will call save, create, getFormPhotoFields, getFormFields, getField[id], setField[id], validate
// - CRUD : create | update | read 
// object.getPhotoFields will return the list of photo fields (ordered)
// object.getFormFields will return the list of fields to manage (ordered)
// object.getFormFieldOption[id] will return :
// - title (in the label) (if null, NO label)
// - hint
// - [keyboardType]
// - [pickerOptions] : [array of values] --> if picker options, then the text field is not enabled
var Image = require("/etc/Image");
var Geoloc = require("/etc/Geoloc");
var Tools = require("/etc/Tools");
var AppUser = require("/model/AppUser");

function ShopFormView(win, crud, object, tabG, extra) { 'use strict';
    var update = (crud === 'update');
    var create = (crud === 'create');
    var read = (crud === 'read');
    
    var tabGroup = tabG;
    
    var buttonHeight = 30;
    
    var imgs = [];
    var tfs = [];
    
    var header = null;
    var footer = Ti.UI.createView({height : 10});

    // We define all the buttons !
    var cibutton = Ti.UI.createButtonBar({
        labels : ["1 - Je Step-In (" + object.getPoints('stepin') + " pts)"],
        width:200,
        backgroundColor : "#336699",
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : buttonHeight
    });
    function createNewReward(user, shop, points, action) {
        // We create a reward
        var Reward = require("model/Reward"),
            rew = new Reward();
        rew.setUser(user);
        rew.setShop(shop);
        rew.setNbPoints(points);
        rew.setActionKind(action);
        tabGroup.addNewReward(rew, true);
        shop.checkin = true;
        win.updateView(object);
    }
    cibutton.addEventListener('click', function(e) {
        // we check the coordinates to verify that the user is at the same place as the object's shop
        var AppUser = require("model/AppUser"),
            user = AppUser.getCurrentUser();
        user.geolocalize(function(obj) {
            if(obj) {
                var shoploc = object.getLocation();
                var userloc = obj.getLocation();
                var dist = Math.round(Geoloc.computeDistance(shoploc.lat, shoploc.lng, userloc.lat, userloc.lng) / 5) * 5;
                var bCreate = false;
                if(dist <= 5) {
                    createNewReward(obj, object, object.getPoints('stepin'), 'Step-In');
                } else {
                    var dlg = Ti.UI.createAlertDialog({
                        title : "Trop loin !",
                        message : "Vous êtes à " + dist + " mètres de la boutique !\nRapprochez-vous !",
                        buttonNames : ['Step-in malgré tout !', 'Annuler']
                    });
                    dlg.addEventListener('click', function(e) {
                        if(e.index === 0) {
                            createNewReward(obj, object, object.getPoints('stepin'), 'Step-In');
                        }
                    });
                    dlg.show();
                }
            }
        });
    });
    var scanbutton = Ti.UI.createButtonBar({
        labels : ["Scan"],
        width:200,
        backgroundColor : "pink",
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : buttonHeight
    });
    var TiBar = require('tibar');
 
    Ti.API.info("module is => " + TiBar);
    // Configuration
    // VC - ZBarReaderViewController
    // C - ZBarReaderController
    //
    var config = {
        classType : "ZBarReaderViewController", // ZBarReaderViewController, ZBarReaderController
        sourceType : "Camera", // Library(C), Camera(VC), Album(C)
        cameraMode : "Default", // Default, Sampling, Sequence
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
    
    scanbutton.addEventListener('click', function(e) {
        TiBar.scan({
            configure: config,
            success:function(data){
                Ti.API.info("TiBar success callback ! Barcode: " + data.barcode + " Symbology:"+data.symbology);
                if(data && data.barcode){
                    // We need to find the article in the DB
                    object.newObjectScanned(data.barcode, tabGroup);
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
    
    
    var cobutton = Ti.UI.createButtonBar({
        labels : ["2 - Je Step-Out (" + object.getPoints('stepout') + " pts)"],
        width:200,
        backgroundColor : "pink",
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : buttonHeight
    });
    cobutton.addEventListener('click', function(e) {
        var AppUser = require("model/AppUser"),
            user = AppUser.getCurrentUser();
        var Review = require("/model/Review"),
            rev = new Review();
        rev.setUser(user);
        rev.setShop(object);
        
        var ShopFormWindow = require("/ui/common/FormWindow"),
            newWin = new ShopFormWindow({ title : "Step-out" }, 'create', rev, tabGroup, null);
        newWin.addEventListener('close', function(e) {
            if(e.source.object) {
                win.close({animated:true});
            }
        });
        tabGroup.activeTab.open(newWin, {animated:true}); 
    });
    var geobutton = Ti.UI.createButtonBar({
        labels : ['Localiser'],
        width:200,
        backgroundColor:'#336699',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : buttonHeight,
        object : object
    });
    
    geobutton.addEventListener('click', function(e) {
        e.source.object.geolocalize(function(obj) {
            if(obj) {
                // We need to refresh the fields
                var i;
                for (i = 0; i < tfs.length; i++) {
                    tfs[i].setValue(obj.getField(tfs[i].id));
                }
            } 
        });
    });
    
    // Manage photos
    var photos = object.getFormPhotoFields();
    if (photos) {
        header = Ti.UI.createView();
        var nbPhotos = (read ? object.getNbPhotos() : photos.length);
        var photoWidth = 70;
        var viewWidth = Ti.Platform.displayCaps.platformWidth;
        var spaceSize = (viewWidth - nbPhotos * photoWidth) / (nbPhotos + 1); 
        var nleft = spaceSize;
        
        // We align on the left !
        if(nbPhotos === 1) {
            nleft = 2;
        }
        
        var imgsView = Titanium.UI.createView({
            left : 0,
            top : 2,
            height : photoWidth,
            backgroundColor : 'transparent'
        });

        var i;
        var defaultFilename = Titanium.Filesystem.applicationDataDirectory + "/" + object.getCloudType() + "_default.png";
        for ( i = 0; i < nbPhotos; i++) {
            var pid = photos[i];

            var img = Image.createImageView(crud, object.getNthPhotoUrl(i), defaultFilename,
                {id:pid, top:0, left:nleft, height:photoWidth, width:photoWidth, noEvent : (read && nbPhotos > 1)});
            // Warning : the real img is included in the view 
            imgs.push(img.img);
            imgsView.add(img);
            if (nleft) {
                nleft += photoWidth + spaceSize;
            }
        }
        header.add(imgsView);
        
        if(read && nbPhotos > 1) {
            imgsView.addEventListener('click', function(e) { Image.displayViewZoomMany(imgs); });
        }
        header.height = photoWidth + 5;
    }
    
    if(extra) {
        if(extra.addLocalizationButton) {
            footer.add(geobutton);
            footer.height = geobutton.height + 5;
        }
    }
    if(object.checkin) {
        header.height += scanbutton.height + 5;
        scanbutton.bottom = 2;
        header.add(scanbutton);
    }

    var tv = null;
    if(read) {
        tv = object.createReadView(header, footer, tabGroup);
        tv.currentObject = object;
    } else {
        // Manage fields
        var fields = object.getFormFields(read);
        if (fields) {
            // TODO : add a button bar for Next / Prev and Ok (see HockeyApp screenshot)
            
            tv = Ti.UI.createTableView({
                scrollable : true,
                headerView : header,
                footerView : footer,
                style : Titanium.UI.iPhone.TableViewStyle.GROUPED
            });
            tv.currentObject = object;
    
            var data = [], j;
            var nbFields = fields.length;
            for ( j = 0; j < nbFields; j++) {
                var options = fields[j];
                var id = options.id;
    
                var row = Ti.UI.createTableViewRow({
                    height : 37
                });
                var nleft2 = 5;
                var withPicker = (!!options.pickerOptions);
    
                if (options.title) {
                    var lbl = Ti.UI.createLabel({
                        text : options.title,
                        left : nleft2,
                        height : 37,
                        width : 80,
                        textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                        color : 'black',
                        font : {
                            fontSize : 13,
                            fontWeight : 'bold'
                        }
                    });
                    row.add(lbl);
                    nleft2 = 100;
                }
    
                var tf = null;
                if(options.boolField) {
                    options.height = 35;
                    options.width = 190;
                    options.id = id;
                    options.right = 10;
                    options.value = options.value || true; 
                    tf = Ti.UI.createSwitch(options);
                } else if(options.starField) {
                    options.left = nleft2;
                    options.height = 35;
                    options.width = 190;
                    options.id = id;
                    var StarView = require("/ui/common/StarView");
                    tf = new StarView(options);
                } else {
                    tf = Titanium.UI.createTextField({
                        left : nleft2,
                        height : 35,
                        width : 190,
                        color : 'gray',
                        font : {
                            fontSize : 13
                        },
                        id : id,
                        hintText : options.hint,
                        value : (options.value || tv.currentObject.getField(id)),
                        backgroundColor : 'white',
                        enabled : (!withPicker),
                        keyboardToolbar : false
                    });
                    var key;
                    for(key in options) {
                        if(options.hasOwnProperty(key)) {
                            tf[key] = options[key];
                            // Adding events
                            if(key === 'events') {
                                var ev;
                                for(ev in options[key]) {
                                    if(options[key].hasOwnProperty(ev)) {
                                        tf.addEventListener(ev, options[key][ev]);
                                    }
                                }
                            }
                        }
                    }
                    if(! read) {
                        if (withPicker) {
                            tf.addEventListener('click', win.addPicker);
                        } else {
                            tf.addEventListener('focus', win.removePicker);
                        }
                    }
                }
                tfs.push(tf);
                row.add(tf);
                row.tf = tf;
                data.push(row);
            }
            tv.setData(data);
        }
    }
    // End of processing
    // Buttons
    if(!read) {
        var okButton = Ti.UI.createButton({
            title : 'Ok'
        });
        win.setRightNavButton(okButton);
        
        okButton.addEventListener('click', function(e) {
            var i;
            var savObject = tv.currentObject.getJSON(),
                obj = tv.currentObject;
            for ( i = 0; i < tfs.length; i++) {
                var tf = tfs[i];
                var value = tf.getValue() || tf.value;
                obj.setField(tf.id, value);
            }
            // Image management
            for ( i = 0; i < imgs.length; i++) {
                if(imgs[i].changed) {
                    var blob = Tools.getImageBlob(imgs[i]);
                    obj.setPhoto(i, blob);
                }
            }
            if(obj.validate()) {
                if (update) {
                    obj.save(win.closeAfter);
                } else if(create) {
                    obj.create(win.closeAfter);
                }
            } else {
                obj.init(savObject);
                tv.currentObject = obj;
            }
        });

    }
    
    // We try to add some gradient
    tv.backgroundGradient = {
        type: 'linear',
        startPoint: { x: '0%', y: '0%' },
        endPoint: { x: '0%', y: '100%' },
        colors: [ { color: '#dbc3d0', offset: 0.0}, { color: '#dac2cf', offset: 1.0 } ]
    };

    tv.top = 0;
    tv.addEventListener('click', win.hideKeyboard);
    tv.runTimer = function() {
        if(read) {
            var section = tv.getData();
            if(section) {
                var row = section[0].getRows()[0];
                row = row.object.updateRow(row);
                tv.updateRow(0, row);
            }    
        }
    };
    tv.blurTfs = function() {
        var i;
        for ( i = 0; i < tfs.length; i++) {
            if(! tfs[i].picker && tfs[i].blur) {
                tfs[i].blur();
            }
        }
    };

    tv.imgs = imgs;
    return tv;
}

module.exports = ShopFormView;