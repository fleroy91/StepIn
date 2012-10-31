// 
//  AdvertView.js
//  StepIn
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-31.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, TV : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
function AdvertView(imgs, options) { 'use strict';

    var self = Ti.UI.createImageView(options);

    var nbImgs = imgs.length; 
    var page = Math.max(0, Math.min(nbImgs - 1, Math.ceil(Math.random() * nbImgs)));
    self.setImage(imgs[page]);

    self.moveNext = function() {
        page ++;
        if(page >= nbImgs) {
            page = 0;
        }
        self.setImage(imgs[page]);
    };
    
    return self;
}

module.exports = AdvertView;
