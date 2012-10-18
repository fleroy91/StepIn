// 
//  CloudObject.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 

/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var DataManager = require('services/DataManager'),
    _dm = new DataManager();
    
var Image = require("/etc/AppImage");

function CloudObject(json) {'use strict';

    // -------------------------------------------------------
    // MUST BE overload in sub classes
    // -------------------------------------------------------
    this.getCloudType = function() {
        alert("To be overloaded !");    
    };
    this.getEntriesUrl = function() {
        alert("To be overloaded !");    
    };
    // Initialisation
    this.init = function(json) {
        if(json) {
            Ti.API.info("In object creation : " + this.getCloudType());
            var key;
            for(key in json) {
                if(json.hasOwnProperty(key)) {
                    this[key] = json[key];
                }
            }
            this.current_version = this.m_version || this.current_version;
            this.m_version = null;
        }
    };
    this.init(json);
    
    // -------------------------------------------------------
    // Public instance methods
    // -------------------------------------------------------
    this.getField = function(id) {
        return this[id];
    };
    this.setField = function(id, val) {
        this[id] = val;
    };
    this.setFieldObject = function(id, obj) {
        this[id] = { url : (obj.m_url || obj.url), m_type: obj.m_type };
    };
    this.getPhotoUrl = function(index) {
        var elem = this['photo' + index];
        var ret = null ;
        if(elem) {
            ret = elem.m_url + "?m_version=" + this.current_version;
        }
        //Ti.API.info(this.m_type + "-" + this.current_version + "-photo: " + ret);
        return ret;
    };
    this.getNbPhotos = function() {
        var i;
        var nbPhotos = 0;
        var fields = this.getFormPhotoFields(),
            nbFields = (fields ? fields.length : 0);
        for(i = 0; i < nbFields; i ++) {
            if(this.getPhotoUrl(i)) { nbPhotos ++; }
        }
        return nbPhotos;
    };
    this.getNthPhotoUrl = function(nth) {
        var i;
        var ret = null;
        var fields = this.getFormPhotoFields(),
            nbFields = (fields ? fields.length : 0);
        for(i = 0; !ret && i < nbFields; i ++) {
            var url = this.getPhotoUrl(i); 
            if(url) {
                if(nth === 0) {
                    ret = url; 
                }
                nth -- ;
            }
        }
        return ret;
    };

    this.setPhoto = function(index, blob) {
        var photo = this['photo' + index];
        if(! photo) { photo = {}; }
        photo.content_type = "image/png";
        photo.filename = 'photo' + index + '.png';
        if(! blob) {
            photo.remove = "true";
        } else {
            var enc = Ti.Utils.base64encode(blob);
            photo.data = enc.toString();
            photo.blob = blob;
        }
        this['photo' + index] = photo;
    };
    
    this.retrieveObject = function(id, mclass, func, extra) {
        var Obj = require('model/' + mclass);
        if(this[id] && this[id] instanceof Obj) {
            func(this[id], extra);
        } else {
            var object = new Obj(this[id]);
            
            _dm.getObject(object, null, function(result) {
                var newobj = new Obj(result);
                this[id] = newobj ;            
                func(newobj, extra);
            });
        }
    };
    
    this.getUrl = function() {
        var result = (this.m_url || this.url);
        return result; 
    };
    
    this.cachePhotos = function() {
        var newVersion = (this.current_version ? this.current_version + 1 : 1); 
        var nbPhotos = this.getNbPhotos(), i;
        for(i = 0; i < nbPhotos ; i++) {
            var photo = this['photo' + i];
            if(photo && photo.m_url && photo.blob) {
                Image.replaceCache(this.getPhotoUrl(i), newVersion, photo.blob);
                // No more useful so we clean it
                photo.blob = null;
            }
        }
    };

    this.save = function(func, extra) {
        this.cachePhotos();
        _dm.updateObject(this, function(json) {
           var result = null;
           if(json && json.m_type) {
               var Obj = require("/model/" + json.m_type);
               result = new Obj(json);
           } 
           if(func) {
               func(result, extra);
           }
        });
    };
    
    this.getJSON = function(bForPost) {
        this.m_type = this.getCloudType();
        var str; 
        if(bForPost) {
            str = JSON.stringify({entry:this});
        } else {
            str = JSON.stringify(this);
        }
        return str;
    };

    this.create = function(func, extra) {
        this.cachePhotos();
        _dm.createObject(this, function(json) {
            var result = null;
            if(json && json.m_type) {
               var Obj = require("/model/" + json.m_type);
               result = new Obj(json);
            } 
            if(func) { 
                func(result, extra);
            }
        });   
    };
    this.remove = function(func, extra) {
        _dm.removeObject(this, func, extra);
    };
    
    this.getList = function(obj, qparams, func, extra) {
        _dm.getList(obj, qparams, func, extra);
    };
    this.setLocation = function(lng, lat) {
        this.location = { m_type : 'Location', lng : lng, lat : lat};    
    };
    this.getLocation = function() {
        return this.location;  
    };

    // -------------------------------------------------------
    // can overload in sub classes
    // -------------------------------------------------------
    this.getFormPhotoFields = function() {
        return null;
    };
    // Should return [{id : id, option : option}]
    this.getFormFields = function() {
        return null;
    };
    this.isCheckin = function() {
        return false;
    };
    // Return true or gives some alerts
    this.validate = function() {
        return true;
    };
    // Return a list of options for the Form Window
    this.getExtraFormWindowOptions = function(crud) {
        return null;
    };
    this.getPoints = function() {
        return 0;
    };
    this.doActionsAfterCrud = function(args) {
        return null;
    };
    this.updateRow = function(row) {
        return row;
    };

    return this;
}

module.exports = CloudObject;
