//
//  WishDetailWindow.js
//  StepIn
//
//  Created by Frederic Leroy on 2012-10-18.
//  Copyright 2012 Frederic Leroy. All rights reserved.
//
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/AppImage");

function WishDetailWindow(tabGroup, shop, scans) {'use strict';
    var AppUser = require("model/AppUser");

    var self = Ti.UI.createWindow({
        title : 'Mes favoris !',
        backgroundColor : '#ffffff',
        barImage : '/images/topbar-stepin.png',
        barColor : 'black'
    });

    var headerViewPink = Ti.UI.createView({
        backgroundColor : Ti.App.PinkColor,
        width : '100%',
        height : 50,
        top : 0
    });
    
    var headerView = Ti.UI.createView({
        backgroundColor : "#4d122e",
        width : '100%',
        height : 35,
        top : 15
    });
    headerViewPink.add(headerView);
    
    var lblTitleheaderView = Ti.UI.createLabel({
        font : {
            fontSize : 14,
            fontWeight : 'bold'
        },
        color : 'white',
        text : 'Mes Produits favoris',
        height : 13,
        zIndex : 1
    });

    headerView.add(lblTitleheaderView);

    function createBookmarkView(scan) {
        var view = Ti.UI.createView({
            width : 142,
            height : 140
        });

        var iconFav = Ti.UI.createImageView({
            image : '/images/bookmark.png',
            width : 15,
            height : 15,
            bottom : 3,
            right : 5
        });

        var lblTitle = Ti.UI.createLabel({
            text : scan.title,
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
        Image.cacheImage(scan.getPhotoUrl(0), function(image) {
            img.setImage(image);
        });

        view.add(iconFav);

        /*
         function displayBookmark(e) {
         // to whom catalog the scan belongs to ?
         var i, catalogs = shop.catalogs, found = false;
         for(i = 0; !found && catalogs && catalogs.length; i ++)
         {
         if(catalogs[i].getUrl() === scan.catalog.url) {
         found = true;
         tabGroup.openShop(shop, catalogs[i], scan.getUrl());
         }
         }
         if(! found){
         // We open the shop
         self.close({animated:true});
         tabGroup.openShop(shop);
         }
         }
         */

        function openDetailBookmark(e) {
            // We need to open a bigger detailed window
            var WishDetailZoomWindow = require("ui/common/WishDetailZoomWindow"), swin = new WishDetailZoomWindow(scan, e.x, e.y, tabGroup);
            swin.open();
        }


        view.addEventListener('click', openDetailBookmark);

        return view;
    }

    var i, data = [];
    for ( i = 0; i < scans.length; i++) {
        data.push(createBookmarkView(scans[i]));
    }
    var BigScrollView = require("ui/common/BigScrollView"), bsv = new BigScrollView({
        data : data,
        top : 50,
        left : 0
    });
    self.add(bsv);
    self.add(headerViewPink);
    return self;
}

module.exports = WishDetailWindow;
