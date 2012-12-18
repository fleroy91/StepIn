// 
//  SuperAdminWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var ApplicationTabGroup = require("/ui/common/ApplicationTabGroup");

function ConditionsWindow(args) {'use strict';
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
    var tabGroup = args.tabGroup;
    
	var self = Ti.UI.createWindow({ 
	    backgroundColor : 'white',
        barImage : '/images/topbar-stepin.png',
        barColor : 'black'
    });
    
    var view=Ti.UI.createWebView({
    	url:'/ui/common/conditions.html',
    })
    
    // And then actions
    self.add(view);

	return self;
}

module.exports = ConditionsWindow ;