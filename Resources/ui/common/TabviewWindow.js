// 
//  ShopTabviewWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
// Article.js
// Display tabviews for articles + bookings
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true, TV : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

// var allArticles = [];
var refresh_all = true;

Ti.include("/etc/tv.js");

function TabViewWindow(args) {
    'use strict';
    var tabGroup = args.tabGroup;
    var self = Ti.UI.createWindow({
        navBarHidden : true
    }); 
    
    /*    
	var btRefresh = Ti.UI.createButton({ systemButton : Titanium.UI.iPhone.SystemButton.REFRESH, win : self});
	self.setLeftNavButton(btRefresh);
    btRefresh.addEventListener('click', function(e)  {
        e.source.win.tabGroup.getAllObjects();
    });
    */
	
	var btAdd = Ti.UI.createButton({ systemButton : Ti.UI.iPhone.SystemButton.ADD });
	if(Ti.App.adminMode && !args.booking) {
	   self.setRightNavButton(btAdd);
	}
	
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
            var art = e.row.object;
            art.remove(function() {});
        });
    }
    
	tv.addEventListener('click', function(e)
	{
		if (e.rowData.object)
		{
		    var Article = require('model/Article'),
			    art = e.rowData.object,
			    ArticleDetailsWindow = require('ui/common/CreateArticleWindow');
			art.index = e.index;
			art.source = e.source;
            var win = new ArticleDetailsWindow({ update : true, article : art, booking : args.booking, tabGroup : tabGroup});
			self.containingTab.open(win,{animated:true});
		}
	});
		
    btAdd.addEventListener('click', function(e) {
       var CreateArticleWindow = require('ui/common/CreateArticleWindow'),
           swin = new CreateArticleWindow({ tabGroup : tabGroup});
       // TODO : vérifier la suppression de  ce code
       /*
       swin.addEventListener('close', function(e) {
           if(swin.article) {
               var art = swin.article;
               var row = art.createTableRow();
               tv.appendRow(row);
           }
       });
       */
       self.containingTab.open(swin, {animated:true});  
    });
    
    self.tv = tv;
    
	return self;
}

module.exports = TabViewWindow ;
