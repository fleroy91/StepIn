// 
//  Shop.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var CloudObject = require("model/CloudObject");
Ti.include("/etc/Geolocation.js");

var _currentShop = null;
// var _currentObject = null;

function getReverseGeocoded(evt, func, me) { 'use strict';
    if (evt.success && evt.places.length > 0) {
        var i, text = "", place = evt.places[0];
        Ti.API.info("Place trouvée : " + JSON.stringify(place));
        me.address = (place.street || place.address); 
        me.zipcode = (place.zipcode || place.postalCode); 
        me.city = (place.city);
        func(me);
    }
}

function getGeocoded(e, func, me) { 'use strict';
    if (!e.success || e.error)
    {
        Ti.API.info("Code translation: "+ Geo.translateErrorCode(e.code) + JSON.stringify(e.error));
        // alert('error ' + JSON.stringify(e.error));
    } else {
        me.setLocation(e.coords.longitude, e.coords.latitude);
        // Try to reverse geocoding
        Titanium.Geolocation.reverseGeocoder(e.coords.latitude,e.coords.longitude,
            function(e) { getReverseGeocoded(e, func, me); });
    }
}
 
function Shop(json) {'use strict';
    CloudObject.call(this);
    
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "Shop";    
    };
    this.getEntriesUrl = function() {
        return '/collections/4ff6ed1e1b338a5c1e000094/entries';    
    };
    this.getFormPhotoFields = function() {
        return ['photo0'];
    };
    this.getFormFields = function() {
        return [ 
        { id : 'name', title : "Nom", hint : "Nom de la boutique"},
        { id : 'address', title : "Adresse"},
        { id : 'zipcode', title : "Code postal"},
        { id : 'city', title : "Ville"} 
        ];  
    };
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
    this.setUser = function(user) {
        this.setFieldObject('user', 'AppUser');
    };
    
    this.retrieveArticles = function(func) {
        var Article = require('model/Article'),
            art = new Article();
        var qparams = { 'shop.url' : this.getUrl() };
        this.getList(art, Tools.Hash2Qparams(qparams), function(result) {
            var i, data = null;
            if(result && result.length > 0) {
                data = [];
                for(i = 0 ; i < result.length; i ++) {
                    data.push(new Article(result[i]));    
                }
            }
            func(data);
        });
    };
    this.retrieveRewards = function(func) {
        var Reward = require('model/Reward'),
            rew = new Reward();
        var qparams = { 'shop.url' : this.getUrl() };
        this.getList(rew, Tools.Hash2Qparams(qparams), function(result) {
            var i, data = null;
            if(result && result.length > 0) {
                data = [];
                for(i = 0 ; i < result.length; i++) {
                    data.push(new Reward(result[i]));    
                }
            }
            func(data);
        });
    };
    
    this.retrieveShops = function(func) {
        var Shop = require('model/Shop'),
            shop = new Shop();
        var qparams = { 'shop.url' : this.getUrl() };
        this.getList(shop, Tools.Hash2Qparams(qparams), function(result) {
            var i, data = null;
            if(result && result.length > 0) {
                data = [];
                for(i = 0 ; i < result.length; i++) {
                    data.push(new Shop(result[i]));    
                }
            }
            func(data);
        });
    };
    this.geolocalize = function(func) {
        // _currentObject = this;
        if(Geo.isLocationServicesEnabled()) {
            Titanium.Geolocation.getCurrentPosition(function(e) { getGeocoded(e, func, this); });
        }
    };

    this.init(json);
    
    return this;
}

Shop.prototype = CloudObject.prototype;
Shop.prototype.constructor = Shop;

Shop.prototype.getName = function() {'use strict';
    return this.name;
};

Shop.prototype.getCity = function() {'use strict';
    return this.city;
};
Shop.prototype.getZipcode = function() {'use strict';
    return this.zipcode;
};
Shop.prototype.getAddress = function() {'use strict';
    return this.address;
};

Shop.prototype.setCurrentShop = function() {'use strict';
    Ti.API.info("AppUser JSON = " + JSON.stringify(this));
    Ti.App.Properties.setString('shop', JSON.stringify(this));
    _currentShop = this;
};

Shop.prototype.retrieveLocation = function(func) {'use strict';
    if(this.location)  {
        func(this.location);
    } else {
        var addr = this.address + ", " + this.zipcode + " " + this.city;
        
        Titanium.Geolocation.forwardGeocoder(addr, function(evt)
        {
            Ti.API.info('in forward ');
            func(evt);
        });
    }
};

Shop.getCurrentShop = function() {'use strict';
    Ti.API.info("AppUser JSON = " + Ti.App.Properties.getString('shop'));
    if (!_currentShop && Ti.App.Properties.getString('shop')) {
        var json = JSON.parse(Ti.App.Properties.getString('shop'));
        _currentShop = new Shop(json);
    }
    return _currentShop;
};

module.exports = Shop;
