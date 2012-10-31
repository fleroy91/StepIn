// 
//  ShopDetailWindow.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-18.
//  Copyright 2012 Frederic Leroy. All rights reserved.
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
    
    var header = shop.createHeader(true);
    self.add(header);
    
    shop.addOverHeader(self, tabGroup, true);
        
    // Nom we display the 'In' list
    var tv = Ti.UI.createTableView({
        top : 133,
        zIndex : 0,
        height : Ti.UI.FILL,
        allowsSelection : true,
        scrollable : false,
        style : Titanium.UI.iPhone.TableViewStyle.PLAIN,
        backgroundColor : '#f0f0f0'
    });
    
    function createRow(image, title, detail, points, withAction) {
        var row = Ti.UI.createTableViewRow({
            height : 70,
            className : 'shopDetailRow',
            leftImage : image
        });
        
        var lbl = Ti.UI.createLabel({
            font : {fontSize : 20},
            color : '#4d4d4d',
            text : title,
            width : 190 - 40,
            left : 70,
            top : 23
        });
        row.add(lbl);
        
        var lblDetail = Ti.UI.createLabel({
            font : {fontSize : 11, fontWeight : 'normal'},
            color : 'lightgray',
            top : 50,
            text : detail,
            left : 70
        });
        row.add(lblDetail);

        var btAction = Ti.UI.createImageView({
            image : '/images/bullet.png',
            width : 30,
            height : 30,
            right : 5
        });
        if(withAction) {
            row.add(btAction);
        }
    
        var pt = Image.createPointView(points, 40, 120, null, {
            right : btAction.right + btAction.width + 4,
            bottom : 17,
            shadowOffset : {x:1, y:1}, 
            shadowColor : 'white'
        });
        row.add(pt);
        row.ptView = pt;
        return row;
    }
    
    var rowStepIn = createRow('/images/steps.png', "Step-In", "Entrez dans le magasin et gagnez des steps", shop.getPoints(Reward.ACTION_KIND_STEPIN), false);
    if(shop.checkin) {
        rowStepIn.backgroundColor = '#eadae3';
    }
    var rowScans = createRow('/images/tag.png', shop.scans.length + " Article" + (shop.scans.length > 1 ? "s" : ""), "Scannez ces articles pour gagner plus de steps", shop.allPossiblePoints - shop.getPoints(Reward.ACTION_KIND_STEPIN), true);
    
    var rowAdvert = Ti.UI.createTableViewRow({
        height : 90
    });
    
    var img1 = Ti.UI.createView({
        width : 300
    });
    img1.add(Ti.UI.createImageView({
        left : 10, right : 10, width : 250,
        image : '/images/advert.png'
    }));
    var img2 = Ti.UI.createView({
        width : 300
    });
    img2.add(Ti.UI.createImageView({
        left : 10, right : 10,width : 250,
        image : '/images/advert.png'
    }));
    var img3 = Ti.UI.createView({
        width : 300
    });
    img3.add(Ti.UI.createImageView({
        left : 10, right : 10,width : 250,
        image : '/images/advert.png'
    }));
    
    var advert = Ti.UI.createScrollableView({
        height : rowAdvert.height,
        showPagingControl : false,
        clipViews : false,
        width : '80%',
        views : [img1, img2, img3]
    });
    
    rowAdvert.add(advert);
    
    tv.setData([rowStepIn, rowScans, rowAdvert]);
    
    tv.addEventListener('click', function(e) {
        if(e.index === 0) {
            if(! shop.checkin) {
                alert("Entrez dans le magasin et gardez votre téléphone en main.\nVous gagnerez automatiquement des steps !");
            } else {
                alert("Vous avez déjà fait un Step-In aujourd'hui dans ce magasin ! Ré-essayez demain :-)");
            }
        } else if(e.index === 1) {
            var ScanListWindow = require("/ui/common/ScanListWindow"),
                swin = new ScanListWindow(shop, tabGroup);
            tabGroup.openWindow(null, swin, {animated  :true});
        }
        tv.deselectRow(e.index);
    });
    self.add(tv);
    
    tabGroup.createTitle(self, shop.getTitle());
    
    self.setObject = function(newObject) {
        shop = newObject;
        rowStepIn.backgroundColor = (shop.checkin ? '#eadae3' : null); 
    };
    
    self.addEventListener('open', function(e) {
        Ti.App.testflight.passCheckpoint("View detail of a shop : " + shop.inspect());
    });

    return self;
}

module.exports = ShopDetailWindow;
