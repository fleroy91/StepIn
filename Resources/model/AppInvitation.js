// 
//  Invitation.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var CloudObject = require("model/CloudObject");

function Invitation(json) {    'use strict';
    CloudObject.call(this);
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "AppInvitation";    
    };
    this.getEntriesUrl = function() {
        return "/collections/508e92f80f66022f510015e5/entries";    
    };
    
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
    this.retrieveInviter = function(func) {
        this.retrieveObject('inviter','AppUser', func);
    };
    this.retrieveInvited = function(func) {
        this.retrieveObject('invited','AppUser', func);
    };
    this.setInviter = function(user) {
        this.setFieldObject('inviter', user);    
    };
    this.setInvited = function(user) {
        this.setFieldObject('invited', user);    
    };

    this.init(json);

    return this;
}

Invitation.prototype = CloudObject.prototype;
Invitation.prototype.constructor = Invitation;

module.exports = Invitation;
