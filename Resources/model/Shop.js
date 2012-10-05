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
var Image = require("/etc/Image");
var AppUser = require("/model/AppUser");

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
        Ti.API.info("Code translation: "+ Geoloc.translateErrorCode(e.code) + JSON.stringify(e.error));
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
        if(Geoloc.isLocationServicesEnabled()) {
            Titanium.Geolocation.getCurrentPosition(function(e) { getGeocoded(e, func, this); });
        }
    };
    
    // --------------------------------------------------------
    // Internal method
    // --------------------------------------------------------
    this.getName = function() {
        return this.name;
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
    
    this.isCheckin = function() {
        return this.checkin;
    };

    this.getPoints = function(action_kind) {
        action_kind = action_kind || 'stepin';
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
    this.doActionsAfterCrud = function(tabGroup) {
        tabGroup.updateObject(this);
    };
    // --------------------------------------------------------
    // For display in table view !
    // --------------------------------------------------------
    this.computeDistance = function() {
        var user = AppUser.getCurrentUser();
        if(this.location) {
            var shoploc = this.location;
            var self = this;
            var userloc = user.location;
            if(! user.location) {
                user.geolocalize(function(newuser) {
                    newuser.setCurrentUser();
                });
            } else {
                this.distance = Math.round(Geoloc.computeDistance(shoploc.lat, shoploc.lng, userloc.lat, userloc.lng) / 5) * 5;
            }   
        }
    };
    this.updateReadViewWithLocation = function() {
        var rowShop = this.rowShop,
            rowSelf = this.rowSelf,
            mapview = rowShop.mapview;
            
        if(this.location) {
            var shoploc = this.location;
            var region = {latitude: shoploc.lat,longitude:shoploc.lng,latitudeDelta:0.01, longitudeDelta:0.01, regionFit:false},
                user = AppUser.getCurrentUser();

            if(user.location) {
                var userloc = user.location;
                var w = Math.abs(shoploc.lat - userloc.lat);
                var h = Math.abs(shoploc.lng - userloc.lng);
                region.latitudeDelta = w * 1.15;
                region.longitudeDelta = h * 1.15;
            }
            mapview.setRegionFit(false);
            mapview.setRegion(region);
            mapview.setLocation(region);
            
            var shopImg = Image.createImageView('read', this.getPhotoUrl(0), null, { height : 30, width : 30});
            
            var annotation = Titanium.Map.createAnnotation({
                latitude:shoploc.lat,
                longitude:shoploc.lng,
                leftView : shopImg,
                title : this.getName(),
                subtitle : this.getDetails(),
                animate:true
            });
            mapview.addAnnotation(annotation);
            mapview.selectAnnotation(annotation);
            
            if(this.distance === null) {
                this.computeDistance();
            }
            if(this.distance !== null) {
                rowSelf.labelDistance.setText((this.distance || "0") + " mètres");
            }
        }
    };
    
    this.createReadView = function(header, footer) {
        var internBorder = 2;
        var internHeight = 90;
        var internShopHeight = 130;
        var labelHeight = Math.round((internHeight - (4 * internBorder)) / 4);
        
        var tv = Ti.UI.createTableView({
            height : 'auto',
            scrollable : true,
            allowsSelection : false,
            footerView : footer,
            headerView : header,
            style : Titanium.UI.iPhone.TableViewStyle.GROUPED
        });
        
        // The description of the article
        var rowSelf = Ti.UI.createTableViewRow({
            height : internHeight,
            object : this
        });
        
        // Line 1
        var labelName = Ti.UI.createLabel({
            font : {fontSize: 14, fontWeight : 'bold'},
            color:'#576996',
            text : this.getName(),
            left : internBorder,
            top : internBorder,
            height : labelHeight
        });
        rowSelf.add(labelName);
    
        // line 2
        var labelDetails = Ti.UI.createLabel({
            color : '#222',
            font : { fontSize : 12, fontWeight : 'normal'},
            text : this.getDetails(),
            height : labelHeight,
            left : labelName.left,
            top : labelName.top + labelName.height + internBorder
        }); 
        rowSelf.add(labelDetails);
        
        // line 3 (the review)
        var StarView = require("/ui/common/StarView");
        var viewRate = new StarView({
            height : labelHeight, 
            value : this.rating, 
            left : labelName.left,
            top : labelDetails.top + labelDetails.height + internBorder
        });
        rowSelf.add(viewRate);

        // last line
        var labelTags = Ti.UI.createLabel({
            font : {fontSize: 11},
            color : 'gray', 
            text : this.tags.toString(),
            width : (300 - labelName.left - 80),
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            left : labelName.left,
            bottom : internBorder,
            height : labelHeight
        });
        rowSelf.add(labelTags);

        var labelDistance = Ti.UI.createLabel({
            font : {fontSize: 10, fontStyle : 'italic'},
            color : 'lightgray', 
            text : "",
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            right : internBorder * 2,
            bottom : internBorder,
            height : labelHeight
        });
        rowSelf.add(labelDistance);
        rowSelf.labelDistance = labelDistance;
        this.rowSelf = rowSelf;
        
        // The description of the shop
        var rowShop = Ti.UI.createTableViewRow({
            height : internShopHeight,
            object : this
        });
        
        var user = AppUser.getCurrentUser();
        var loc = (this.location || user.location || {lat : 48.833, lng : 2.333});
        
        var mapview = Titanium.Map.createView({
            mapType: Titanium.Map.STANDARD_TYPE,
            animate:true,
            region : { latitude: loc.lat,
                longitude: loc.lng,
                latitudeDelta:0.005, 
                longitudeDelta:0.005},
            regionFit:true,
            userLocation:true,
            zIndex : 1,
            bottom : 2,
            top : 0 
        });
        rowShop.add(mapview);
        rowShop.mapview = mapview;
        
        var zoom = Titanium.UI.createButton({
            image:'/images/magnifying_glass.png',
            backgroundColor : 'transparent',
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            heigth : 16,
            bottom : 2,
            right : 0,
            zIndex : 2    
        });
        rowShop.add(zoom);
        zoom.addEventListener('click', function(e) {
            Image.displayMapZoom(mapview); 
        });
        
        tv.setData([rowSelf, rowShop]);
        
        this.tv = tv;
        this.rowShop = rowShop;
        
        // We need to update the view
        this.updateReadViewWithLocation();
        
        return tv;
    };
    
    this.createTableRow = function() {
        var internBorder = 2;
        var internHeight = 70;
        var labelHeight = Math.round((internHeight - 2 * internBorder) / 3);
         
        var row = Ti.UI.createTableViewRow({
            hasChild : true,
            height : internHeight + 2 * internBorder
        });
        
        var nbPhotos = this.getNbPhotos();
        if(nbPhotos === 0) { nbPhotos = 1;}
        
        var imgs = [];
        var i;
        for(i = 0; i < nbPhotos; i ++) {
            var img = Image.createImageView('read', this.getNthPhotoUrl(i), null, {noEvent : true});
            imgs.push(img);
        }
        
        var sc = Ti.UI.createScrollableView({
            views : imgs,
            top : internBorder,
            left : internBorder,
            height : internHeight,
            width : internHeight,
            borderWith : 1,
            borderColor : 'black',
            borderRadius : 2,
            pagingControlHeight : 7,
            pagingControlColor : 'gray',
            showPagingControl : (nbPhotos > 1)
        });
        row.add(sc);
        
        var vPoints = Image.createPointView(this.getPoints(), 50,50);
        vPoints.right = internBorder * 2;
        row.add(vPoints);

        var labelName = Ti.UI.createLabel({
            font : {fontSize: 14, fontWeight : 'bold'},
            color:'#576996',
            text : this.getName(),
            left : sc.width +  2 * internBorder,
            top : internBorder,
            width : 300- (sc.width + 2 * internBorder + vPoints.width + 2 * internBorder), 
            height : labelHeight
        });
        row.add(labelName);
    
        var labelDetails = Ti.UI.createLabel({
            color : '#222',
            font : { fontSize : 12, fontWeight : 'normal'},
            text : this.getDetails(),
            height : labelHeight,
            width : labelName.width,
            left : labelName.left,
            top : labelName.top + labelName.height + internBorder
        }); 
        row.add(labelDetails);

        var labelTags = Ti.UI.createLabel({
            font : {fontSize: 11},
            color : 'gray', 
            text : this.tags.toString(),
            width : (320 - labelName.left - 80),
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            left : labelName.left,
            bottom : internBorder,
            height : labelHeight
        });
        row.add(labelTags);
        
        var labelDistance = Ti.UI.createLabel({
            font : {fontSize: 10, fontStyle : 'italic'},
            color : 'lightgray', 
            text : null,
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            right : internBorder * 2,
            bottom : internBorder,
            height : labelHeight
        });
        row.add(labelDistance);
        row.labelDistance = labelDistance;
                
        row.object = this;
        return row;
    };
    this.updateRow = function(row) {
        // We run a distance computation
        if(row.labelDistance) {
            if(! this.hasOwnProperty('distance')) {
                this.computeDistance();            
            }
            if(this.distance !== null) {
                row.labelDistance.setText(this.distance + " mètres");
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
