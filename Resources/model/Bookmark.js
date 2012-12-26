// 
//  Bookmark.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var CloudObject = require("model/CloudObject");

function Bookmark(json) {    'use strict';
    CloudObject.call(this);
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "Bookmark";    
    };
    this.getEntriesUrl = function() {
        return "/collections/50bf34860f6602134d0001df/entries";    
    };
    
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
   
    this.retrieveUser = function(func) {
        this.retrieveObject('user','AppUser', func);
    };
    this.retrieveScan = function(func) {
        this.retrieveObject('scan','Scan', func);
    };
    this.retrieveShop = function(func) {
        this.retrieveObject('shop','Shop', func);
    };
    this.setScan = function(art) {
        this.setFieldObject('scan', art);    
    };
    this.setShop = function(shop) {
        this.setFieldObject('shop', shop);    
    };
    this.setUser = function(user) {
        this.setFieldObject('user', user);    
    };
    this.init(json);

    return this;
}

Bookmark.prototype = CloudObject.prototype;
Bookmark.prototype.constructor = Bookmark;

module.exports = Bookmark;
