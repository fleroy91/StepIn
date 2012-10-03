// 
//  ShopCreateArticleWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
// To create an article : no parameters
// To update an article : args = {update : true, article : article}
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

function CreateArticleWindow(args) { 'use strict';
    var update = args.update;
    var tabGroup = args.tabGroup;

    var Shop = require("/model/Shop"),
       shop = Shop.getCurrentShop();
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
    var mainObject = (Ti.App.adminMode ? shop : user); 
    
    var Article = require('model/Article'),
        art, crud, title, extra = null ;
        
    if(update) {
        art = args.article;
        if(Ti.App.adminMode) {
            if(args.booking) {
                crud = 'read';
                title = null;
            } else {
                crud = 'update';
                title = Ti.Locale.getString('update_article_window_title', "Edition d'un article");
            }
        } else {
            crud = 'read';
            title = null;
            if(!art.isBookedByAnother()) {
                extra = { addBooking : true};
            }
        }
    } else {
        art = new Article();
        art.setShop(shop);
        crud = 'create';
        title = Ti.Locale.getString('new_article_window_title', 'Nouvel article');
    }
    
    var ShopFormWindow = require("/ui/common/FormWindow"),
        win = new ShopFormWindow({ title : title }, crud, art, tabGroup, extra);

    return win;
}

module.exports = CreateArticleWindow;
