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
    
    var btFilter = Ti.UI.createButton({
        title : 'Filtrer'
    });
    self.setRightNavButton(btFilter);
    
    btFilter.addEventListener('click', function(e) {
        tabGroup.chooseFilter(self); 
    });
    
	function refresh() {
        tabGroup.getAllObjects();
	}
	
	var tv = TV.create({ 
	    top : 0,
        editable:(Ti.App.adminMode && !args.booking)
	}, refresh);
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
            var win = new FormWindow({ title : title }, crud, obj, tabGroup, obj.getExtraFormWindowOptions(crud));
			self.containingTab.open(win,{animated:true});
		}
	});
		    
    self.tv = tv;
    
	return self;
}

module.exports = TabViewWindow ;
