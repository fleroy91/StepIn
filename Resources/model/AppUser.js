// 
//  AppUser.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var CloudObject = require("model/CloudObject");
var Geoloc = require("etc/Geoloc");
var Tools = require("etc/Tools");
var Reward = require('model/Reward');
            
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
            { id : 'firstname', title : "Prénom", hint : "John", keyboardType : Titanium.UI.KEYBOARD_EMAIL},
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
    this.isDummy = function() {
        return (! this.m_url);
    };
    
    this.getRewards = function() {
        return Ti.App.allRewards;
    };
    
    this.addReward = function(rew) {
        if(! Ti.App.allRewards) {
            Ti.App.allRewards = [];
        }
        Ti.App.allRewards.push(rew);
    };

    this.retrievePresents = function(func) {
        var Present = require('model/Present'),
            pres = new Present();
        this.getList(pres, Tools.Hash2Qparams({sort : 'points', order : 'asc'}), function(result) {
            var i, data = null;
            if(result && result.length > 0) {
                data = [];
                for(i = 0 ; i < result.length; i++) {
                    data.push(new Present(result[i]));    
                }
            }
            func(data);
        });
    };
    
    this.retrieveRewards = function(func) {
        if(! this.isDummy()) {
            var rew = new Reward();
            var now = new Date();
            var dateOffset = (24*60*60*1000) * 7; // 7 days
            now.setTime(now.getTime() - dateOffset);
            this.getList(rew, Tools.Hash2Qparams({
                    'user.url' : this.getUrl(),
                    'when!gte' : now.toISOString(), 
                    sort : 'when', 
                    order : 'desc'}), 
                function(result) {
                    var i, data = null;
                    if(result) {
                        data = [];
                        for(i = 0 ; i < result.length; i++) {
                            data.push(new Reward(result[i]));    
                        }
                    }
                    Ti.App.allRewards = data;
                    if(func) {
                        func(Ti.App.allRewards);
                    }
                });
        } else {
            Ti.App.allRewards = [];
            if(func) {
                func(Ti.App.allRewards);
            }
        }
    };
    
    function getShops(self, tags, onNewShop, finalFunc) {
        var rayon = 1000; // ie. km (very large !!!)
        var userloc = self.location;
        var qparams = {};
        qparams['location!near']  = '((' + userloc.lat +',' + userloc.lng + '),' + Geoloc.km2Rad(rayon) + ')';
        qparams.per_page = 20;
        // We only get the shops with beancode
        qparams["beancode!gt"] = 6000;
        
        if(tags && tags.length > 0) {
            var i;
            for(i = 0; i < tags.length; i++) {
                var tag = tags[i];
                if(tag.value) {
                    qparams["tags!in[]"] = tag.tag;
                }
            }
        }
        
        function addNewShop(shop) {
            shop = AppUser.addShop(shop);
            onNewShop(shop);
        }
        
        var Shop = require('model/Shop'),
            shop = new Shop();
        self.getList(shop, Tools.Hash2Qparams(qparams), function(result) {
            Ti.App.allShops = [];
            var i, data = null;
            if(result && result.length > 0) {
                for(i = 0 ; i < result.length; i++) {
                    var s = new Shop(result[i]);
                    s.retrieveScansAndComputeAvailablePoints(addNewShop, Ti.App.allRewards, (i === result.length -1 ? finalFunc : null));
                }
            }
        });
    }
    
    this.retrieveShops = function(tags, onNewShop, finalFunc) {
        this.geolocalize(function(self) {
            self.setCurrentUser();
            if(! Ti.App.allRewards) {
                self.retrieveRewards(function(allRewards) {
                    if(allRewards) {
                        getShops(self, tags, onNewShop, finalFunc);
                    } else {
                        alert("Houston we have a problem !!!"); 
                    } 
                });              
            } else {
                getShops(self, tags, onNewShop, finalFunc);
            }
        });
    };
    
    this.checkAll = function(func) {
        // We need to retrieve Rewards and then go through all shops and compute their rewards availability
        this.retrieveRewards(function(allRewards) {
            var i;
            for(i = 0; i < Ti.App.allShops.length; i ++) {
                var shop = Ti.App.allShops[i];
                shop.computeAvailablePoints(allRewards);
            }
            if(func) {
                func();
            }
        });
    };
    
    this.deleteAllRewards = function(func) {
        var rew = new Reward();
        var self = this;
        this.getList(rew, Tools.Hash2Qparams({
                'user.url' : this.getUrl(),
                'per_page' : 1000}), 
            function(result) {
                var i;
                if(result && result.length > 0) {
                    for(i = 0 ; i < result.length; i++) {
                        var r = new Reward(result[i]);
                        r.remove();
                    }
                }
                if(func) {
                    func(self);
                }
            });
    };
    
    this.updateReward = function(reward) {
        var shop = AppUser.getShop(reward.shop.index);
        if(! shop) {
            shop = AppUser.findShop(reward.shop.url);
        }
        if(reward.getActionKind() === Reward.ACTION_KIND_STEPIN) {
            reward.setNbPoints(shop.getStepinPoints());
        } else if(reward.getActionKind() === Reward.ACTION_KIND_SCAN) {
            reward.setNbPoints(shop.getScanPoints(reward.code));
        }
        return reward;
    };
    
    this.getTwoFreeShops = function() {
        var ret = null;
        if(Ti.App.allShops) {
            var i;
            for(i = 0; i < Ti.App.allShops.length; i ++) {
                var shop = Ti.App.allShops[i];
                if(! ret) { ret = []; }
                if(! shop.checkin) {
                    ret.push(shop);
                }
            }
        }
        return ret;
    };
    
    this.retrieveUser = function(args, func) {
        this.getList(this, Tools.Hash2Qparams(args), function(result) {
            if(result.length === 0) { 
                result = null;
            } else {
                result = new AppUser(result[0]);
            }
            func(result); 
        });
    };
    this.reload = function(func) {
        if(! this.isDummy()) {
            this.retrieveUser({m_url : this.m_url}, function(newUser) {
                if(newUser) {
                    func(newUser);
                }
            });
        } else {
            func(this);
        }
    };
    
    this.setCurrentUser = function() {
        Ti.App.Properties.setString('AppUser', JSON.stringify(this));
        // If the new current user is not the same as the previous one, we need to reset the rewards
        if(Ti.App.currentUser && ! this.isDummy() && Ti.App.currentUser.m_url !== this.m_url) {
            Ti.App.allRewards = null;
        }
        Ti.App.currentUser = this;
    };
    
    this.isAdmin = function() {
        return (! this.is_user);
    };
    this.getName = function() {
        return this.email;
    };
    this.getTotalPoints = function() {
        return this.total_points;
    };
    this.setTotalPoints = function(points) {
        this.total_points = points;
    };
    this.saveAll = function() {
        this.setCurrentUser();
        this.save();
    };
    function getGeocoded(e, func, me) {
        if (!e.success || e.error)
        {
            Ti.API.info("Code translation: "+ Geoloc.translateErrorCode(e.code) + JSON.stringify(e.error));
        } else {
            me.setLocation(e.coords.longitude, e.coords.latitude);
            func(me);
        }
    }
    
    this.geolocalize = function(func) {
        if(Geoloc.isLocationServicesEnabled()) {
            var self = this;
            Titanium.Geolocation.getCurrentPosition(function(e) { 
                getGeocoded(e, func, self); 
            });
        }
    };

    this.init(json);

    return this;
}

