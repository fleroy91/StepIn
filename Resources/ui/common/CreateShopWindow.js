// 
//  ShopCreateShopWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
// To create a shop : call the window without arguments
// To update a shop : call the window with {update :true, shop : shop}
function ShopCreateShopWindow(args) { 'use strict';
    var update = args.update;
    var tabGroup = args.tabGroup;
    
    var AppUser = require('model/AppUser'),
        user = new AppUser.getCurrentUser();
    var Shop = require('model/Shop'),
        shop, crud;
    if(update) {
        shop = args.shop;
        crud = 'update';
    } else {
        shop = new Shop();
        shop.setUser(user);
        shop.geolocalize();
        crud = 'create';
    }
    
    var ShopFormWindow = require("ui/common/FormWindow"),
        win = new ShopFormWindow({ 
        title : (update ? Ti.Locale.getString('update_shop_window_title', 'Edition') : Ti.Locale.getString('create_shop_window_title', "Nouvelle"))
        }, crud, args.shop, tabGroup, {addLocalizationButton : true});
    
    return win;
}

module.exports = ShopCreateShopWindow;
