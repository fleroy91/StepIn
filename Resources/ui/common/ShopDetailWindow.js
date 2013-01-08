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

function ShopDetailWindow(shop, tabGroup) {'use strict';
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
        style : Titanium.UI.iPhone.TableViewStyle.PLAIN,
        backgroundColor : 'white'
    });

    function createRow(image, title, detail, points, withAction) {
        var row = Ti.UI.createTableViewRow({
            className : 'shopDetailRow',
            height : 80
        });

        var imageRow = Ti.UI.createImageView({
            top:5,
            width : 70,
            left : 5,
            height : 70
        });
        row.add(imageRow);

        Image.cacheImage(image, function(img) {
            //row.setLeftImage(Image.squareImage(img,70));
            imageRow.setImage(img);
        });

        var lbl = Ti.UI.createLabel({
            font : {
                fontSize : 20
            },
            color : '#4d4d4d',
            text : title,
            width : 190 - 40,
            left : 85,
            top : 13
        });
        row.add(lbl);

        var lblDetail = Ti.UI.createLabel({
            font : {
                fontSize : 11,
                fontWeight : 'normal'
            },
            color : 'lightgray',
            top : 40,
            height : 25,
            wordWrap : true,
            text : detail,
            left : 85
        });
        row.add(lblDetail);

        var btAction = Ti.UI.createImageView({
            image : '/images/bullet.png',
            width : 30,
            height : 30,
            right : 5
        });

        if (withAction) {
            row.add(btAction);
        }

        var pt = Image.createPointView(points, 40, 120, null, {
            right : btAction.right + btAction.width + 4,
            bottom : 17,
            shadowOffset : {
                x : 1,
                y : 1
            },
            shadowColor : 'white'
        });
        row.add(pt);
        row.ptView = pt;
        return row;
    }

    var rowStepIn = createRow('/images/steps.png', "Step-In", "Entrez dans le magasin \net gagnez des steps", shop.getStepInPoints(), false);
    if (shop.checkin) {
        rowStepIn.backgroundColor = '#eadae3';
    }

    var data = [rowStepIn], i;
    var catalogs = shop.catalogs;
    for ( i = 0; i < catalogs.length; i++) {
        var catalog = catalogs[i];
        var rowScans = createRow(catalog.getPhotoUrl(0), catalog.kind, "Parcourez ce catalogue \npour gagner plus de steps", shop.catalogPoints, true);
        if (catalog.viewed) {
            rowScans.backgroundColor = '#eadae3';
        }
        rowScans.catalogIndex = i;
        data.push(rowScans);
    }

    tv.setData(data);

    tv.addEventListener('click', function(e) {
        if (e.index === 0) {
            if (!shop.checkin) {
                alert("Entrez dans le magasin et gardez votre téléphone en main.\nVous gagnerez automatiquement des steps !");
            } else {
                alert("Vous avez déjà fait un Step-In aujourd'hui dans ce magasin ! Ré-essayez demain :-)");
            }
        } else if (e.index >= 1) {
            var index = e.rowData.catalogIndex;
            var catalog = catalogs[index];
            var rowScan = data[e.index];
            var ScanListWindow = require("/ui/common/ScanListWindow"), swin = new ScanListWindow(shop, tabGroup, catalog);

            swin.addEventListener('close', function() {
                if (swin.rewarded) {
                    shop.catalogs[index].viewed = true;
                    rowScan.backgroundColor = '#eadae3';
                }
            });
            tabGroup.openWindow(null, swin, {
                animated : true
            });
        }
        tv.deselectRow(e.index);
    });
    self.add(tv);

    tabGroup.createTitle(self, shop.getTitle());

    self.setObject = function(newObject) {
        shop = newObject;
        rowStepIn.backgroundColor = (shop.checkin ? '#eadae3' : null);
    };


    return self;
}

module.exports = ShopDetailWindow;
