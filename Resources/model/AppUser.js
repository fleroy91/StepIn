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
var Spinner = require("etc/AppSpinner");
var Tools = require("etc/Tools");
var Reward = require('model/Reward');
var Bookmark = require('model/Bookmark');
var Invitation = require('model/AppInvitation');
            
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
            { id : 'firstname', title : "Prénom", hint : "John", keyboardType : Titanium.UI.KEYBOARD_EMAIL, autocorrect : false},
            { id : 'email', title : "Email", hint : "john.smith@gmail.com", keyboardType : Titanium.UI.KEYBOARD_EMAIL},
            { id : 'password', title : "Mot de passe", passwordMask : true}
        ];
        var dataPhone = [
            { id : 'phone_number', title : "Téléphone", hint : "Téléphone", events : { change :  function(e) {
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
    
    this.findInvitation = function(person) {
        var i;
        var invit = null;
        for(i = 0; !invit && Ti.App.allInvitations && i < Ti.App.allInvitations.length; i++) {
            var inv = Ti.App.allInvitations[i];
            var j, inter = false, emails = Tools.getEmails(person);
            for(j = 0; !inter && j < emails.length; j ++) {
                inter = (inv.emails.indexOf(emails[j]) >= 0);
            }
            if(inv.facebook_id === person.facebook_id || inter) {
                invit = inv;
            }
        }
        return invit;
    };
    
    this.getRewards = function() {
        return Ti.App.allRewards;
    };
    
    this.getBookmarks = function() {
        return Ti.App.allBookmarks;
    };
    
    this.saveBookmarks = function(toAdd, toDelete, endFunc) {
        var bookmarks = Ti.App.allBookmarks;
        var i;
        // We delete first
        for(i = 0; i < toDelete.length; i++) {
            // We need to find it
            var scan = toDelete[i];
            var found = false, j;
            for(j = 0; ! found && j < bookmarks.length; j++) {
                var b = bookmarks[j];
                if(b.scan.url === scan.getUrl()) {
                    b.remove();
                    b.inactive = true;
                    found = true;
                }
            }
        }
        var data = [];
        for(i = 0; bookmarks && i < bookmarks.length; i ++) {
            if(! bookmarks[i].inactive) {
                data.push(bookmarks[i]);
            }
        }
        Ti.App.allBookmarks = data;
        
        // Then we add        
        function _addBookmark(endFunc) {
            return function(newBook) {
                if(newBook) {
                    var data = Ti.App.allBookmarks;
                    if(! data) {
                        data = [];
                    }
                    data.push(newBook);
                    Ti.App.allBookmarks = data;
                }
                if(endFunc) {
                    endFunc();
                }
            };
        }
        for(i = 0; i < toAdd.length; i++) {
            var book = new Bookmark();
            book.setUser(this);
            book.setScan(toAdd[i]);
            book.setShop(toAdd[i].shop);
            book.create(_addBookmark(i === toAdd.length - 1 ? endFunc : null));
        }
        if( toAdd.length === 0 && endFunc) {
            endFunc();
        }
        
    };
    
    this.retrievePresents = function(func) {
        var Present = require('model/Present'),
            pres = new Present();
        this.getList(pres, Tools.Hash2Qparams({sort : 'points', order : 'asc'}),
                function(result) {
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
    
    this.getShopsLocation = function() {
        var i;
        var ret = { lat : 48.33, lng : 2.22};
        var l = 0, L = 0, nb = 0;
        for(i = 0; i < Ti.App.allShops.length; i++) {
            var shop = Ti.App.allShops[i];
            var shopLoc = shop.location;
            if(shopLoc) {
                nb ++;
                l+= shopLoc.lat;
                L+= shopLoc.lng;
            }
        }
        if(nb > 0) {
            // then we compute the average
            ret.lat = l / nb;
            ret.lng = L / nb;
        }
        return ret;
    };

    this.retrieveInvitations = function(func) {
        if(! this.isDummy()) {
            var invit = new Invitation();
            this.getList(invit, Tools.Hash2Qparams({
                    'inviter.url' : this.getUrl(),
                    per_page : 1000}), 
                function(result) {
                    var i, data = null;
                    if(result) {
                        data = [];
                        for(i = 0 ; i < result.length; i++) {
                            data.push(new Invitation(result[i]));    
                        }
                    }
                    Ti.App.allInvitations = data;
                    if(func) {
                        func(Ti.App.allInvitations);
                    }
                });
        } else {
            Ti.App.allInvitations = [];
            if(func) {
                func(Ti.App.allInvitations);
            }
        }
    };
    this.retrieveBookmarks = function(func) {
        var book = new Bookmark();
        Ti.App.allBookmarks = [];
        
        function _addBook(self) {
            return function(resultBook) {
                var data = null, i;
                if(resultBook) {
                    data = [];
                    for(i = 0 ; i < resultBook.length; i++) {
                        var b = new Bookmark(resultBook[i]);
                        data.push(b);    
                    }
                }
                Ti.App.allBookmarks = data;
                if(func) {
                    func(Ti.App.allRewards);
                }
            };
        }
        // Get back the bookmarks immediately after
        this.getList(book, Tools.Hash2Qparams({'user.url' : this.getUrl() }),
            _addBook(this));
    };
    
    this.retrieveRewards = function(func) {
        function _addRewards(self) {
            return function(result) {
                var i, data = null;
                if(result) {
                    data = [];
                    for(i = 0 ; i < result.length; i++) {
                        data.push(new Reward(result[i]));    
                    }
                }
                Ti.App.allRewards = data;
                self.retrieveBookmarks(func);
            }; 
        }

        if(! this.isDummy()) {
            var rew = new Reward();
            var now = new Date();
            var dateOffset = (24*60*60*1000) * 7; // 7 days
            now.setTime(now.getTime() - dateOffset);
            var myUrl = this.getUrl();
            
            this.getList(rew, Tools.Hash2Qparams({
                    'user.url' : myUrl,
                    'when!gte' : now.toISOString(), 
                    sort : 'when', 
                    order : 'desc'}),
                    _addRewards(this)); 
        } else {
            Ti.App.allRewards = [];
            Ti.App.allBookmarks = null;
            if(func) {
                func(Ti.App.allRewards);
            }
        }
    };
    
    this.retrieveInvitationsAndRewards = function(func) {
        function _retrieveRewards(self) {
            return function() {
                self.retrieveRewards(func);
            };
        }
        this.retrieveInvitations(_retrieveRewards(this));
    };
    
    var fOnNewShop = null;
    function addNewShop(shop) {
        var nshop = AppUser.addShop(shop);
        fOnNewShop(nshop);
    }
    
    function getShops(self, tags, onNewShop, finalFunc) {
        fOnNewShop = onNewShop;
        
        var rayon = 1000; // ie. km (very large !!!)
        var userloc = self.location;
        var qparams = {};
        qparams['location!near']  = '((' + userloc.lat +',' + userloc.lng + '),' + Geoloc.km2Rad(rayon) + ')';
        qparams.per_page = 20;
        // We only get the shops with beancode
        qparams["beancode!gt"] = 0;
        
        if(tags && tags.length > 0) {
            var i;
            for(i = 0; i < tags.length; i++) {
                var tag = tags[i];
                if(tag.value) {
                    qparams["tags!in[]"] = tag.tag;
                }
            }
        }
        
        var Shop = require('model/Shop'),
            shop = new Shop();
        self.getList(shop, Tools.Hash2Qparams(qparams), function(result) {
            Ti.App.allShops = [];
            var i, data = null;
            if(result && result.length > 0) {
                for(i = 0 ; i < result.length; i++) {
                    var s = new Shop(result[i]);
                    s.retrieveCatalogs(addNewShop, Ti.App.allRewards, (i === result.length -1 ? finalFunc : null));
                }
            }
        });
    }
    
    this.retrieveShops = function(tags, onNewShop, finalFunc) {
        Spinner.show();
        this.geolocalize(function(self) {
            self.setCurrentUser();
            if(! Ti.App.allRewards) {
                self.retrieveInvitationsAndRewards(function(allRewards) {
                    getShops(self, tags, onNewShop, finalFunc);
                });              
            } else {
                getShops(self, tags, onNewShop, finalFunc);
            }
        });
    };
    
    this.checkAll = function(func) {
        Spinner.show();
        // We need to retrieve Rewards and then go through all shops and compute their rewards availability
        this.retrieveInvitationsAndRewards(function(allRewards) {
            var i;
            for(i = 0; i < Ti.App.allShops.length; i ++) {
                var shop = Ti.App.allShops[i];
                shop.computeAvailablePoints(allRewards);
            }
            if(func) {
                func();
            }
            Spinner.hide();
        });
    };
    
    this.deleteAllRewards = function(func) {
        Spinner.show();
        var rew = new Reward();
        function _deleteAllRewards(self) {
            return function(result) {
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
                Spinner.hide();
            };        
        }
        
        this.getList(rew, Tools.Hash2Qparams({
                'user.url' : this.getUrl(),
                'per_page' : 1000}),
            _deleteAllRewards(this)); 
    };
    
    this.deleteAllInvitations = function(func) {
        Spinner.show();
        var invit = new Invitation();
        function _deleteAllInvitations(self) {
            return function(result) {
                var i;
                if(result && result.length > 0) {
                    for(i = 0 ; i < result.length; i++) {
                        var inv = new Invitation(result[i]);
                        inv.remove();
                    }
                }
                if(func) {
                    func(self);
                }
                Spinner.hide();
            };
        }
        
        this.getList(invit, Tools.Hash2Qparams({
                'inviter.url' : this.getUrl(),
                'per_page' : 1000}),
            _deleteAllInvitations(this)); 
    };

    this.updateReward = function(reward) {
        var shop = AppUser.getShop(reward.shop.index);
        if(! shop) {
            shop = AppUser.findShop(reward.shop.url);
        }
        if(reward.getActionKind() === Reward.ACTION_KIND_STEPIN) {
            reward.setNbPoints((shop.getStepInPoints() || 0) + (reward.bonusFB || 0));
        } else if(reward.getActionKind() === Reward.ACTION_KIND_SCAN) {
            reward.setNbPoints((shop.getScanPoints(reward.code) || 0) + (reward.bonusFB || 0));
        }
        return reward;
    };
    
    this.retrieveUser = function(args, func) {
        Spinner.show();
        this.getList(this, Tools.Hash2Qparams(args), function(result) {
            if(result.length === 0) { 
                result = null;
            } else {
                result = new AppUser(result[0]);
            }
            func(result);
            Spinner.hide(); 
        });
    };
    
    this.retrieveFBUser = function(func) {
        this.retrieveUser({fb_token : Titanium.Facebook.getAccessToken()}, func);
    };
    
    this.reload = function(func) {
        if(! this.isDummy()) {
            this.retrieveUser({m_url : this.m_url}, function(newUser) {
                if(! newUser) {
                    newUser = new AppUser();
                }
                func(newUser);
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
            Ti.App.allBookmarks = null;
            Ti.App.allInvitations = null;
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
        return this.total_points || 0;
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
        function _geolocalize(self) {
            return function(e) { 
                getGeocoded(e, func, self); 
            };
        }
        
        if(Geoloc.isLocationServicesEnabled()) {
            Titanium.Geolocation.getCurrentPosition(_geolocalize(this));
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

/**
 * Get a shop in the global array
 * 
 * @param {Number} index : the 1-N index in the array
 * @returns {Shop} : the object found or null
 */
AppUser.getShop = function(index) { 'use strict';
    return Ti.App.allShops[index - 1];
};
/**
 * Get the shop list
 * 
 * @returns {Shops} : the array of objects 
 */
AppUser.getAllShops = function() { 'use strict';
    return Ti.App.allShops;
};
/**
 * Find a shop in the global array by using the m_url field
 * 
 * @param {String} url : m_url of the shop
 * @returns {Shop} : the object found or null
 */
AppUser.findShop = function(url) { 'use strict';
    var i, shop = null;
    for(i = 0; !shop && i < Ti.App.allShops.length; i ++) {
        if(Ti.App.allShops[i].m_url === url) {
            shop = Ti.App.allShops[i];
        }
    }
    return shop;
};
/**
 * Add a shop in the global array
 * 
 * @param {Shop} shop : the object to add
 * @returns {Shop} : the object updated with the index (1-N) field (his place in the array)
 */
AppUser.addShop = function(shop) { 'use strict';
    var data = Ti.App.allShops;
    shop.index = data.length + 1;
    data.push(shop);
    Ti.API.info("Adding a shop : " + JSON.stringify(shop));
    Ti.App.allShops = data;
    return shop;       
};

/**
 * Add a reward in the global rewards array
 * 
 * @param {Reward} rew : the reward to add
 * @returns {Reward} : the reward updated with the index (1-N) field (his place in the array)
 */
AppUser.addReward = function(rew) { 'use strict';
    rew.index = Ti.App.allRewards.length + 1;
    var data = Ti.App.allRewards;  
    data.push(rew);
    Ti.App.allRewards = data;
    return rew;
};

/**
 * Add an invitation in the global invitations array
 * 
 * @param {invitation} invit : the invitation to add
 * @returns {invitation} : the invitation updated with the index (1-N) field (his place in the array)
 */
AppUser.addInvitation = function(invit) { 'use strict';
    Ti.API.info("Ajout d'une invitation : " + invit.inspect());
    invit.index = Ti.App.allInvitations.length + 1;
    var data = Ti.App.allInvitations;  
    data.push(invit);
    Ti.App.allInvitations = data;
    return invit;
};
/**
 * Update the shop in the global shops array
 * 
 * @param {shop} shop : the shop to update - we use the index of the shop to locate it
 * @returns : nothing  
 */
AppUser.updateShop = function(shop) { 'use strict';
    if(shop.index) 
    {
        var data = Ti.App.allShops;
        data[shop.index-1] = shop;
        Ti.App.allShops = data;
    }
};

module.exports = AppUser;

