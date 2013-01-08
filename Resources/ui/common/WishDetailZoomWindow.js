//
//  WishDetailZoomWindow.js
//  StepIn
//
//  Created by Frederic Leroy on 2012-10-26.
//  Copyright 2012 Frederic Leroy. All rights reserved.
//
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/AppImage");

function WishDetailZoomWindow(scan, x, y, tabGroup) {'use strict';
    var t = Titanium.UI.create2DMatrix({
        scale : 0
    });

    var buttonHeight = 25;

    var self = Ti.UI.createWindow({
        width : '100%',
        height : '100%'
        // layout:'vertical'
    });

    var view = Ti.UI.createView({
        borderRadius : 4,
        borderColor : "darkGray",
        borderWidth : 2,
        transform : t,
        layout : 'vertical',
        left : x,
        top : y,
        width : '90%',
        height : '90%',
        backgroundColor : 'white',
        anchorPoint : {
            x : 0.5,
            y : 0.5
        }
    });

    var btClose = Ti.UI.createButton({
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        borderWidth : 0,
        image : '/images/close.png',
        top : 5,
        right : 5,
        zIndex : 100
    });
    view.add(btClose);

    var lblTitle = Ti.UI.createLabel({
        text : scan.title,
        wordWrap : true,
        height : 'auto',
        top : -20,
        textAlign : 'center',
        width : 150,
        color : 'black',
        font : {
            fontSize : 20,
            fontWeight : 'bold'
        }
    });
    view.add(lblTitle);

    var img = Ti.UI.createImageView({
        top : 0,
        height : 150,
        width : 150
    });
    view.add(img);
    Image.cacheImage(scan.getPhotoUrl(0), function(image) {
        img.setImage(image);
    });

    var lblDetails = Ti.UI.createLabel({
        //text : scan.desc,
        left : 10,
        right : 10,
        text : "Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un peintre anonyme assembla ensemble des morceaux de texte.",
        bottom : 30,
        //top : img.top + img.height + 10,
        color : 'gray',
        font : {
            fontSize : 14,
            fontWeight : 'normal'
        }
    });
    view.add(lblDetails);

    var bt = Ti.UI.createButtonBar({
        backgroundColor : Ti.App.PinkColor,
        style : Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 30,
        top : 20,
        // bottom:30,
        width : 150
    });
    view.add(bt);

    function niceClose(func) {
        var t3 = Ti.UI.create2DMatrix({
            scale : 0
        });
        var a = Ti.UI.createAnimation({
            transform : t3,
            duration : 500
        });
        a.addEventListener('complete', function(e) {
            self.close();
            if (func) {
                func();
            }
        });
        view.animate(a);
    }


    btClose.addEventListener('click', function(e) {
        niceClose();
    });
    self.add(view);

    self.addEventListener('open', function() {
        var t2 = Ti.UI.create2DMatrix({
            scale : 1
        });
        var a = Ti.UI.createAnimation({
            transform : t2,
            top : 20,
            left : 20,
            duration : 500
        });
        view.animate(a);
    });

    return self;
}

module.exports = WishDetailZoomWindow;
