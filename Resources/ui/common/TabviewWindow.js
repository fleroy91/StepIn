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

function TabViewWindow(args) {
    'use strict';
    var tabGroup = args.tabGroup;
    var self = Ti.UI.createWindow({
        navBarHidden : false
    });
    
    var AppUser = require("/model/AppUser"),
        user = AppUser.getCurrentUser(); 
    
    var btFilter = Ti.UI.createButton({
        title : 'Filtrer'
    });
    self.setRightNavButton(btFilter);
    
    btFilter.addEventListener('click', function(e) {
        tabGroup.chooseFilter(self); 
    });
    
    var viewList = true;
    var btChangeView =Ti.UI.createButton({
        image : "/images/viewmap.png"
    });
    self.setLeftNavButton(btChangeView);
    
	function refresh() {
        tabGroup.getAllObjects();
	}
	
	var listView = Ti.UI.createView({});
	
	var mapView = Ti.Map.createView({        
	    mapType: Titanium.Map.STANDARD_TYPE,
        animate:true,
        userLocation:true,
        region : {latitude : user.location.lat, longitude : user.location.lng, latitudeDelta : 0.05, longitudeDelta : 0.05 }
	});
	
	mapView.addEventListener('click', function(e) {
	   if(e.annotation) {
	       // We have clicked on an annotation
	       // We need to check that it's not on the pin
	       if(e.clicksource) {
	           alert("On a clické sur l'annotation");
	       }
	   } 
	});
	
	btChangeView.addEventListener('click', function(e) {
	    // We change the visible view
	    if(viewList) {
            listView.animate({view : mapView, transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});	        
	    } else {
            mapView.animate({view : listView, transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});            
	    }
        viewList = ! viewList;
        btChangeView.setImage((viewList ? "/images/viewmap.png" : "/images/viewlist.png"));
	});
	
	var tv = TV.create({ 
	    top : 0,
        editable:(Ti.App.adminMode && !args.booking)
	}, refresh);
	listView.add(tv);
	self.add(tv);
	    
    // add delete event listener
    if(Ti.App.adminMode) {
        tv.addEventListener('delete',function(e)
        {
            var obj = e.row.object;
            obj.remove(function() {});
        });
    }
    
	tv.addEventListener('click', function(e)
	{
		if (e.rowData.object)
		{
		    var obj = e.rowData.object,
			    FormWindow = require('ui/common/FormWindow'),
			    crud, title;
			    
            if(Ti.App.adminMode) {
                crud = 'update';
                title = 'Edition';
            } else {
                crud = 'read';
                title = obj.getName();
            }
            // TODO : why we don't have the checkin value here ????
            if(e.row.backgroundColor) {
                obj.checkin = true;
            }
            var win = new FormWindow({ title : title }, crud, obj, tabGroup, obj.getExtraFormWindowOptions(crud));
			self.containingTab.open(win,{animated:true});
		}
	});
		
    self.add(mapView);
    self.add(listView);
    
    self.tv = tv;
    self.map = mapView;
    
	return self;
}

module.exports = TabViewWindow ;
