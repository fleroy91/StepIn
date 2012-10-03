//
//  StarView.js
//  StepInShopApp
//
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
//
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

function StarView(options) {'use strict';

    var rateView = Ti.UI.createView(options), 
        max = 5, 
        min = 1, i;
    var stars = [];
    // used in the flexMin and flexMax

    function rate(v) {
        // Default value
        if(! v) { v = 3;}
        
        rateView.value = v;
        for(i = min; i <= max ; i ++) {
            stars[i].setImage( v>= i ? "/images/star.png" : "/images/star_highlighted.png");
        }
    }

    function starClick(e) {
        rate(e.source.rating);
    }

    for (i = min; i <= max; i++) {
        var star = Ti.UI.createButton({
            // styling including the darker or light colored stars you choose,
            image : "/images/star.png",
            width : 15,
            height : 15,
            left : 5 + (20 * (i-1)),
            rating : i
        });
        star.addEventListener('click', starClick);
        stars[i] = star;
        rateView.add(star);
    }
    
    rate(options.value);
    return rateView;
}

module.exports = StarView; 