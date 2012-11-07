// 
//  BigScrollView.js
//  StepIn
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-29.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, TV : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
require("ti.viewshadow");

/** 
 * Big scroll views of boxes with shadow
 * 
 * @param {Object} options : view options standard options - REQUIRED : data
 * @param {Object} [subviewWidth] : the width of the box (default is 160)
 * @param {Object} [subviewHeight] : the height of the box (default is 156)
 */
function BigScrollView(options, subviewWidth, subviewHeight) { 'use strict';
    options.scrollType = 'vertical';
    options.backgroundColor = 'white';
    
    subviewWidth = subviewWidth || 142;
    subviewHeight = subviewHeight || options.data[0].height;
    
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
            // backgroundImage : '/images/bck-shadow.png',
            // backgroundColor : 'white',
            top : ntop,
            left : nleft
        });
        
        subview.top = (156 - 140) / 2 - 1; 
        subview.left = 10;
        var shadowView = Ti.UI.createView({
            width : subview.width,
            height : subview.height,
            shadow :{
                shadowRadius:2,
                shadowOpacity:0.7,
                shadowOffset:{x:2, y:2}
            },
            top : subview.top,
            left : subview.left,
            zIndex : -1
        });
        subview.right = subview.bottom = null;
        subview.backgroundColor = 'white';
        container.add(shadowView);
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
