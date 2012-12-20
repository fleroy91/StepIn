// 
//  ScanListWindow.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-18.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require('/etc/AppImage');
var AppUser = require('/model/AppUser');

function ScanListWindow(shop, tabGroup, catalog, urlScanSelected) { 'use strict';
    var self = Ti.UI.createWindow({
        barImage : '/images/topbar-stepin.png',
        barColor : 'black',
        backgroundColor : '#f0f0f0'
    });
    
    var header = shop.createHeader(false);
    self.add(header);
    
    // We add the progress bar
    var nbPoints = shop.catalogPoints;
    var nbScans = 0;
    
    var user = AppUser.getCurrentUser();
    
    function isBookmarked(scan) {
        var j, bookmarks = user.getBookmarks();
        var found = false;
        for(j = 0; !found && bookmarks && j < bookmarks.length; j ++) {
            var book = bookmarks[j];
            if(book.scan.url === scan.getUrl() && ! book.inactive) {
                found = true;
            }
        }
        return found;
    }
    
    var pgWidth = 153;
    
    var backgroundProgress=Ti.UI.createView({
        top : 5,
        left : 80,
        width : pgWidth+1,
        height : 10,
        backgrounColor:'white',
        borderRadius : 3,
        borderWidth:1,
        borderColor:'white'
    });
    
    
    var progress = Ti.UI.createView({
        top : 5,
        left : 80,
        width : pgWidth+1,
        height : 10,
        borderColor : 'white',
        borderRadius : 3,
        borderWidth : 1
    });
    
    var internProgress =Ti.UI.createView({
       top : 6,
       left : progress.left,
       backgroundColor :  'white',
       width : 0,
       height : 8
    });
    if(! catalog.viewed) {
        header.add(backgroundProgress);
        header.add(progress);
        header.add(internProgress);
    }
    
    var vPoints = Image.createPointView(nbPoints, 20, 70, false, {
        ratio: 0.7,
        color : 'white'});
    vPoints.top = 2;
    vPoints.right = 2;
    header.add(vPoints);
    
    shop.addOverHeader(self, tabGroup, false);
    
    function createScanView(scan) {
        var v = Ti.UI.createView({
            width : Ti.UI.FILL,
            height : Ti.UI.FILL,
            scan : scan
        });
        
         var bookmarked = isBookmarked(scan);
        v.savedBookmarked = bookmarked;
        var bookmark = Ti.UI.createButton({
            style:Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            borderWidth :0,
            image : (bookmarked ? '/images/bookmark.png' : '/images/bookmark_nude.png'),
            width : 24,
            height : 24,
            top : 5,
            right : 5
        });
        v.add(bookmark);
        
        var img = Ti.UI.createImageView({
            borderWidth : 0,
            height : 220, 
            width : 220,
            top : 30
        });
        Image.cacheImage(scan.getPhotoUrl(0), function(image) {
            img.setImage(image); 
        });
        v.add(img);
        
        var lbl1 = Ti.UI.createLabel({
            text : scan.title,
            top : 10,
            height : 20,
            color : '#454545',
            font : {fontSize : 16, fontWeight : 'bold'}
        });
        v.add(lbl1);
        var lbl2 = Ti.UI.createLabel({
            text : scan.desc,
            top :20,
            left : 22, right : 22,
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER, 
            height : 35,
            color : 'gray',
            font : {fontSize : 12, fontWeight : 'normal'}
        }); 
        v.add(lbl2);
        
        bookmark.addEventListener('click', function() {
            bookmarked = ! bookmarked;
            if(bookmarked) {
                bookmark.setImage("/images/bookmark.png");
            } else {
                bookmark.setImage("/images/bookmark_nude.png");
            }
        });
        
        
        /*
        var infoButton = Ti.UI.createButton({
            style:Ti.UI.iPhone.SystemButton.INFO_DARK,
            bottom : 10,
            right : 5
        });
        v.add(infoButton); 
        
        infoButton.addEventListener('click', function() {
            var ScanDetailWindow = require("/ui/common/ScanDetailWindow"),
                swin = new ScanDetailWindow(scan, tabGroup, {canScan : false});
            tabGroup.openWindow(null, swin, {animated:true});
        });
        */
        
        v.getBookmark = function() {
            return bookmarked;
        };
        
        return v;
    }
    
    var pageIndex = -1;
    var i, views = [], scans = shop.scans;
    for(i = 0; i < scans.length; i++) {
        var scan = scans[i];
        if(scan.catalog.url === catalog.getUrl()) {
            nbScans ++;
            views.push(createScanView(scan));
            
            if(scan.getUrl() === urlScanSelected) {
                pageIndex = views.length - 1;
            }
        }
    }
    
    var bsv = Ti.UI.createScrollableView({
        showPagingControl:true,
        pagingControlColor : 'lightgray',
        height : Ti.UI.FILL,
        backgroundColor : '#f0f0f0',
        top : header.height -10,
        views:views
    }); 
    self.add(bsv);
    
    function updateSize(max) {
        internProgress.setWidth(pgWidth * max / nbScans); 
    }
    
    var max = 1;
    updateSize(max);

    var displayed = catalog.viewed;
    function updateCurrentPage(currentPage, dontDisplay) {
        if(currentPage + 1 > max) {
            max = currentPage + 1;
            updateSize(max);
        }
        if(max === nbScans && !displayed && ! dontDisplay) {
           displayed = true;
           var Reward = require("model/Reward"),
                rew = new Reward({ nb_points : nbPoints});
            rew.setActionKind(Reward.ACTION_KIND_CATALOG);
            rew.setShop(shop);
            rew.catalog = catalog.getUrl();
            rew.setUser(AppUser.getCurrentUser());
            tabGroup.addNewReward(rew, function(newRew) {
                if(newRew) {
                    self.rewarded = true;
                }
            });
        }
    }
    
    bsv.addEventListener('scrollEnd', function(e) {
        updateCurrentPage(e.currentPage);
    });
   
    if(pageIndex >= 0) {
        bsv.setCurrentPage(pageIndex);
        updateCurrentPage(pageIndex, true);
    }
    
    tabGroup.createTitle(self, "Scans");
    
    function saveBookmarks() {
        Ti.API.info("In saving bookmarks !");
        // We need to save the bookmarks
        var bookmarksToAdd = [];
        var bookmarksToDelete = [];
        for(i = 0;i < views.length; i++) {
            if(views[i].getBookmark()) {
                if(! views[i].savedBookmarked) {
                    var scan = views[i].scan;
                    scan.shop = shop;
                    bookmarksToAdd.push(scan);
                }
                views[i].savedBookmarked = true;
            } else if(views[i].savedBookmarked) {
                bookmarksToDelete.push(views[i].scan);
                views[i].savedBookmarked = false;
            }
        }
        user.saveBookmarks(bookmarksToAdd, bookmarksToDelete, function() {
            Ti.App.fireEvent('NewBookmarks');
        });
    }
    
    self.addEventListener('close', saveBookmarks);
    self.addEventListener('blur', saveBookmarks);
   
    return self;
}

module.exports = ScanListWindow;
