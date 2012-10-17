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

var TV = require("/etc/TV");
var Tools = require("/etc/Tools");
var AppUser = require("/model/AppUser");

function TabViewWindow(args) {
    'use strict';
    var tabGroup = args.tabGroup;
    var self = Ti.UI.createWindow({
        navBarHidden : false,
        backgroundColor : '#f0f0f0',
        barColor : 'black'
    });
    
    var viewList = true;
    var btChangeView =Ti.UI.createButton({
        style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
        image : "/images/switch-map.png"
    });
    self.setLeftNavButton(btChangeView);
    
	function refresh() {
        tabGroup.getAllObjects();
	}
	
	var listView = Ti.UI.createView({ top : 40});

    var mapView = null;
    
    function createMapView() {
        if(! mapView) {
            var user = AppUser.getCurrentUser(); 
            var userloc = user.location;
            mapView = Ti.Map.createView({
                mapType : Titanium.Map.STANDARD_TYPE,
                animate : true,
                top : 40,
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
	
    var sheader = Ti.UI.createView({
        height : 40,
        top : 0,
        backgroundColor : '#d92276'
    });
    var lbl = Ti.UI.createLabel({
        text : "Gagnez des points en visitant ces magasins :",
        top : 2,
        left : 2,
        color : 'white',
        font : {fontSize : '15', fontWeight : 'normal'},
        textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
        height : 40
    });
    sheader.add(lbl);
    self.add(sheader);

	var tv = TV.create({ 
	}, refresh);
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
                // listView.animate({view : mapView, transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});          
            } else {
                mapView.hide();
                mapView.setUserLocation(false);
                listView.show();
                //mapView.animate({view : listView, transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});            
            }
            viewList = ! viewList;
            btChangeView.setImage((viewList ? "/images/switch-map.png" : "/images/switch-list.png"));
        }
    });

	tv.addEventListener('click', function(e)
	{
		if (e.rowData && e.rowData.object_index)
		{
		    var row_index = e.index;
		    var obj_index = e.rowData.object_index;
		    var obj = AppUser.getShop(obj_index);
			var FormWindow = require('ui/common/FormWindow'),
                swin = new FormWindow(null, 'read', obj, tabGroup);
            
            swin.addEventListener('close', function() {
                var newShop = AppUser.getShop(obj_index);
                var row = newShop.createTableRow();
                tv.updateRow(row_index, row);
            });
                
			tabGroup.openWindow(self.containingTab,swin,{animated:true});
		}
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
