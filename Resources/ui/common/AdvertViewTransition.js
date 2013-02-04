//
//  AdvertViewTransitions.js
//  StepIn
//
//  Created by Fr√©d√©ric Leroy on 2012-10-31.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
//
/*global Ti: true, Titanium : true, TV : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
function AdvertViewTransitions(currentWindow, index) {'use strict';

    /* if(index===10){
    index=1;
    }else if (index===20){
    index=2;
    }else if (index===30){
    index=3;
    }else if (index===40){
    index=4;
    }*/
    //TODO
    //if resolution sup 480 alors Iphone 5
    var self = Ti.UI.createImageView({
        width : 320,
        height : 480,
        left : -320
    });

    var pub_slide_in = Titanium.UI.createAnimation({
        left : 0
    });

    var pub_slide_out = Titanium.UI.createAnimation({
        left : 320
    });

    var arrayImage = ['', '/images/image6.jpg', '/images/image4.jpg', '/images/image1.jpg', '/images/image3.jpg', '', '/images/image5.jpg', '/images/image8.jpg', '/images/image9.jpg', '/images/image5.jpg', '/images/image7.jpg', '/images/image2.jpg', '/images/image5.jpg'];

    //TODO TO REMOVE ---- Used just for demo
    if (index === '11') {
        index = 1;
        self.setImage(arrayImage[index]);
    } else {
        self.setImage(arrayImage[index / 10]);
    }

    currentWindow.add(self);
    self.animate(pub_slide_in);

    function CloseAdvert() {
        self.animate(pub_slide_out);
        setTimeout(function() {
            currentWindow.remove(self);
            self = null;
        }, 1000);
    }


    self.addEventListener('click', CloseAdvert);

    return self;
}

module.exports = AdvertViewTransitions;
