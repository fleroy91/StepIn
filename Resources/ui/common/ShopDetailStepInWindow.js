//
//  ShopDetailStepInWindow.js
//  StepIn
//
//  Created by Damien Bigot on 2013-01-10.
//  Copyright 2013 Damien Bigot. All rights reserved.
//
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require('/etc/AppImage');
var AppUser = require('/model/AppUser');

function ShopDetailStepInWindow(shop, tabGroup) {'use strict';
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

    function createRow(image, title, detail, points) {
        var row = Ti.UI.createTableViewRow({
            className : 'shopDetailRow',
            height : 80
        });

        var imageRow = Ti.UI.createImageView({
            top:22,
            width : 40,
            left : 15,
            height : 40
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
            width : 190,
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

        var pt = Image.createPointView(points, 40, 120, null, {
            right : btAction.right+4,
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

    var rowStepIn = createRow('/images/steps.png', shop.getRayonName(0), "Entrez dans le magasin \net gagnez des steps", shop.getStepInPoints());
    var rowStepInRayon1 = createRow('/images/steps.png', shop.getRayonName(1), "Entrez dans le rayon \net gagnez des steps", shop.getPointsRayon(1));
    var rowStepInRayon2 = createRow('/images/steps.png', shop.getRayonName(2), "Entrez dans le rayon \net gagnez des steps", shop.getPointsRayon(2));
    var rowStepInRayon3 = createRow('/images/steps.png', shop.getRayonName(3), "Entrez dans le rayon \net gagnez des steps", shop.getPointsRayon(3));
    var rowStepInRayon4 = createRow('/images/steps.png', shop.getRayonName(4), "Entrez dans le rayon \net gagnez des steps", shop.getPointsRayon(4));

    if (shop.checkin) {
        rowStepIn.backgroundColor = '#eadae3';
    }

    var data = [rowStepIn,rowStepInRayon1,rowStepInRayon2,rowStepInRayon3,rowStepInRayon4], i;
    var catalogs = shop.catalogs;

    tv.setData(data);

    tv.addEventListener('click', function(e) {
        if (e.index === 0) {
            if (!shop.checkin) {
                alert("Entrez dans le magasin et gardez votre téléphone en main.\nVous gagnerez automatiquement des steps !");
            } else {
                alert("Vous avez déjà fait un Step-In aujourd'hui dans ce magasin ! Ré-essayez demain :-)");
            }
        } 
        else if (e.index >= 1) 
        {
            if (!shop.checkin) {
                alert("Passez dans le rayon\npour gagner vos Steps !");
            } else {
                alert("Vous êtes déjà entré dans ce rayon ! Ré-essayez demain :-)");
            }
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

module.exports = ShopDetailStepInWindow;
