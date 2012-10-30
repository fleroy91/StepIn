// 
//  BigScrollView.js
//  StepIn
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-29.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, TV : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
/** 
 * Big scroll views of boxes with shadow
 * 
 * @param {Object} options : view options standard options - REQUIRED : data
 * @param {Object} [subviewWidth] : the width of the box (default is 160)
 * @param {Object} [subviewHeight] : the height of the box (default is 156)
 */
function BigScrollView(options, subviewWidth, subviewHeight) { 'use strict';
    options.scrollType = 'vertical';
    
    subviewWidth = subviewWidth || 142;
    subviewHeight = subviewHeight || 140;
    
    var containerWidth = (160 / 142) * subviewWidth;
    var containerHeight = (156 / 140) * subviewHeight;
        
    var view = Ti.UI.createScrollView(options);
    
    var i, subviews = options.data;
    var ntop = 0;
    var nleft = 0;
    
    for(i = 0; i < subviews.length; i ++) {
        var subview = subviews[i];
        var container = Ti.UI.createView({
            width : containerWidth,
            height : containerHeight,
            backgroundImage : '/images/bck-shadow.png',
            top : ntop,
            left : nleft
        });
        
        subview.width = subviewWidth;
        subview.height = subviewHeight;
        subview.right = subview.bottom = null;
        subview.top = (156 - 140) / 2 - 1; 
        subview.left = 10;
        container.add(subview);
        view.add(container);
        
        nleft += containerWidth;
        if(nleft >= Ti.Platform.displayCaps.platformWidth) {
            nleft = 0;
            ntop += containerHeight;
        }
    }
    
    return view;
}

module.exports = BigScrollView;
