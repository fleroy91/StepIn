// 
//  ShopListWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
// Article.js
// Display tabviews for articles + bookings
/*global Ti: true, Titanium : true, TV : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

// var allArticles = [];
var refresh_all = true;

var TV = require("/etc/AppTV");
var Tools = require("/etc/Tools");
var AppUser = require("/model/AppUser");
var ShopDistance = require("/model/Shop");

function ShopListWindow(args) {
    'use strict';
    var tabGroup = args.tabGroup;
    var self = Ti.UI.createWindow({
        navBarHidden : false,
        backgroundColor : '#ffffff',
        barImage : '/images/topbar-stepin.png',
        barColor : 'white'
    });
    
    var viewList = true;
    var btChangeView =Ti.UI.createButtonBar({
        style : Ti.UI.iPhone.SystemButtonStyle.BAR,
        color : 'black',
        labels : [{image : '/images/switch-map.png'}],
        width : 40,
        height : 27
    });
    self.setLeftNavButton(btChangeView);
    
	function refresh() {
        tabGroup.getAllObjects();
	}
	
	var advertHeight = 0 ; //45;
    var AdvertView = require("ui/common/AdvertView"),
        advertView = new AdvertView(['/images/advert2.png', '/images/advert3.png'], {
            height : advertHeight,
            top : 0,
            backgroundColor : 'white'
    });
	
	var listView = Ti.UI.createView({ top : 0});
    // listView.add(advertView);
    self.advertView = advertView;

    var mapView = null;
    
    function createMapView() {
        if(! mapView) {
            var user = AppUser.getCurrentUser(); 
            var userloc = user.getShopsLocation();
            mapView = Ti.Map.createView({
                mapType : Titanium.Map.STANDARD_TYPE,
                animate : true,
                top : 0,
                userLocation : false,
                zIndex : -1,
                region : {
                    latitude : (userloc ? userloc.lat : 48.33),
                    longitude : (userloc ? userloc.lng : 2.22),
                    latitudeDelta : 0.01,
                    longitudeDelta : 0.01
                }
            });
            self.add(mapView);
        }
    }
	
	var tv = TV.create({ top : advertHeight
	}, refresh);
	tv.separatorStyle = Ti.UI.iPhone.TableViewSeparatorStyle.NONE;
	tv.allowsSelection = false;
	
	listView.add(tv);
	self.add(listView);
    
    var mapViewOk = false;
    var updateMapViewComplete;
    
    function updateMapView() {
        if(mapView) {
            mapViewOk = true;
            Ti.API.info("In update Map View !!!");
            mapView.removeAllAnnotations();
            var section = tv.getData();
            if(section && section.length > 0) {
                var rows = section[0].getRows();
                if(rows) {
                    var i;
                    for(i = 0; i < rows.length; i++) {
                        var obj_index = rows[i].object_index;
                        var obj = AppUser.getShop(obj_index);
                        var ann = obj.createAnnotation(tabGroup);
                        mapView.addAnnotation(ann);
                    }
                }
            }
        }
    }
    
    updateMapViewComplete = function (e) {
        Ti.API.info("In mapview complete");
        mapView.removeEventListener('complete', updateMapViewComplete);
        updateMapView(e);
    };

    btChangeView.addEventListener('click', function(e) {
        if(! mapView) {
            createMapView();
        }
        
        // We change the visible view
        if(mapView) {
            if(viewList) {
                listView.hide();
                mapView.setUserLocation(true);
                if(mapViewOk) {
                    updateMapView();
                } else {
                    mapView.addEventListener('complete', updateMapViewComplete);
                }
                mapView.show();
            } else {
                mapView.hide();
                mapView.setUserLocation(false);
                listView.show();
            }
            viewList = ! viewList;
            btChangeView.setLabels([{image : (viewList ? "/images/switch-map.png" : "/images/switch-list.png")}]);
        }
    });
    
    var labelDistance = Ti.UI.createLabel({
        backgroundImage : '/images/bck-pink-60p.png',
        color : 'white',
        width : 52,
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : { fontSize : 13, fontWeight : 'bold'},
        visible : false,
        right : 10,
       // opacity : 0.9
    });
    self.add(labelDistance);
    
    var rowHeight = null;
    var curRow = null;
    tv.addEventListener('scroll', function(e) {
        var offset = e.contentOffset.y;
        // We need to find the row associated to this offset
        if(offset >= 0) {
            // Ti.API.info("Offset = " + offset);
            var section = tv.getData();
            if(section && section.length > 0) {
                var rows = section[0].getRows();
                if(rows && rows.length > 0) {
                    if(! rowHeight) {
                        // We get the first row height
                        rowHeight = rows[0].height;
                    }
                    if(rowHeight) {
                        var cur = Math.floor(offset / rowHeight);
                        if(cur !== curRow) {
                            curRow = cur;
                            labelDistance.setText(rows[cur].distance);
                        }
                    } 
                    var tvHeight = rows.length * rowHeight;
                    labelDistance.top = advertHeight + (offset / tvHeight * (366 - advertHeight)) + 28;
                    // Ti.API.info("Top = " + labelDistance.top);
                    labelDistance.visible = true;
                }
            }
        }
    });
    
    tv.addEventListener('dragEnd', function(e) {
        labelDistance.visible = false;
    });
    tv.addEventListener('scrollEnd', function(e) {
        labelDistance.visible = false;
    });

    self.add(listView);
    
    self.tv = tv;
    self.map = mapView;
    
    self.addEventListener('focus', function(e) {
        if(mapView && ! viewList) {
            mapView.setUserLocation(true);
        }
    });
    self.addEventListener('blur', function(e) {
        if(mapView) {
            mapView.setUserLocation(false);
        }
    });
    
	return self;
}

module.exports = ShopListWindow ;
