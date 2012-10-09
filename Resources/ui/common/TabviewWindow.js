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

function TabViewWindow(args) {
    'use strict';
    var tabGroup = args.tabGroup;
    var self = Ti.UI.createWindow({
        navBarHidden : false,
        backgroundColor : '#f0f0f0'
    });
    
    var AppUser = require("/model/AppUser"),
        user = AppUser.getCurrentUser(); 
    
    var btFilter = Ti.UI.createButton({
        title : 'Filtrer'
    });
    // self.setRightNavButton(btFilter);
    
    btFilter.addEventListener('click', function(e) {
        tabGroup.chooseFilter(self); 
    });
    
    var viewList = true;
    var btChangeView =Ti.UI.createButton({
        image : "/images/viewmap.png",
        width : 50,
        height : 25,
        borderRadius: 2,
        bordeWidth : 0,
        backgroundImage : '/images/bg_gradient.png'
    });
    self.setLeftNavButton(btChangeView);
    
	function refresh() {
        tabGroup.getAllObjects();
	}
	
	var listView = Ti.UI.createView({});

    var mapView = null;
    
    function createMapView() {
        if(! mapView) {
            mapView = Ti.Map.createView({
                mapType : Titanium.Map.STANDARD_TYPE,
                animate : true,
                userLocation : true,
                zIndex : -1,
                region : {
                    latitude : user.location.lat,
                    longitude : user.location.lng,
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
    listView.add(sheader);

	var tv = TV.create({ 
	    top : 40,
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
    
    function updateMapView() {
        if(mapView) {
            mapView.removeAllAnnotations();
            var anns = [];
            var section = tv.getData();
            if(section && section.length > 0) {
                var rows = section[0].getRows();
                if(rows) {
                    var i;
                    for(i = 0; i < rows.length; i++) {
                        var obj = rows[i].object;
                        var ann = obj.createAnnotation(tabGroup);
                        anns.push(ann);
                    }
                }
            }
            mapView.addAnnotations(anns);
        }
    }

    btChangeView.addEventListener('click', function(e) {
        // We change the visible view
        var bAdd = false;
        if(! mapView) {
            createMapView();
            bAdd = true;
        }
        if(viewList) {
            updateMapView();
            listView.hide();
            if(bAdd) {
                self.add(mapView);
            } else {
                mapView.show();
            }
            // animate({view : mapView, transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});          
        } else {
            mapView.hide();
            listView.show();
            // mapView.animate({view : listView, transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});            
        }
        viewList = ! viewList;
        btChangeView.setImage((viewList ? "/images/viewmap.png" : "/images/viewlist.png"));
    });

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
            obj.checkin = ! e.row.hasDetail;
            var win = new FormWindow(null, crud, obj, tabGroup, obj.getExtraFormWindowOptions(crud));
			self.containingTab.open(win,{animated:true});
		}
	});
	
	self.addEventListener('open', createMapView);
	
    self.add(listView);
    
    self.tv = tv;
    self.map = mapView;
    
	return self;
}

module.exports = TabViewWindow ;
