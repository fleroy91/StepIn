// 
//  WishListWindow.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-18.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/AppImage");

function WishListWindow(tabGroup) { 'use strict';
    var AppUser = require("model/AppUser");
    var self = Ti.UI.createWindow({ 
        title : 'Mes favoris !', 
        backgroundColor : '#ffffff',
        barImage : '/images/topbar-stepin.png',
        barColor : 'black'
    });
    
    function createBookmarkView(shop) {
        var view = Ti.UI.createView({
            width : 142,
            height : 140
        });
        
        var lblTitle = Ti.UI.createLabel({
            text : shop.name,
            top : 3,
            height : 30,
            color : 'black',
            font : {fontSize : 14, fontWeight : 'bold'}
        });
        view.add(lblTitle);
        
        var img = Ti.UI.createImageView({
            top : 30, 
            height : 110,
            width : 110
        });
        view.add(img);
        Image.cacheImage(shop.getPhotoUrl(0), function(image) {
            img.setImage(image); 
        });
        
        var imgCorner = Ti.UI.createImageView({
            height : view.height,
            width : view.width,
            bottom : 0,
            right : 0,
            image : "/images/corner-pink.png",
            zIndex : 1
        });
        view.add(imgCorner);
        
        var lblBookmarks = Ti.UI.createLabel({
            text : shop.bookmarks.length + " favoris",
            color : 'white',
            font: {fontSize : 15, fontWeight : 'normal'},
            right : 2,
            bottom : 2,
            zIndex : 10,
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT
        });
        view.add(lblBookmarks);
        
        function displayBookmark(e) {
            var WishDetailWindow = require("/ui/common/WishDetailWindow"),
             swin = new WishDetailWindow(tabGroup, shop, shop.bookmarks);
             
             tabGroup.openWindow(self.containingTab, swin, {animated:true});
        }
        
        img.addEventListener('click', displayBookmark);
        view.addEventListener('click', displayBookmark);
        
        return view;
    }
    
    var i, data = [];
    var BigScrollView = require("ui/common/BigScrollView"),
        bsv = new BigScrollView({data : data, top : 0, left : 0});
    self.add(bsv);
    
    self.updateBookmarks = function(bookmarks) {
        var shops = [];
        var user = AppUser.getCurrentUser();
        var j;
        for(i = 0; i < bookmarks.length; i++) {
            // We need to organise it by shops
            var book = bookmarks[i];
            var shop = AppUser.findShop(book.shop.url);
            var scan = null;
            if(shop) {
                scan = shop.findScan(book.scan.url);
            }
            var found = false;
            for(j = 0; ! found && j < shops.length; j ++) {
                if(shops[j].getUrl() === shop.getUrl()) {
                    found = true;
                    shops[j].bookmarks.push(scan);
                }
            }
            if(! found) {
                shops.push(shop);
                shops[shops.length - 1].bookmarks = [scan];
            }
        }
        data = [];
        for(j = 0; j < shops.length; j ++) {
            data.push(createBookmarkView(shops[j]));
        }
        bsv.setData(data);
    };
    function updateBookmarks() {
        var user = AppUser.getCurrentUser();
        self.updateBookmarks(user.getBookmarks());
    }
    
    var updateBookmarksOnce = function() {
        self.removeEventListener('focus', updateBookmarksOnce);
        updateBookmarks();
    };      
    
    self.addEventListener('focus', updateBookmarksOnce);
    
    Ti.App.addEventListener('NewBookmarks', function() {
        updateBookmarks();
    });
    
    return self;
}

module.exports = WishListWindow;