AppUser.prototype = CloudObject.prototype;
AppUser.prototype.constructor = AppUser;

AppUser.getCurrentUser = function() {'use strict';
    // Ti.API.info("AppUser JSON = " + Ti.App.Properties.getString('AppUser'));
    if (!Ti.App.currentUser && Ti.App.Properties.getString('AppUser')) {
        var json = JSON.parse(Ti.App.Properties.getString('AppUser'));
        Ti.App.currentUser = new AppUser(json);
    }
    return Ti.App.currentUser;
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

AppUser.getShop = function(index) { 'use strict';
    return Ti.App.allShops[index - 1];
};
AppUser.findShop = function(url) { 'use strict';
    var i, shop = null;
    for(i = 0; !shop && i < Ti.App.allShops.length; i ++) {
        if(Ti.App.allShops[i].m_url === url) {
            shop = Ti.App.allShops[i];
        }
    }
    return shop;
};
AppUser.addShop = function(shop) { 'use strict';
    var data = Ti.App.allShops;
    shop.index = data.length + 1;
    data.push(shop);
    Ti.App.allShops = data;
    return shop;       
};

AppUser.addReward = function(rew) { 'use strict';
    Ti.App.allRewards.push(rew);
};

AppUser.updateShop = function(shop) { 'use strict';
    if(shop.index) {
        var data = Ti.App.allShops;
        data[shop.index-1] = shop;
        Ti.App.allShops = data;
    }
};

AppUser.prototype.geoLocalize = function(func) {'use strict';
    // We need to geolocalize the AppUser first !
    if(Geoloc.isLocationServicesEnabled())
    {
        Titanium.Geolocation.getCurrentPosition(function(e){
            if (!e.success || e.error)
            {
                Ti.API.info("Code translation: " + Geoloc.translateErrorCode(e.code));
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

