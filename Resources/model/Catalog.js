// 
//  Catalog.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var CloudObject = require("model/CloudObject");

function Catalog(json) {'use strict';
    CloudObject.call(this);
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "Catalog";    
    };
    this.getEntriesUrl = function() {
        return "/collections/50c209ae0f66022ef800062d/entries";    
    };
    
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
    this.getKind = function() {
        return this.getField('kind');
    };
    this.init(json);

    return this;
}

Catalog.prototype = CloudObject.prototype;
Catalog.prototype.constructor = Catalog;

module.exports = Catalog;
