// 
//  Review.js
//  StepInShopApp
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-01.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var CloudObject = require("model/CloudObject");

function Review(json) {'use strict';
    CloudObject.call(this);
    
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "Review";    
    };
    this.getEntriesUrl = function() {
        return "/collections/5069964f0f6602593e000d8f/entries";    
    };
    this.getFormFields = function(read) {
        var data = []; 
        data.push({ id : 'buying', title : "J'ai acheté ?", boolField : true});
        data.push({ id : 'go_back', title : "Je reviendrai ?", boolField : true});
        data.push({ id : 'rating', title : "Appréciation", starField : true});
        data.push({ id : 'comment', title : "Divers", hint : "Super boutique trop sympa"});
        return data;  
    };
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
    this.retrieveShop = function(func, extra) {
        this.retrieveObject('shop','Shop', func, extra);
    };
    this.setShop = function(shop) {
        this.setFieldObject('shop', shop);    
    };
    this.setUser = function(user) {
        this.setFieldObject('user', user);    
    };
    this.doActionsAfterCrud = function(tabGroup) {
        var review = this;
        this.retrieveObject('shop','Shop', function(shop) {
            if(shop) {
                var Reward = require("model/Reward"), 
                    rew = new Reward();
                rew.setUser(review.user);
                rew.setShop(shop);
                rew.setNbPoints(shop.getPoints('stepout'));
                rew.setActionKind("Step-Out");
                tabGroup.addNewReward(rew, true);
            }
        });
    };

    this.init(json);

    return this;
}

Review.prototype = CloudObject.prototype;
Review.prototype.constructor = Review;

module.exports = Review;
