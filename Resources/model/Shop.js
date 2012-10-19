// 
//  Shop.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var CloudObject = require("model/CloudObject");
var Geoloc = require("/etc/Geoloc");
var Tools = require("/etc/Tools");
var Spinner = require("/etc/Spinner");
var Image = require("/etc/AppImage");
var Scan = require("/model/Scan");
var AppUser = require("/model/AppUser");
var Reward = require("/model/Reward");

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
    
    this.setCheckin = function(val) {
        this.checkin = val;
        if(val) {
            this.allPoints -= this.stepinPoints;
        } else {
            this.allPoints += this.stepinPoints;
        }
        AppUser.updateShop(this);  
    };
    
    this.getStepinPoints = function() {
        return this.stepinPoints;
    };
    
    this.getScanPoints = function(code) {
        var i, ret = 0;
        var data = this.scans;
        for(i = 0; i < data.length; i++) {
            if(data[i].code === code && ! data[i].scanned) {
                ret = data[i].getNbPoints();
            }
        }
        return ret;
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
        Spinner.show();
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
            Spinner.hide();
        });
    };
    
    // --------------------------------------------------------
    // Internal method
    // --------------------------------------------------------
    this.getName = function() {
        return this.name;
    };
    this.getTitle = function() {
        return this.getName();
    };
    
    this.getCity = function() {
        return this.city;
    };
    this.getZipcode = function() {
        return this.zipcode;
    };
    this.getAddress = function() {
        return this.address;
    };
    this.getDetails = function() {
        return this.address + ", " + (this.zipcode ? this.zipcode + " " : "") + this.city;
    };
    this.getExtraFormWindowOptions = function(crud) {
        return ((crud === 'read') ? { addStepsActions : true } : { addLocalizationButton : true });
    };
    this.saveAll = function() {
        AppUser.updateShop(this);  
    };
    this.isCheckin = function() {
        return this.checkin;
    };

    this.getPoints = function(action_kind) {
        action_kind = action_kind || Reward.ACTION_KIND_STEPIN;
        var ret = 250; // Default value for points !!!
        if(this.points) {
            ret = this.points[action_kind];
        }
        return ret;
    };
    this.retrieveLocation = function(func) {
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
    this.enableAllScans = function() {
        var i;
        var data = this.scans;
        for(i = 0; i < data.length; i++) {
            data[i].scanned = false;
            this.allPoints += data[i].points;
            this.allPossiblePoints += data[i].points;
        }  
        this.scans = data;
    };
    this.disableScan = function(rew) {
        var i;
        var data = this.scans;
        for(i = 0; i < data.length; i++) {
            if(rew.code === data[i].code) {
                data[i].scanned = true;
                this.allPoints -= data[i].points;
            }
        }  
        this.scans = data;
    };
    this.getScan = function(index) {
        return this.scans[index - 1];
    };
    this.setScan = function(scan) {
        var data = this.scans;
        data[scan.index - 1] = scan;
        this.scans = data;
        this.saveAll();
    };
    this.computeAvailablePoints = function(rewards) {
        // We have to check for :
        // - Checkin
        // - Scans
        
        // TODO : we don't need the rewards to do that
        this.prev_checkin = this.checkin;
        this.prev_points = this.allPossiblePoints;
        
        this.checkin = false;
        this.allPoints = 0;
        this.allPossiblePoints = this.getPoints(Reward.ACTION_KIND_STEPIN) || 0;
        this.stepinPoints = this.getPoints(Reward.ACTION_KIND_STEPIN) || 0;
        this.enableAllScans();
        var i, nb_checkins = 0;
        for(i = 0; i < rewards.length; i++) {
            var rew = rewards[i];
            var now = new Date();
            if(rew.shop && rew.shop.url === this.m_url) {
                var elapsedTime = rew.howLong(now); 
                if(rew.getActionKind() === Reward.ACTION_KIND_STEPIN) {
                    var points = this.getPoints(Reward.ACTION_KIND_STEPIN);
                    // We count the number of CI done during the week
                    nb_checkins ++;
                    if(elapsedTime <= 24 * 60) {
                        this.checkin = true;
                        this.stepinPoints = 0;
                    }     
                } else if(rew.getActionKind() === Reward.ACTION_KIND_SCAN) {
                    if(elapsedTime <= 24 * 60) {
                        this.disableScan(rew);                        
                    }
                }
            }
        }
        if(! this.checkin && nb_checkins > 0) {
            this.stepinPoints = Math.round(this.getPoints(Reward.ACTION_KIND_STEPIN) / (nb_checkins * nb_checkins));
        }
        this.allPoints += this.stepinPoints;
        this.changed = (this.prev_checkin !== this.checkin || this.prev_points !== this.allPossiblePoints);
        AppUser.updateShop(this);
    };
    
    this.retrieveScansAndComputeAvailablePoints = function(func, rewards, finalFunc) {
        Spinner.show();
        var Scan = require("/model/Scan"),
            scan = new Scan();
        var self = this;
        this.getList(scan, Tools.Hash2Qparams({ "shop.url" : this.getUrl() }), function(scans) {
            var i, data = [];
            for(i = 0; i < scans.length; i++) {
                var s = new Scan(scans[i]);
                s.index = i + 1;
                data.push(s);
            }
            self.scans = data;
            
            self.computeAvailablePoints(rewards);
            if(func) {
                func(self);
            }
            if(finalFunc) {
                finalFunc();
            }
            Spinner.hide();
        });
    };
    
    this.doActionsAfterCrud = function(tabGroup) {
        tabGroup.updateObject(this);
    };
    // --------------------------------------------------------
    // For display in table view !
    // --------------------------------------------------------
    this.setDistance = function(label, dist) {
        if(dist && label) {
            if(dist > 1000) {
                label.setText("A " + Math.round(dist / 10) / 100 + " km.");
            } else {
                label.setText("A " +dist + " m.");
            }
        }
    };
    
    this.computeDistance = function(func) {
        var user = AppUser.getCurrentUser();
        if(this.location) {
            var shoploc = this.location;
            var self = this;
            var userloc = user.location;
            if(! user.location) {
                user.geolocalize(function(newuser) {
                    newuser.setCurrentUser();
                    var userloc = newuser.location;
                    this.distance = Math.round(Geoloc.computeDistance(shoploc.lat, shoploc.lng, userloc.lat, userloc.lng) / 5) * 5;
                    if(func) {
                        func(this.distance);
                    }
                });
            } else {
                this.distance = Math.round(Geoloc.computeDistance(shoploc.lat, shoploc.lng, userloc.lat, userloc.lng) / 5) * 5;
                if(func) {
                    func(this.distance);
                }
            }   
        }
    };
    this.createAnnotation = function(tabGroup) {
        var shoploc = this.location;
        var self = this;
        var shopImg = Image.createImageView('read', this.getPhotoUrl(0), null, { height : 30, width : 30});
        
        var annotation = Titanium.Map.createAnnotation({
            latitude:shoploc.lat,
            longitude:shoploc.lng,
            image : '/images/pointer-regular.png',
            leftView : shopImg,
            rightButton : (tabGroup ? '/images/bullet.png' : null),
            title : this.getName(),
            subtitle : this.getDetails(),
            animate:true,
            shop:this
        });
        annotation.addEventListener('click', function(e) {
            if(e.annotation && e.clicksource === 'pin') {
                if(e.map.selectedAnnotation && e.map.selectedAnnotation !== e.annotation) {
                    e.map.selectedAnnotation.setImage('/images/pointer-regular.png');
                }
                e.map.selectedAnnotation = e.annotation;
                e.annotation.setImage('/images/pointer-over.png');
            }
            if(e.clicksource === "rightButton" || e.clicksource === "rightView") {
                var ShopDetailWindow = require('ui/common/ShopDetailWindow'),
                    win = new ShopDetailWindow(self, tabGroup);
                tabGroup.openWindow(null,win,{animated:true});
            }
        });
        return annotation;
    };
    
    this.getTwoFreeScans = function() {
        var j, ret = null, nb = 0;
        var scans = this.scans;
        for(j = 0; scans && nb < 4 && j < scans.length; j++) {
            var s = scans[j];
            if(! s.scanned) {
                if(! ret) { ret = []; }
                ret.push(s);
                nb ++;
            }
        }
        return ret;
    };
    
    this.createTableRow = function() {
        var internBorder = 2;
        var internHeight = 75;
        var labelHeight = Math.round((internHeight - 2 * internBorder) / 3);
        var allPoints = this.allPossiblePoints;
        var stepinPoints = this.getPoints(Reward.ACTION_KIND_STEPIN);
        var scanPoints = allPoints - stepinPoints;
         
        var row = Ti.UI.createTableViewRow({
            className : 'shopRow',
            height : internHeight + 2 * internBorder,
            backgroundColor : (this.checkin ? '#eadae3' : '#f0f0f0')
        });
        
        var img = Ti.UI.createImageView({
            left : 5,
            height : 60,
            width : 60,
            borderWith : 0,
            borderRadius : 0,
            shadow:{
                shadowRadius:2,
                shadowOpacity:0.3,
                shadowOffset:{x:2, y:2}
            }
        });
        Image.cacheImage(this.getPhotoUrl(0), function(image) {
            img.setImage(Image.cropImage(image, 60,60));
        }); 
        row.add(img);
        
        var btAction = Ti.UI.createImageView({
            image : (allPoints > 0 ? '/images/bullet.png' : '/images/checked.png'),
            width : 25,
            height : 25,
            right : 5
        });
        row.add(btAction);
    
        var vPoints = Image.createIconsPointView(allPoints, (stepinPoints > 0), (scanPoints > 0),
        {
            right : btAction.right + btAction.width + internBorder,
            height : 60
        });
        row.add(vPoints);

        var labelName = Ti.UI.createLabel({
            font : {fontSize: 14, fontWeight : 'bold'},
            color:'#323232',
            text : this.getName(),
            left : 70,
            top : 23,
            width : 140, 
            height : labelHeight
        });
        row.add(labelName);
        
        var labelDistance = Ti.UI.createLabel({
            font : {fontSize: 12},
            color : '#646464', 
            text : null,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            left : labelName.left,
            top : 40,
            width : labelName.width,
            height : labelHeight
        });
        row.add(labelDistance);
        row.labelDistance = labelDistance;
        this.updateRow(row);
                
        row.object_index = this.index;
        return row;
    };
    
    this.updateRow = function(row) {
        // We run a distance computation
        if(row.labelDistance) {
            if(! this.hasOwnProperty('distance')) {
                var self = this;
                this.computeDistance(function(dist) {
                    self.setDistance(row.labelDistance, dist);
                });            
            } else {
                this.setDistance(row.labelDistance, this.distance);
            }
        }
        return row;
    };

    // MUsT BE at the end of the file after all the methods definition 
    this.init(json);
    
    return this;
}

Shop.prototype = CloudObject.prototype;
Shop.prototype.constructor = Shop;

Shop.prototype.setCurrentShop = function() {'use strict';
    Ti.API.info("AppUser JSON = " + JSON.stringify(this));
    Ti.App.Properties.setString('shop', JSON.stringify(this));
    _currentShop = this;
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
