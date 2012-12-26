
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var CloudObject = require("model/CloudObject");

function Present(json) {'use strict';
    CloudObject.call(this);
    
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "Present";    
    };
    this.getEntriesUrl = function() {
        return "/collections/506ee0f80f6602438400115e/entries";    
    };
    this.getFormFields = function(read) {
        var data = []; 
        return data;  
    };
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
    this.doActionsAfterCrud = function(tabGroup) {
    };

    this.init(json);

    return this;
}

Present.prototype = CloudObject.prototype;
Present.prototype.constructor = Present;

module.exports = Present;
