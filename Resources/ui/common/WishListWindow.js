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

function WishListWindow(tabGroup) {'use strict';
    //var AppUser = require("model/AppUser");
    var AppUser = require("model/AppUser"), user = AppUser.getCurrentUser();
    var self = Ti.UI.createWindow({
        title : 'Mes favoris !',
        backgroundColor : '#ffffff',
        barImage : '/images/topbar-stepin.png',
        barColor : 'black'
    });

    var scrollingLogos = Ti.UI.createScrollableView({
        showPagingControl : true,
        disableBounce : true,
        maxZoomScale : 2.0,
        currentPage : 0,
        visible : false
    });

    function readCatalog(params) {
        // we need to open the shop window + the catalog of the shop
        var shop = params && params.shop;
        tabGroup.openShop(shop, true);
    }

    function scrollingViewLogos(indexShop) {
        var user = AppUser.getCurrentUser;
        var i, shops = AppUser.getAllShops();
        var actionsShop = [];

        //TODO A optimiser lorsque les logos seront déjà en cache dans l'appli
        for ( i = 0; shops && i < shops.length; i++) {
            var shop = shops[i];
            var action = {
                title : shop.getTitle(),
                image : shop.getPhotoUrl(0),
                points : shop.getCatalogPoints(),
                params : {
                    shop : shop
                }
            };
            actionsShop.push(action);
        }
        readCatalog(actionsShop[indexShop].params);
    }

    function createBookmarkView(shop) {
        var view = Ti.UI.createView({
            width : 142,
            height : 140,
            index : shop
        });

        var lblTitle = Ti.UI.createLabel({
            text : shop.name,
            top : 3,
            height : 30,
            color : 'black',
            font : {
                fontSize : 14,
                fontWeight : 'bold'
            }
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
            text : shop.bookmarks ? shop.bookmarks.length + " favoris" : "0 favoris",
            color : 'white',
            font : {
                fontSize : 15,
                fontWeight : 'normal'
            },
            right : 2,
            bottom : 2,
            zIndex : 10,
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT
        });
        view.add(lblBookmarks);

        function displayBookmark(e) {
            var book = Ti.App.allBookmarks;
            if (shop.bookmarks.length > 0) {
                var WishDetailWindow = require("/ui/common/WishDetailWindow"), swin = new WishDetailWindow(tabGroup, shop, shop.bookmarks);
                tabGroup.openWindow(self.containingTab, swin, {
                    animated : true
                });
            } else {
                scrollingViewLogos(shop.index - 1);
            }
        }


        img.addEventListener('click', displayBookmark);
        view.addEventListener('click', displayBookmark);

        return view;
    }

    var data = [];
    var BigScrollView = require("ui/common/BigScrollView"), bsv = new BigScrollView({
        data : data,
        top : 0,
        left : 0
    });
    self.add(bsv);

    function strcmp(a, b) {
        if (a.toString() < b.toString())
            return -1;
        if (a.toString() > b.toString())
            return 1;
        return 0;
    }


    self.updateBookmarks = function(bookmarks) {
        var shops = AppUser.getAllShops();
        var i, j, k, p, book;

        // RaZ Des bookmarks pour les shops
        if (shops) {
            for ( i = 0; i < shops.length; i++) {
                shops[i].bookmarks = [];
            }
            if (bookmarks && bookmarks.length > 0) {
                for ( i = 0; i < bookmarks.length; i++) {
                    // We need to organise it by shops
                    book = bookmarks[i];
                    var shop = AppUser.findShop(book.shop.url);
                    var scan = null;
                    if (shop) {
                        scan = shop.findScan(book.scan.url);
                        if (scan) {
                            var found = false;
                            for ( j = 0; !found && j < shops.length; j++) {
                                if (shops[j].getUrl() === shop.getUrl()) {
                                    found = true;
                                    shop = shops[j];
                                    shops[j].bookmarks.push(scan);
                                }
                            }
                        }
                    }
                }
            }

            shops = shops.sort(function(a, b) {
                var ret = 0;
                if (a.bookmarks.length > b.bookmarks.length) {
                    ret = -1;
                } else if (a.bookmarks.length < b.bookmarks.length) {
                    ret = 1;
                } else {
                    ret = strcmp(a.name, b.name);
                }
                return ret;
            });

            data = [];
            for ( j = 0; j < shops.length; j++) {
                data.push(createBookmarkView(shops[j]));
            }
            bsv.setData(data);
        }
    };

    function updateBookmarks() {
        var user = AppUser.getCurrentUser();
        self.updateBookmarks(user.getBookmarks());
    }

    var updateBookmarksOnce = function() {
        self.removeEventListener('focus', updateBookmarksOnce);
        updateBookmarks();
    };

    Ti.App.addEventListener('EmptyBookmarks', function(e) {
        updateBookmarks();
    });

    self.addEventListener('focus', updateBookmarksOnce);

    Ti.App.addEventListener('NewBookmarks', function() {
        updateBookmarks();
    });

    return self;
}

module.exports = WishListWindow;
