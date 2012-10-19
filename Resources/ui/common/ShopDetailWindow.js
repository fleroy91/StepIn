// 
//  ShopDetailWindow.js
//  StepIn
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-18.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require('/etc/AppImage');
var AppUser = require('/model/AppUser');
var Reward = require('/model/Reward');

function ShopDetailWindow(shop, tabGroup) { 'use strict';
    var self = Ti.UI.createWindow({
        object : shop
    });
    
    var internBorder = 2;
    var internHeight = 74;
    var labelHeight = 13;
        
    // We create a new header view
    var header = Ti.UI.createView({
        height : 135+63,
        top : 0
    });
    Image.cacheImage(shop.getPhotoUrl(0), function(image) {
        header.setBackgroundImage(image);
    });
        
    // we create a view for shop details in the header
    var shopdetails = Ti.UI.createView({
        top : 97,
        height : 36,
        backgroundColor : 'black',
        opacity : 0.6,
        zIndex : 0
    });
    header.add(shopdetails);
        
    var labelName = Ti.UI.createLabel({
        font : {fontSize: 14, fontWeight : 'bold'},
        left : 73,
        top : shopdetails.top + internBorder,
        color:'white',
        zIndex : 1,
        text : shop.getName(),
        height : labelHeight
    });
    header.add(labelName);

    // line 2
    var labelDetails = Ti.UI.createLabel({
        color : 'white',
        left : 73,
        top : shopdetails.top + 20,
        zIndex : 1,
        font : { fontSize : 12, fontWeight : 'normal'},
        text : shop.getDetails()
    }); 
    header.add(labelDetails);

    var btShowMap = Ti.UI.createImageView({
        image : '/images/bullet.png',
        width : 25, 
        height: 25,
        top : shopdetails.top + 6,
        zIndex : 1,
        right : 5
    });
    header.add(btShowMap);
    self.add(header);
        
    var mapview = Ti.UI.createImageView({
        image : "/images/smallmap.png",
        borderRadius : 1,
        borderWidth : 2,
        borderColor : 'white',
        zIndex : 100,
        height : 60,
        width : 60,
        bottom : 2,
        top : 80,
        left : 9,
        shadow:{
            shadowRadius:2,
            shadowOpacity:0.7,
            shadowOffset:{x:3, y:3}
        }
    });
    self.add(mapview);
        
    function showMap() {
        var MapDetailWindow = require('/ui/common/MapDetailWindow'),
            swin = new MapDetailWindow(shop);
        tabGroup.activeTab.open(swin, {animated:true});
    }
        
    btShowMap.addEventListener('click', showMap);
    mapview.addEventListener('click', showMap);
        
    // Nom we display the 'In' list
    var tv = Ti.UI.createTableView({
        top : 135,
        zIndex : 0,
        height : Ti.UI.FILL,
        allowsSelection : true,
        scrollable : false,
        style : Titanium.UI.iPhone.TableViewStyle.PLAIN,
        backgroundColor : '#f0f0f0'
    });
    
    function createRow(image, title, points, withAction) {
        var row = Ti.UI.createTableViewRow({
            height : 70,
            className : 'shopDetailRow',
            leftImage : image
        });
        
        var lbl = Ti.UI.createLabel({
            verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER, 
            font : {fontSize : 20},
            color : '#4d4d4d',
            text : title,
            width : 190 - 40,
            height : row.height
        });
        row.add(lbl);
        
        var btAction = Ti.UI.createImageView({
            image : '/images/bullet.png',
            width : 30,
            height : 30,
            right : 5
        });
        if(withAction) {
            row.add(btAction);
        }
    
        var pt = Image.createPointView(points, 40, 80);
        pt.right = btAction.right + btAction.width + 2;
        row.add(pt);
        row.ptView = pt;
        return row;
    }
    
    var rowStepIn = createRow('/images/steps.png', "Step-In", shop.getPoints(Reward.ACTION_KIND_STEPIN), false);
    if(shop.checkin) {
        rowStepIn.backgroundColor = '#eadae3';
    }
    var rowScans = createRow('/images/tag.png', shop.scans.length + " Scan-In", shop.allPossiblePoints - shop.getPoints(Reward.ACTION_KIND_STEPIN), true);
    
    var rowAdvert = Ti.UI.createTableViewRow({
        height : 90
    });
    
    var img1 = Ti.UI.createView({
        width : 300,
        backgroundColor : 'white'
    });
    img1.add(Ti.UI.createImageView({
        left : 10, right : 10, width : 250,
        image : '/images/advert.png'
    }));
    var img2 = Ti.UI.createView({
        width : 300
    });
    img2.add(Ti.UI.createImageView({
        left : 10, right : 10,
        image : '/images/advert.png'
    }));
    var img3 = Ti.UI.createView({
        width : 300
    });
    img3.add(Ti.UI.createImageView({
        left : 10, right : 10,
        image : '/images/advert.png'
    }));
    
    var advert = Ti.UI.createScrollableView({
        height : rowAdvert.height,
        showPagingControl : false,
        clipViews : false,
        width : '80%',
        views : [img1, img2, img3]
    });
    
    /*
    advert.addEventListener('click', function(e) {
        var page = advert.getCurrentPage();
        var nextPage = page+1;
        if(nextPage >= advert.views.length) {
            nextPage = 0;
        }
        advert.setCurrentPage(nextPage);
    });
    */
    rowAdvert.add(advert);
    
    tv.setData([rowStepIn, rowScans, rowAdvert]);
    
    tv.addEventListener('click', function(e) {
        if(e.index === 1) {
            var ScanListWindow = require("/ui/common/ScanListWindow"),
                swin = new ScanListWindow(shop, tabGroup);
            tabGroup.openWindow(null, swin, {animated  :true});
        }
        tv.deselectRow(e.index);
    });
    self.add(tv);
    
    tabGroup.createTitle(self, shop.getTitle());

    return self;
}

module.exports = ShopDetailWindow;
