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
var Spinner = require("/etc/AppSpinner");
var Image = require("/etc/AppImage");
var Scan = require("/model/Scan");
var AppUser = require("/model/AppUser");
var Reward = require("/model/Reward");
require("ti.viewshadow");

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
    
    this.getStepInPoints = function() {
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
        var shopImg = Ti.UI.createImageView({
            height : 30, 
            width : 30
        });
        Image.cacheImage(this.getPhotoUrl(0), function(image) {
            shopImg.setImage(Image.squareImage(image, 30));
        });
        
        var imgNormal = Image.createStepInStarPoints('/images/annotation-stepin.png', this.allPoints, false);
        var imgOver = Image.createStepInStarPoints('/images/annotation-stepin-over.png', this.allPoints, true);
        
        var annotation = Titanium.Map.createAnnotation({
            latitude:shoploc.lat,
            longitude:shoploc.lng,
            image : imgNormal, // '/images/annotation-stepin.png',
            imgNormal : imgNormal,
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
                    e.map.selectedAnnotation.setImage(e.map.selectedAnnotation.imgNormal); //'/images/annotation-stepin.png');
                }
                e.map.selectedAnnotation = e.annotation;
                e.annotation.setImage(imgOver); // '/images/annotation-stepin-over.png');
            }
            if(e.clicksource === "rightButton" || e.clicksource === "rightView") {
                var ShopDetailWindow = require('ui/common/ShopDetailWindow'),
                    win = new ShopDetailWindow(self, tabGroup);
                tabGroup.openWindow(null,win,{animated:true});
            }
        });
        return annotation;
    };
    
    this.createHeader = function(isBig) {
        var internBorder = 2;
        var shop = this;
        
        var ntop = (isBig ? 80 : 1);
            
        // We create a new header view
        var header = Ti.UI.createView({
            height : (isBig ? 135+63+10 : 65),
            top : 0
        });
        if(isBig) {
            Image.cacheImage(shop.getPhotoUrl(0), function(image) {
                header.setBackgroundImage(image);
            });
        } else {
            header.setBackgroundColor('#d92276');
        }
            
        // we create a view for shop details in the header
        var shopdetails = Ti.UI.createView({
            top : ntop + 17,
            height : 36,
            backgroundColor : 'black',
            opacity : 0.6,
            zIndex : 0
        });
        header.add(shopdetails);
            
        var labelName = Ti.UI.createLabel({
            font : {fontSize: 14, fontWeight : 'bold'},
            left : 73,
            top : shopdetails.top + internBorder,
            color:'white',
            zIndex : 1,
            text : shop.getName(),
            height : 13
        });
        header.add(labelName);
    
        // line 2
        var labelDetails = Ti.UI.createLabel({
            color : 'white',
            left : 73,
            top : shopdetails.top + 20,
            zIndex : 1,
            font : { fontSize : 12, fontWeight : 'normal'},
            text : shop.getDetails()
        }); 
        header.add(labelDetails);
    
        
        return header;
    };
    
    this.addOverHeader = function(view, tabGroup, isBig) {
        var internBorder = 2;
        var shop = this;
        
        var ntop = (isBig ? 80 : 1);
        
        var btShowMap = Ti.UI.createImageView({
            image : '/images/bullet.png',
            width : 25, 
            height: 25,
            top : ntop + 23,
            zIndex : 1,
            right : 5
        });
        view.add(btShowMap);
        
        var mapview = Ti.UI.createImageView({
            borderRadius : 1,
            borderWidth : 2,
            borderColor : 'white',
            zIndex : 100,
            height : 60,
            width : 60,
            bottom : 2,
            top : ntop,
            left : 9,
            shadow:{
                shadowColor:'gray',
                shadowRadius:2,
                shadowOpacity:0.7,
                shadowOffset:{x:3, y:3}
            }
        });
        if(! isBig) {
            Image.cacheImage(shop.getPhotoUrl(0), function(image) {
                mapview.setImage(Image.squareImage(image, 60));
            });
        } else {
            mapview.setImage("/images/smallmap.png");
        }

        view.add(mapview);
            
        function showMap() {
            var MapDetailWindow = require('/ui/common/MapDetailWindow'),
                swin = new MapDetailWindow(shop);
            tabGroup.activeTab.open(swin, {animated:true});
        }
            
        btShowMap.addEventListener('click', showMap);
        mapview.addEventListener('click', showMap);
    };
    
    this.createTableRow = function(tabGroup) {
        var self = this;
        var ntop = 133;
        var nleft = 0;
        var buttonHeight = 35;
        var advertHeight = 45;
        
        var row = Ti.UI.createTableViewRow({
            backgroundColor : '#f0f0f0',
            height : ntop + buttonHeight + advertHeight + 15 + 5,
            className : 'shopRow',
            object_index : this.index
        });
        var container = Ti.UI.createView({
            top : 5,
            left : 5,
            right : 5,
            bottom : 5,
            backgroundColor : 'white',
            borderRadius:2,
            borderColor : '#bdbfc3',
            shadow : {
                shadowOffset : {x:1,y:1},
                shadowRadius : 2
            } 
        });
        row.add(container);
        
        var internView = Ti.UI.createView({
            top : 5,
            left : 5,
            right : 5,
            bottom : 5
        });
        container.add(internView);
        
        var view = this.createHeader(true);
        internView.add(view);
        
        this.addOverHeader(internView, tabGroup, true);
        
        function createButton(title, image, width) {
            var ret = Ti.UI.createButton({
                style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
                image : image,
                title : title,
                font:{fontSize : 12, fontWeight : 'normal'},
                color : '#d92276',
                backgroundImage : '/images/bck-gradient-button.png',
                borderRadius : 0,
                borderColor : '#bdbfc3',
                width : width,
                height : buttonHeight,
                top : ntop,
                left : nleft
            });
            nleft += width - 1;
            return ret;
        }
        
        // Then we add 2 views : for step and for scan
        var stepInView = createButton(' +' + this.getStepInPoints() + ' steps', '/images/steps-small.png', 99);
        if(this.checkin) {
            stepInView.backgroundColor = '#eadae3';
        }
        internView.add(stepInView);
        
        stepInView.addEventListener('click', function(e) {
            if(! self.checkin) {
                alert("Entrez dans le magasin et gardez votre téléphone en main.\nVous gagnerez automatiquement des steps !");
            } else {
                alert("Vous avez déjà fait un Step-In aujourd'hui dans ce magasin ! Ré-essayez demain :-)");
            }
        });
        
        var scanView = createButton(' ' + this.scans.length + ' Articles', '/images/tag-small.png', 104);
        scanView.left = null;        
        internView.add(scanView);
        
        scanView.addEventListener('click', function(e) {
            var ScanListWindow = require("/ui/common/ScanListWindow"),
                swin = new ScanListWindow(self, tabGroup);
            tabGroup.openWindow(null, swin, {animated  :true});
        });

        var middleView = createButton(' Partager', '/images/checked-small.png', 99);
        middleView.left = null;
        middleView.right = 0;
        internView.add(middleView);
        
        ntop += buttonHeight;
        
        // then we add the advert
        var AdvertView = require("ui/common/AdvertView"),
            advertView = new AdvertView(['/images/advert1.png', '/images/advert2.png', '/images/advert3.png'], {
                height : advertHeight,
                bottom : 0,
                backgroundColor : 'white'
        });
        internView.add(advertView);
        
        row.moveNext = function() {
            advertView.moveNext();
        };
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
