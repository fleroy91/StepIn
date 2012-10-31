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

    options.showPagingControl = false;
    options.scrollingEnabled = false;
    options.clipViews = false;

    var self = Ti.UI.createScrollableView(options);

    var nbImgs = imgs.length, i, views = [];
    for(i = 0; i < nbImgs; i ++) {
        var img = Ti.UI.createImageView({
            image : imgs[i]
        });
        views.push(img);
    }
    var page = Math.min(0, Math.max(nbImgs - 1, Math.ceil(Math.random() * nbImgs)));
    self.setViews(views);
    self.setCurrentPage(page);
        
    self.moveNext = function() {
        page ++;
        if(page >= self.views.length) {
            page = 0;
        }
        self.scrollToView(page);
    };
    
    return self;
}

module.exports = AdvertView;
