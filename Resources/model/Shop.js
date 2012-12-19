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
var Catalog = require("/model/Catalog");
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
    this.getCatalogPoints = function() {
        return this.catalogPoints;
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
    this.findScan = function(url) {
        var i;
        var ret = null;
        for(i = 0; !ret && i < this.scans.length; i++) {
            if(this.scans[i].getUrl() === url) {
                ret = this.scans[i];
            }
        }  
        return ret;
    };
    
    var socialRewards = null;
    
    this.computeSocialInfos = function(socialView) {
        var socialUsers = [];
        var socialPoints = 0;
        var socialHeight = socialView.height;
        
        var nright = 2;
        function addPic(image) {
            var pic = Ti.UI.createImageView({
                image : image || '/images/111-user.png',
                width : socialHeight - 10,
                height : socialHeight - 10,
                right : nright,
                shadow : {
                    shadowOffset : {x:1,y:1},
                    shadowRadius : 2
                }
            });
            socialView.add(pic);
            nright += (socialHeight - 10) + 2;
        }

        var i;
        for(i = 0; socialRewards && i < socialRewards.length; i ++) {
            var rew = socialRewards[i];
            socialPoints += rew.nb_points;
            var userUrl = rew.user.url;
            if(socialUsers.indexOf(userUrl) === -1) {
                socialUsers.push(userUrl);
            }
        }
        
        if(socialUsers.length > 1) {
            socialView.lblSocial.setText(socialUsers.length + " visites récentes");
        } else if(socialUsers.length === 1) {
            socialView.lblSocial.setText("1 visite récente");
        }

        function loadUserPic(self, userUrl) {
            self.retrieveUrl(userUrl, 'AppUser', function(u) {
                Image.cacheImage(u.getPhotoUrl(0), function(image) {
                    addPic(image);
                });
            });
        }
        
        // We select 3 random pics
        var indexes = Tools.randomSelect(socialUsers, 3);
        var j;
        for(j = 0 ; indexes && j < indexes.length; j ++) {
            loadUserPic(this, socialUsers[indexes[j]]);
        }
        
        return (socialPoints > 0);
    };
        
    this.computeAvailablePoints = function(rewards) {
        // We have to check for :
        // - Checkin
        // - Scans
        
        // TODO : we don't need the rewards to do that
        this.prev_checkin = this.checkin;
        this.prev_catalogViewed = this.catalogViewed;
        this.prev_points = this.allPossiblePoints;
        
        this.checkin = false;
        this.catalogViewed = false;
        this.allPoints = 0;
        this.allPossiblePoints = this.getPoints(Reward.ACTION_KIND_STEPIN) || 0;
        this.stepinPoints = this.getPoints(Reward.ACTION_KIND_STEPIN) || 0;
        this.catalogPoints = this.getPoints(Reward.ACTION_KIND_CATALOG) || 0;
        this.enableAllScans();
        var nb_checkins = 0, i;
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
                } else if(rew.getActionKind() === Reward.ACTION_KIND_CATALOG) {
                    if(elapsedTime <= 24 * 60 * 7) {
                        // We need to find the catalog
                        var j;
                        for(j = 0; j < this.catalogs.length; j ++) {
                            var catalog = this.catalogs[j];
                            if(catalog.getUrl() === rew.catalog) {
                                catalog.viewed = true;
                                this.catalogViewed = true;                        
                            }
                        }
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
        this.allPoints += this.stepinPoints + this.catalogPoints;
        this.changed = (this.prev_checkin !== this.checkin || this.prev_catalogViewed !== this.catalogViewed || this.prev_points !== this.allPossiblePoints);
        AppUser.updateShop(this);
    };
    this.getSocialRewards = function(func, rewards, finalFunc) {
        var rew = new Reward();
        var now = new Date();
        var dateOffset = (24*60*60*1000) * 7; // 7 days
        now.setTime(now.getTime() - dateOffset);
        
        function addSocialRewards(self) {
            return function(rews) {
                socialRewards = rews;
                
                self.computeAvailablePoints(rewards);
                if(func) {
                    func(self);
                }
                if(finalFunc) {
                    finalFunc();
                }
                Spinner.hide();
            };
        }
        
        Ti.API.info("Get Social Rewards of " + this.name);
        this.getList(rew, Tools.Hash2Qparams({ "shop.url" : this.getUrl(), "when!gte" : now.toISOString()}), 
            addSocialRewards(this)
        );
    };
    
    this.retrieveScansOfCatalog = function(cindex, func, rewards, finalFunc) {
        var scan = new Scan();
        
        function _addNewScans(self) {
            return function(scans) {
                var i, data = [];
                for(i = 0; scans && i < scans.length; i++) {
                    var s = new Scan(scans[i]);
                    s.shopUrl = self.getUrl();
                    s.index = self.scans.length + 1;
                    self.scans.push(s);
                }
                self.retrieveScansOfCatalog(cindex + 1, func, rewards, finalFunc);
            }; 
        }
        
        if(cindex < this.catalogs.length) {
            var catalog = this.catalogs[cindex];
            Ti.API.info("Retrieve Scans of Catalog " + cindex + " of " + this.name);
            this.getList(scan, Tools.Hash2Qparams({ "catalog.url" : catalog.getUrl() }), _addNewScans(this));
        } else {
            this.getSocialRewards(func, rewards, finalFunc);         
        }
    };
    
    this.retrieveScans = function(func, rewards, finalFunc) {
        Spinner.show();
        var scan = new Scan();
        
        function _addNewScans(self) {
            return function(scans) {
                var i, data = [];
                for(i = 0; scans && i < scans.length; i++) {
                    var s = new Scan(scans[i]);
                    s.shopUrl = self.getUrl();
                    s.index = i + 1;
                    data.push(s);
                }
                self.scans = data;
            
                self.getSocialRewards(func, rewards, finalFunc);         
            };
        }
        
        if(this.catalogs && this.catalogs.length > 0) {
            this.scans = [];
            this.retrieveScansOfCatalog(0, func, rewards, finalFunc);
        } else {
            this.getList(scan, Tools.Hash2Qparams({ "shop.url" : this.getUrl() }), _addNewScans(this));
        }
    };
    
    this.retrieveCatalog = function(cindex, func, rewards, finalFunc) {
        function addNewCatalog(self) {
            return function(catalog) {
                self.catalogs[cindex] = catalog;
                self.retrieveCatalog(cindex + 1, func, rewards, finalFunc);
            };
        }
        
        if(cindex < this.catalogs.length) {
            var cat = this.catalogs[cindex];
            Ti.API.info("Retrieve catalog " + cindex + " of " + this.name + ":" + cat.url);
            this.retrieveUrl(cat.url, 'Catalog', addNewCatalog(this));
        } else {
            this.retrieveScans(func, rewards, finalFunc);
        }
    };
    
    this.retrieveCatalogs = function(func, rewards, finalFunc) {
        this.retrieveCatalog(0, func, rewards, finalFunc);
    };  
    
    this.doActionsAfterCrud = function(tabGroup) {
        tabGroup.updateObject(this);
    };
    // --------------------------------------------------------
    // For display in table view !
    // --------------------------------------------------------
    this.setDistance = function(row, dist) {
        if(dist && row) {
            if(dist > 1000) {
                row.distance = "à " + Math.round(dist / 10) / 100 + " km.";
            } else {
                row.distance = "à " +dist + " m.";
            }
        }
    };
    
    this.computeDistance = function(func) {
        var user = AppUser.getCurrentUser();
        if(this.location) {
            var shoploc = this.location;
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
        
        function manageAnnotation(self) {
            return function(e) {
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
            };
        }
        
        annotation.addEventListener('click', manageAnnotation(this));
        return annotation;
    };
    
    this.createHeader = function(isBig, callback) {
        var internBorder = 2;
        var shop = this;
        
        var ntop = (isBig ? 80 : 1);
            
        // We create a new header view
        var header = Ti.UI.createButton({
            height : (isBig ? 135+63+10 : 65),
            top : 0,
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            borderRadius : 0,
            borderWidth : 0
        });
        if(isBig) {
            Image.cacheImage(shop.getPhotoUrl(0), function(image) {
                header.setBackgroundImage(image);
            });
        } else {
            header.setBackgroundColor('white');
        }
        
        if(callback) {
            header.addEventListener('click', callback);
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
    
    this.addOverHeader = function(view, tabGroup, isBig, gotoShop) {
        var internBorder = 2;
        var shop = this;
        
        var ntop = (isBig ? 80 : 1);
        
        var btShowMap = Ti.UI.createButton({
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            image : '/images/bullet.png',
            width : 25, 
            height: 25,
            top : ntop + 21,
            zIndex : 100,
            right : 5
        });
        view.add(btShowMap);
        
        var mapview = Ti.UI.createButton({
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            //borderRadius : 1,
            //borderWidth : 2,
            //borderColor : 'white',
            zIndex : 100,
            height : 45,
            width : 45,
            top : ntop+7,
            left : 4,
            //shadow:{
              //  shadowRadius:2,
                //shadowOpacity:0.7,
                //shadowOffset:{x:2, y:2}
            //}
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
            
        if(gotoShop) {
            btShowMap.addEventListener('click', gotoShop);
        } else {
            btShowMap.addEventListener('click', showMap);
            
        }
        mapview.addEventListener('click', showMap);
    };
    
    this.createTableRow = function(tabGroup) {
        var ntop = 133;
        var nleft = 0;
        var buttonHeight = 35;
        var advertHeight = 45;
        var socialHeight = 45;
        
        var row = Ti.UI.createTableViewRow({
            backgroundColor : '#ffffff',
            height : ntop + buttonHeight + 15 + 5,
            className : 'shopRow',
            object_index : this.index,
            selectedBackgroundColor :'#f0f0f0' 
        });
        
        var containerShadow = Ti.UI.createView({
            top : 5,
            left : 5,
            right : 5,
            bottom : 5,
            borderRadius:3,
            borderColor : '#bdbfc3',
            backgroundColor : 'white',
            shadow : {
                shadowOffset : {x:2,y:2},
                shadowRadius : 2
            } 
        });
        row.add(containerShadow);
        
        var container = Ti.UI.createView({
            top : 5,
            left : 5,
            right : 5,
            bottom : 5
        });
        row.add(container);
        
        var internView = Ti.UI.createView({
            top : 5,
            left : 5,
            right : 5,
            bottom : 5
        });
        container.add(internView);
        
        function gotoShop(self) {
            return function() {
                var ShopDetailWindow = require("ui/common/ShopDetailWindow"),
                    swin = new ShopDetailWindow(self, tabGroup);
                
                tabGroup.openWindow(null, swin, {animated:true});
            };
        }
        
        var view = this.createHeader(true, gotoShop(this));
        internView.add(view);

        this.addOverHeader(internView, tabGroup, true, gotoShop(this));
        
        var socialView = Ti.UI.createView({
            top : ntop,
            height : socialHeight,
            backgroundColor : 'white',
            borderRadius : 0,
            borderColor : '#bdbfc3',
            borderWidth : 1
        });
        
        var lblSocial = Ti.UI.createLabel({
            font : {fontSize : 11},
            color : Ti.App.PinkColor,
            width : 200,
            left : 2
        });
        socialView.add(lblSocial);
        socialView.lblSocial = lblSocial;
        
        if(this.computeSocialInfos(socialView)) {
            internView.add(socialView);
            ntop += socialHeight - 1;
            row.height += socialHeight;
        }
        
        function createButton(title, image, width) {
            var ret = Ti.UI.createButton({
                style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
                image : image,
                title : title,
                font:{fontSize : 18, fontWeight : 'bold'},
                color : Ti.App.PinkColor,
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
        var nbCatalogs = (this.catalogs && this.catalogs.length) || 0;
        var stepInView = createButton(' ' + this.getPoints(Reward.ACTION_KIND_STEPIN) + ' steps', '/images/steps-small.png', '50%');
        stepInView.left = 0;
        stepInView.right = null;        
        internView.add(stepInView);
        
        var stepCataView = createButton(' ' + this.catalogPoints * nbCatalogs + ' steps',
            '/images/catalog.png', '50%');
        stepCataView.left = null;
        stepCataView.right = 0;        
        internView.add(stepCataView);
        
        stepInView.addEventListener('click', gotoShop(this));
        stepCataView.addEventListener('click', gotoShop(this));
        ntop += buttonHeight;
        
        this.updateRow(row);
        
        return row;
    };
    
    this.updateRow = function(row) {
        // We run a distance computation
        function manageDist(self) {
            return function(dist) {
               self.setDistance(row, dist);
            };
        }
        
        if(! this.hasOwnProperty('distance')) {
            this.computeDistance(manageDist(this));            
        } else {
            this.setDistance(row, this.distance);
        }
        return row;
    };

    // Must BE at the end of the file after all the methods definition 
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
