// 
//  ShopTabviewWindow.js
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

function TabViewWindow(args) {
    'use strict';
    var tabGroup = args.tabGroup;
    var self = Ti.UI.createWindow({
        navBarHidden : false,
        backgroundColor : '#f0f0f0',
        barImage : '/images/topbar-stepin.png',
        barColor : 'black'
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
	
	var listView = Ti.UI.createView({ top : 0});

    var mapView = null;
    
    function createMapView() {
        if(! mapView) {
            var user = AppUser.getCurrentUser(); 
            var userloc = user.location;
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
	
	var tv = TV.create({ 
	}, refresh);
	tv.separatorStyle = Ti.UI.iPhone.TableViewSeparatorStyle.NONE;
	tv.allowsSelection = false;
	
	listView.add(tv);
	self.add(listView);
    
    var mapViewOk = false;
    function updateMapView() {
        if(mapView) {
            mapViewOk = true;
            Ti.API.info("In update Map View !!!");
            mapView.removeAllAnnotations();
            var anns = [];
            var section = tv.getData();
            if(section && section.length > 0) {
                var rows = section[0].getRows();
                if(rows) {
                    var i;
                    for(i = 0; i < rows.length; i++) {
                        var obj_index = rows[i].object_index;
                        var obj = AppUser.getShop(obj_index);
                        var ann = obj.createAnnotation(tabGroup);
                        anns.push(ann);
                    }
                }
            }
            mapView.addAnnotations(anns);
        }
    }

    btChangeView.addEventListener('click', function(e) {
        if(! mapView) {
            createMapView();
        }
        
        // We change the visible view
        if(mapView) {
            if(viewList) {
                listView.hide();
                mapView.setUserLocation(true);
                mapView.show();
                mapView.addEventListener('complete', updateMapView);
                if(mapViewOk) {
                    updateMapView();                    
                }
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
        width : 48,
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : { fontSize : 10, fontWeight : 'normal'},
        visible : false,
        right : 10,
        opacity : 0.8
    });
    self.add(labelDistance);
    
    var tvHeight = null;
    tv.addEventListener('scroll', function(e) {
        var offset = e.contentOffset.y;
        // We need to find the row associated to this offset
        if(offset >= 0) {
            var section = tv.getData();
            if(section && section.length > 0) {
                var rows = section[0].getRows();
                var i, found = false, ntop = 0;
                for(i = 0; ! found && rows && i < rows.length; i++) {
                    var row = rows[i];
                    if(ntop <= offset && ntop + row.height >= offset) {
                        found = true;
                        if(! tvHeight) {
                            // We don't stop if we haven't computed the total height
                            found = false;
                        }
                        labelDistance.setText(row.distance);
                    }
                    ntop += row.height;
                }
                if(! tvHeight) {
                    tvHeight = ntop;
                }
            }
            labelDistance.top = (offset / tvHeight * 366) + 37;
            labelDistance.visible = true;
        }
    });
    
    tv.addEventListener('dragEnd', function(e) {
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

module.exports = TabViewWindow ;
