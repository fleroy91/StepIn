// 
//  AppUser.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var CloudObject = require("model/CloudObject");
    
function AppUser(json) {'use strict';
    CloudObject.call(this);
    
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "AppUser";    
    };
    this.getEntriesUrl = function() {
        return "/collections/4ff6f9851b338a3e72000c64/entries";    
    };
    //--------------------------------------------------------
    this.getFormPhotoFields = function() {
        return ['photo0'];
    };
    this.getFormFields = function() {
        var dataEmail = [ 
            { id : 'email', title : "Email", hint : "john.smith@gmail.com", keyboardType : Titanium.UI.KEYBOARD_EMAIL},
            { id : 'password', title : "Mot de passe", passwordMask : true}
        ];
        var dataPhone = [
            { id : 'phone_number', hint : "Téléphone", events : { change :  function(e) {
                                    var p = e.source.value;
                                    var re = / /g;
                                    p = p.replace(re, '').replace('(','').replace(')', '');
                                    var pl = p.length;
                                    var i, str = p.substr(0,2);
                                    for ( i = 2; i < pl; i += 2) {
                                        str += ' ' + p.substr(i, 2);
                                    }
                                    e.source.value = str;
                                    if (pl >= 10) {
                                        e.source.blur();
                                    }
                                }}}
        ];
        var ret = dataPhone;
        if(! this.fb_token) {
            ret = dataEmail.concat(dataPhone);
        }
        return ret;
    };
    function isPhoneOk(phone) {
        var re = / /g;
        var p = phone.replace(re, '').replace('(','').replace(')', '');
        Ti.API.info("p = -" + p + "-" + p.length + (p.length === 10));
        return (p.length === 10);
    }

    this.validate = function() {
        var bOk = false;
        if (! isPhoneOk(this.phone_number)) {
            alert('Numéro de téléphone incorrect !');
        } else {
            if (this.fb_token) {
                bOk = true;
            } else {
                var p = this.password;
                var l = this.email;
                if (p.length < 4) {
                    alert('Mot de passe trop petit !');
                } else if (l.length < 5) {
                    alert('email incorrect !');
                } else {
                    bOk = true;
                }
            }
        }
        return bOk;
    };

    
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
    this.retrieveArticles = function(func, around) {
        var Article = require('model/Article'),
            art = new Article(), qparams = null;
        if(around) {
            var rayon = 1; // ie. km
            qparams = 'location!within=((' + this.getLatitude() +' ,' + this.getLongitude() + '), ' + Geo.km2rad(rayon) + ')';
        } 
        // else {
            // TODO : filtrer sur les users
        //} 
        
        this.getList(art, qparams, function(result) {
            var i, data = null;
            if(result && result.length > 0) {
                data = [];
                for(i = 0 ; i < result.length; i++) {
                    data.push(new Article(result[i]));    
                }
            }
            func(data);
        });
    };
    this.retrieveRewards = function(func) {
        var Reward = require('model/Reward'),
            rew = new Reward();
        var qparams = { 'user.url' : this.getUrl(), 'sort' : 'when', 'per_page' : 30, 'order' : 'desc' };
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
    
    this.retrieveShop = function(func, qparams) {
        if(this.shop) {
            func(this.shop);
        } else {
            var Shop = require('model/Shop'),
                shop = new Shop();
            qparams = qparams || {};
            qparams["app_user.url"] = Ti.Network.encodeURIComponent(this.getUrl());
            
            this.getList(shop, Tools.Hash2Qparams(qparams), function(result) {
                // Ti.API.info('GET shop : ' + JSON.stringify(result));
                if(!result || result.length === 0) { 
                    result = null;
                } else {
                    this.shop = new Shop(result[0]);
                    result = this.shop;
                }
                func(result);
            });
        }
    };
    
    this.retrieveUser = function(args, func) {
        this.getList(this, Tools.Hash2Qparams(args), function(result) {
            if(result.length === 0) { 
                result = null;
            } else {
                // TODO : return the list and not only the first AppUser !
                result = new AppUser(result[0]);
            }
            func(result); 
        });
    };
    this.setCurrentUser = function() {
        // Ti.API.info("AppUser JSON = " + JSON.stringify(this));
        Ti.App.Properties.setString('AppUser', JSON.stringify(this));
        AppUser.currentUser = this;
    };
    
    this.isAdmin = function() {
        return (! this.is_user);
    };
    this.getName = function() {
        return this.email;
    };
    
    var self = this;
    function getGeocoded(e, func) {
        if (!e.success || e.error)
        {
            Ti.API.info("Code translation: "+ Geo.translateErrorCode(e.code) + JSON.stringify(e.error));
        } else {
            self.setLocation(e.coords.longitude, e.coords.latitude);
            func(self);
        }
    }
    
    this.geolocalize = function(func) {
        if(Geo.isLocationServicesEnabled()) {
            Titanium.Geolocation.getCurrentPosition(function(e) { 
                getGeocoded(e, func); 
            });
        }
    };

    this.init(json);

    return this;
}

AppUser.prototype = CloudObject.prototype;
AppUser.prototype.constructor = AppUser;

AppUser.currentUser = null;

AppUser.getCurrentUser = function() {'use strict';
    // Ti.API.info("AppUser JSON = " + Ti.App.Properties.getString('AppUser'));
    if (!AppUser.currentUser && Ti.App.Properties.getString('AppUser')) {
        var json = JSON.parse(Ti.App.Properties.getString('AppUser'));
        AppUser.currentUser = new AppUser(json);
    }
    return AppUser.currentUser;
};

AppUser.prototype.getEmail = function() {'use strict';
    return this.email;
};

AppUser.prototype.setEmail = function(l) {'use strict';
    this.email = l;
};
AppUser.prototype.setPassword = function(p) {'use strict';
    this.password = p;
};
AppUser.prototype.setFBToken = function(p) {'use strict';
    this.fb_token = p;
};
AppUser.prototype.setIsUser = function(p) {'use strict';
    this.is_user = p;
};
AppUser.prototype.setPhoneNumber = function(p) {'use strict';
    this.phone_number = p;
};

AppUser.prototype.geoLocalize = function(func) {'use strict';
    Ti.include("etc/Geolocation.js");
    // We need to geolocalize the AppUser first !
    if(Geo.isLocationServicesEnabled())
    {
        Titanium.Geolocation.getCurrentPosition(function(e){
            if (!e.success || e.error)
            {
                Ti.API.info("Code translation: " + Geo.translateErrorCode(e.code));
                return;
            }
    
            var longitude = e.coords.longitude;
            var latitude = e.coords.latitude;
            this.setLocation(latitude, longitude);
            this.save();
            func();
        });
     }
};

module.exports = AppUser;

