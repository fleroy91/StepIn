// 
//  Reward.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var CloudObject = require("model/CloudObject");

function Reward(json) {    'use strict';
    CloudObject.call(this);
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "Reward";    
    };
    this.getEntriesUrl = function() {
        return "/collections/4ff6f04c1b338a3e720006cd/entries";    
    };
    
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
    this.getActionKind = function() {
        return this.getField('action_kind');
    };
    this.getWhen = function() {
        return this.getField('when');
    };
    this.getNbPoints = function() {
        return this.getField('nb_points');
    };
    this.retrieveUser = function(func) {
        this.retrieveObject('user','AppUser', func);
    };
    this.retrieveShop = function(func) {
        this.retrieveObject('shop','Shop', func);
    };
    this.setShop = function(shop) {
        this.setFieldObject('shop', shop);    
    };
    this.setUser = function(user) {
        this.setFieldObject('user', user);    
    };
    this.setActionKind = function(ak) {
        this.setField('action_kind', ak);    
    };
    this.setNbPoints = function(nb) {
        this.setField('nb_points', nb);    
    };
    this.isClosedTo = function(rew) {
        var close = false;
        if(rew.action_kind === this.action_kind && rew.shop.m_url === this.shop.m_url) {
            // Same action on the same shop
            // We need to compute the distance in time
            var w1 = new Date(Date.parse(this.when)),
                w2 = new Date(Date.parse(rew.when));
            // 5 hours
            close = (Math.abs(w1 - w2) < 5 * 3600 * 1000);
        }
        return close;
    };
    this.createTableRow = function() {
        var row = Ti.UI.createTableViewRow({
            hasChild : false,
            height : 50,
            backgroundColor : ((this.nb_points < 0) ? 'red' : 'white'),
            opacity : 0.5
        });
    
        var labelName = Ti.UI.createLabel({
            font : {fontSize: 16, fontWeight : 'bold'},
            color:'#576996',
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            text : this.nb_points + " pts",
            left : 8,
            top : 2,
            width : 80,
            height : 50
        });
        row.add(labelName);
    
        var labelDetails = Ti.UI.createLabel({
            color : '#222',
            font : { fontSize : 12, fontWeight : 'normal'},
            text : this.action_kind + "\nLe " + this.when.toLocaleString(),
            left : 84,
            height : 50,
            top : 2
        }); 
        row.add(labelDetails);
    
        row.object = this;
        return row;
    };
    this.when = new Date();
    this.init(json);

    return this;
}

Reward.prototype = CloudObject.prototype;
Reward.prototype.constructor = Reward;

module.exports = Reward;
