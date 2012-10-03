// 
//  ShopFormView.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
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

    Ti.include("etc/image.js");
    
    // We define all the buttons !
    var article = object;
    var booked = (article.isBooked && article.isBooked());
    var booking = Ti.UI.createButtonBar({
        labels : [(booked ? "J'annule" : "1 - Je réserve")],
        do_booking : (!booked), 
        backgroundColor : (booked ? "red" : "green"),
        object : article,
        width : 200,
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : buttonHeight,
        win : win
    });
    booking.addEventListener('click', function(e) {
        var article = e.source.object;
        tabGroup.toggleBooking(article, e.source.do_booking, win.updateView);
    }); 
    var cibutton = Ti.UI.createButtonBar({
        labels : ["2 - Je Step-In (+250 pts)"],
        width:200,
        backgroundColor : "#336699",
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : buttonHeight
    });
    cibutton.addEventListener('click', function(e) {
        // we check the coordinates to verify that the user is at the same place as the article's shop
        var AppUser = require("model/AppUser"),
            user = AppUser.getCurrentUser();
        user.geolocalize(function(obj) {
            if(obj) {
                var shoploc = article.shop.getLocation();
                var userloc = obj.getLocation();
                var dist = Geo.computeDistance(shoploc.lng, shoploc.lat, userloc.lng, userloc.lat);
                if(dist < 0.010) {
                    // We create a reward
                    var Reward = require("model/Reward"),
                        rew = new Reward();
                    rew.setUser(obj);
                    rew.setShop(article.shop);
                    rew.setNbPoints(250);
                    rew.setActionKind("Step-in");
                    tabGroup.addNewReward(rew, true);
                    article.checkin = true;
                    win.updateView(article);
                } else {
                    alert("Nous n'arrivons à vous localiser dans le magasin !");
                }
            }
        });
    });
    var cobutton = Ti.UI.createButtonBar({
        labels : ["3 - Je Step-Out (+250 pts)"],
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
        rev.setShop(article.shop);
        
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
        var photoWidth = 90;
        var viewWidth = Ti.Platform.displayCaps.platformWidth;
        var spaceSize = (viewWidth - nbPhotos * photoWidth) / (nbPhotos + 1); 
        var nleft = spaceSize;
        
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
        if(extra.addBooking) {
            // We are managing an article
            // 3 states : unbooked, booked but no CI, booked and CI
            if(! article.isBooked()) {
                booking.bottom = 2;
                header.add(booking);
                header.height += booking.height + 5;
            } else {
                // We need to add the cancel button (ie. the booking button in the footer)
                footer.add(booking);
                footer.height = booking.height + 5;
                
                // For the header : CI or OC
                if(article.isCheckin()) {
                    cobutton.bottom = 2;
                    header.add(cobutton);
                    header.height += cobutton.height + 5;
                } else {
                    cibutton.bottom = 2;
                    header.add(cibutton);
                    header.height += cibutton.height + 5;
                }
            }
        }
    }

    var tv = null;
    if(read) {
        tv = object.createReadView(header, footer);
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

    tv.top = 0;
    tv.addEventListener('click', win.hideKeyboard);
    
    tv.runTimer = function() {
        if(read) {
            var booked = tv.currentObject.isBooked && tv.currentObject.isBooked();
            if(booked) {
                var section = tv.getData();
                if(section) {
                    var row = section[0].getRows()[0];
                    row = row.object.updateRow(row);
                    tv.updateRow(0, row);
                }    
                if(tv.currentObject.stillBooked() !== booked) {
                    win.updateView();
                }
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