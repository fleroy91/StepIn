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
            leftView : shopImg,
            rightButton : (tabGroup ? Titanium.UI.iPhone.SystemButton.DISCLOSURE : null),
            title : this.getName(),
            subtitle : this.getDetails(),
            animate:true
        });
        
        annotation.addEventListener('click', function(e) {
            if(e.clicksource === "rightButton") {
                var obj = self,
                    FormWindow = require('ui/common/FormWindow'),
                    crud, title;
                    
                if(Ti.App.adminMode) {
                    crud = 'update';
                    title = 'Edition';
                } else {
                    crud = 'read';
                    title = obj.getName();
                }
                var win = new FormWindow(null, crud, obj, tabGroup, obj.getExtraFormWindowOptions(crud));
                tabGroup.activeTab.open(win,{animated:true});
            }
        });
        return annotation;
    };
    this.updateReadViewWithLocation = function(view) {
        var mapview = view.mapview;
            
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
            var annotation = this.createAnnotation();
            mapview.addAnnotation(annotation);
            // mapview.selectAnnotation(annotation);
            
            if(this.distance === null) {
                this.computeDistance();
            }
            if(this.distance !== null && view.labelDistance) {
                view.labelDistance.setText((this.distance || "0") + " mètres");
            }
        }
    };
    
    this.createReadView = function(header, footer, tabGroup) {
        var internBorder = 2;
        var internHeight = 74;
        var labelHeight = 13;
        
        // Header : 135 + 63
        // Row : 74
        
        // We create a new header view
        var newHeader = Ti.UI.createView({
            height : 135+63
        });
        Image.cacheImage(this.getPhotoUrl(0), function(image) {
            newHeader.setBackgroundImage(image);
        });
        /*
        // First view
        var imgView = Image.createImageView('read', this.getPhotoUrl(0), null, {
            width : '100%',
            height : Titanium.UI.SIZE,
            top : 0,
            zIndex : -1
        });
        newHeader.add(imgView);
        */
        
        // we create a view for shop details in the header
        var shopdetails = Ti.UI.createView({
            top : 97,
            height : 36,
            backgroundColor : 'black',
            opacity : 0.8,
            zIndex : 0
        });
        
        // Line 1
        var labelName = Ti.UI.createLabel({
            font : {fontSize: 12, fontWeight : 'bold'},
            left : 70,
            top : internBorder,
            color:'white',
            opacity : 1,
            zIndex : 1,
            text : this.getName(),
            height : labelHeight
        });
        shopdetails.add(labelName);
    
        // line 2
        var labelDetails = Ti.UI.createLabel({
            color : 'white',
            left : 70,
            opacity : 1,
            top : 20,
            zIndex : 1,
            font : { fontSize : 10, fontWeight : 'normal'},
            text : this.getDetails()
        }); 
        shopdetails.add(labelDetails);
        var btShowMap = Ti.UI.createButton({
            image : '/images/actionpink.png',
            width : 22, 
            height: 22,
            zIndex : 1,
            right : 2
        });
        shopdetails.add(btShowMap);
        newHeader.add(shopdetails);
        
        // Mini map
        var user = AppUser.getCurrentUser();
        var loc = (this.location || user.location || {lat : 48.833, lng : 2.333});
        
        var mapview = Titanium.Map.createView({
            mapType: Titanium.Map.STANDARD_TYPE,
            borderRadius : 1,
            borderWidth : 2,
            borderColor : 'white',
            animate:true,
            region : { latitude: loc.lat,
                longitude: loc.lng,
                latitudeDelta:0.005, 
                longitudeDelta:0.005},
            regionFit:true,
            userLocation:false,
            zIndex : 1,
            height : 60,
            width : 60,
            bottom : 2,
            top : 76,
            left : 9 
        });
        newHeader.add(mapview);
        btShowMap.addEventListener('click', function(e) {
            Image.displayMapZoom(mapview);
        });
        newHeader.mapview = mapview;

        var points_to_win = 0;
        if(! this.checkin) {
            points_to_win += this.getPoints('stepin');
        }
        
        // Add the points
        var pointsView = Ti.UI.createView({
            bottom : 0,
            height : 63,
            backgroundColor : '#d92276'
        });
        var lblPoints = Ti.UI.createLabel({
            top : 5,
            color : 'white',
            text : points_to_win + ' points',
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            font : {fontSize : 24, fontWeight : 'bold'}
        });
        var lblDetails = Ti.UI.createLabel({
            bottom : 5,
            color : 'white',
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            font : {fontSize : 13, fontWeight : 'normal'},
            text : 'à gagner en vous rendant dans ce magasin'
        });
        pointsView.add(lblPoints);
        pointsView.add(lblDetails);
        this.lblPoints = lblPoints;
        
        newHeader.add(pointsView);
        
        var tv = Ti.UI.createTableView({
            height : 'auto',
            scrollable : true,
            allowsSelection : this.checkin,
            footerView : footer,
            headerView : newHeader,
            style : Titanium.UI.iPhone.TableViewStyle.PLAIN,
            backgroundColor : '#f0f0f0'
        });
        
        var data = [];
        var section = Ti.UI.createTableViewSection();
        
        var sheader = Ti.UI.createView({
            height : 20,
            bakcgroundColor : '#f0f0f0'
        });
        var lbl = Ti.UI.createLabel({
            text : "Gagnez plus de points en scannant ces produits :",
            top : internBorder,
            left : internBorder,
            color : '#4d4d4d',
            font : {fontSize : '12', fontWeight : 'bold'},
            textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
            height : 15
        });
        sheader.add(lbl);
        section.headerView = sheader;
        data[0] = section;
        tv.setData(data);
        var checkin = this.checkin;
        
        function createRow(options) {
            var row = Ti.UI.createTableViewRow(options);
            row.height = 44;
            
            var img = Image.createImageView('read', options.photo, null, {noEvent : true, borderWidth : 0, left : 2, top : 2, width : 40, height : 40});
            row.add(img);
            
            var lbl = Ti.UI.createLabel({
                left : 44,
                top : 4,
                font : {fontSize : 12},
                color : '#4d4d4d',
                text : options.what,
                width : 190 - 40 
            });
            row.add(lbl);
            
            var pt = Image.createPointView(options.points, 40, 80);
            pt.right = 5;
            row.add(pt);
            row.ptView = pt;
            return row;
        }
        var self = this;
        tv.addEventListener('click', function(e) {
            if(e.rowData && e.rowData.object && e.rowData.hasDetail) {
                // We open a detailed window of the object to scan
                var obj = e.rowData.object; 
                obj.checkin = checkin;
                obj.shop = self;
                var FormWindow = require("/ui/common/FormWindow"),
                    swin = new FormWindow(null, 'read', obj, tabGroup);
                tabGroup.activeTab.open(swin, {animated:true});
            } 
        });

        // We add the scan articles
        var Scan = require("/model/Scan"),
            scan = new Scan();
        this.getList(scan, Tools.Hash2Qparams({ "shop.url" : this.getUrl() }), function(scans) {
            var j;
            for(j = 0; j < scans.length; j++) {
                var s = new Scan(scans[j]);
                var row = createRow({
                    what : s.title,
                    points : s.points,
                    hasDetail: checkin,
                    object : s,
                    photo : s.getPhotoUrl(0)
                });
                row.scan = s;
                points_to_win += s.points;
                lblPoints.setText(points_to_win + ' points');
                section.add(row);
            }
            tv.setData([section]);
        });
        
        this.tv = tv;
        
        // We need to update the view
        this.updateReadViewWithLocation(newHeader);
        
        return tv;
    };
    
    this.newObjectScanned = function(code, tabGroup, func) {
        // We search for the object
        var section = this.tv.getData(), scan = null;
        if(section && section.length > 0) {
            var rows = section[0].getRows();
            var i;
            for (i = 0 ; !scan && i < rows.length; i++) {
                if(rows[i].scan && rows[i].scan.code.toString() === code.toString()) {
                    var row = rows[i];
                    scan = row.scan;
                    row.backgroungColor = '#eadae3';
                    row.hasDetail = false;
                    row.hasCheck = true;
                }
            }
        }
        if(scan) {
            // We have found it
            var Reward = require("model/Reward"),
                rew = new Reward({ nb_points : scan.points, action_kind : 'Scan', extra : {code : scan.code}});
            rew.setShop(this);
            rew.setUser(AppUser.getCurrentUser());
            tabGroup.addNewReward(rew, true, func);
        } else {
            alert("Désolé mais l'article scanné ne correspond pas à un article de cette boutique !");
        }
    };
    
    this.createTableRow = function() {
        var internBorder = 2;
        var internHeight = 75;
        var labelHeight = Math.round((internHeight - 2 * internBorder) / 3);
         
        var row = Ti.UI.createTableViewRow({
            hasDetail : true,
            height : internHeight + 2 * internBorder,
            backgroundColor : '#f0f0f0'
        });
        
        var nbPhotos = this.getNbPhotos();
        if(nbPhotos === 0) { nbPhotos = 1;}
        
        var imgs = [];
        var i;
        for(i = 0; i < nbPhotos; i ++) {
            var img = Image.createImageView('read', this.getNthPhotoUrl(i), null, {borderWidth : 0, borderRadius : 0, noEvent : true});
            imgs.push(img);
        }
        
        var sc = Ti.UI.createScrollableView({
            views : imgs,
            left : 5,
            height : 60,
            width : 60,
            borderWith : 0,
            borderRadius : 2,
            pagingControlHeight : 7,
            pagingControlColor : 'gray',
            showPagingControl : (nbPhotos > 1)
        });
        row.add(sc);
        
        var vPoints = Image.createPointView(this.getPoints(), 50,70);
        vPoints.right = internBorder * 2;
        row.add(vPoints);
        row.ptView = vPoints;

        var labelName = Ti.UI.createLabel({
            font : {fontSize: 14, fontWeight : 'bold'},
            color:'#323232',
            text : this.getName(),
            left : 70,
            top : 23,
            width : 300 - (sc.width + 2 * internBorder + vPoints.width + 2 * internBorder), 
            height : labelHeight
        });
        row.add(labelName);
        
        var labelDistance = Ti.UI.createLabel({
            font : {fontSize: 12},
            color : '#646464', 
            text : null,
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            left : labelName.left,
            top : 40,
            height : labelHeight
        });
        row.add(labelDistance);
        row.labelDistance = labelDistance;
        this.updateRow(row);
                
        row.object = this;
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
