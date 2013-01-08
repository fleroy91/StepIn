// 
//  AdvertViewTransitions.js
//  StepIn
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-31.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, TV : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
function AdvertViewTransitions(currentWindow) { 'use strict';

    var self = Ti.UI.createImageView();
    
    var pub_slide_in =  Titanium.UI.createAnimation({right:320});
    var pub_slide_out =  Titanium.UI.createAnimation({left:320});

    var arrayImage=['/images/image1.jpg','/images/image2.jpg','/images/image3.jpg','/images/image4.jpg'];

    var nbImgs = arrayImage.length; 
    self.setImage(arrayImage[1]);


    currentWindow.add(self);
   
    setTimeout(function()
    {
    currentWindow.remove(self);
    self=null;
    },3000);
    
    return self;
}

module.exports = AdvertViewTransitions;