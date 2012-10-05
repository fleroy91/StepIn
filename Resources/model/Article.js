// 
//  Article.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var CloudObject = require("model/CloudObject");

var NB_MINUTES_BOOKING = 2; // TODO : change to 15

function Article(json) {'use strict';
    CloudObject.call(this);
    
    var AppUser = require('model/AppUser'),
        currentUser = AppUser.getCurrentUser();
    this.checkBooking = function(user) {
        this.booked_by_user = false;
        this.booked = false;
        
        if (this.bookings) {
            var i;
            for (i = 0; i < this.bookings.length; i++) {
                var booking = this.bookings[i];
                if(booking.when) {
                    var bdate = new Date(Date.parse(booking.when)),
                        now = new Date(),
                        buntil = new Date(bdate);
                    buntil.setMinutes(bdate.getMinutes() + NB_MINUTES_BOOKING);
                    if(buntil > now) {
                        this.booked = true;
                        this.booked_when = bdate;
                        this.booked_until = buntil;
                    }
                }
                if (this.booked && user && booking.user === user.getUrl()) {
                    // The article is booked by the user
                    this.booked_by_user = true;
                }
            }
        }
    };
    this.stillBooked = function() {
        if(this.booked) {
            var now = new Date();
            this.booked = ((new Date()) < this.booked_until);
            // Ti.API.info("StillBooked Now : " + now + " - until : " + this.booked_until + " -> " + this.booked);
        }
        return this.booked;
    };
    function prefixZeros(number) 
    {
        var ret = number;
        if(number < 10) {
            ret = "0" + ret;
        }
        return ret;
    }
    this.getRemainingTime = function(width) {
        var ret = "00:00";
        if(this.booked) {
            var now = new Date();
            var diff = Math.round((this.booked_until - now) / 1000);
            var m = Math.floor(diff / 60);
            var s = Math.floor(diff - m * 60);
            ret = prefixZeros(m) + ':' + prefixZeros(s);
        }
        return ret;
    };        
    this.getBookProgressWidth = function(width) {
        var ret = 0;
        if(this.booked) {
            var now = new Date();
            ret = Math.max(0, ((this.booked_until - now) / (this.booked_until - this.booked_when)) * width);
            if(ret <= 0) {
                this.booked = false;
            }
            // Ti.API.info("Now : " + now + '-' + this.booked_until + '->' + ret + '/' + width);
        }
        return Math.round(ret);
    };
    this.getNbBookings = function() {
        var ret = 0;
        if(this.bookings) {
            ret = this.bookings.length;
        }
        return ret;
    };
    this.book = function() {
        var AppUser = require('model/AppUser');
        var currentUser = AppUser.getCurrentUser();
        var now = new Date(),
            buntil = new Date(now);
        buntil.setMinutes(now.getMinutes() + NB_MINUTES_BOOKING);
        var booking = {
            user : currentUser.getUrl(),
            when : now.toISOString()
        };
        if (!this.bookings) {
            this.bookings = [];
        }
        Ti.API.info("Book Now : " + now + " - until : " + buntil);
        this.booked = true;
        this.booked_by_user = true;
        this.booked_by_user_when = now;
        this.booked_when = now;
        this.booked_until = buntil;
        this.bookings.push(booking);
    };
    
    this.unbook = function() {
        var AppUser = require('model/AppUser');
        var currentUser = AppUser.getCurrentUser();
        var bookings = [];
        var i;
        for ( i = 0; i < this.bookings.length; i++) {
            if (this.bookings[i].user !== currentUser.getUrl()) {
                bookings.push(this.bookings[i]);
            }
        }
        this.booked = false;
        this.booked_by_user = false;
        this.booked_by_user_when = null;
        this.booked_until = null;
        this.booked_when = null;
        this.bookings = bookings;
    };
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "Article";    
    };
    this.getEntriesUrl = function() {
        return "/collections/4ff6ef6e1b338a2de3000be7/entries";    
    };
    this.getFormPhotoFields = function() {
        return ['photo0', 'photo1', 'photo2'];
    };
    this.getFormFields = function(read) {
        var data = []; 
        data.push({ id : 'category', title : "Type", keyboardToolbar : false, pickerOptions : ["Chaussure", "T-Shirt", "Robe", "Manteau", "Pantalon", "Autre"]});
        data.push({ id : 'sex', title : "Pour qui", keyboardToolbar:false, pickerOptions : ["Femme", "Homme", "Enfant", "Unisexe"] });
        data.push({ id : 'size', title : "Taille", hint : "Taille"});
        data.push({ id : 'brand', title : "Marque", hint : "Marque (Nike, Gucci, ...)"});
        data.push({ id : 'description', title : "Détails", hint : "Bleu avec un logo"});
        if(!read) { 
            data.push({ id : 'quantity', title : 'Quantité', keyboardType : Ti.UI.KEYBOARD_DECIMAL_PAD}); 
            data.push({ id : 'initial_price', title : 'Prix initial', keyboardType : Ti.UI.KEYBOARD_DECIMAL_PAD});
        } 
        data.push({ id : 'price', title : 'Prix remisé', keyboardType : Ti.UI.KEYBOARD_DECIMAL_PAD});
        if(read) {
            data.push({ id : 'discount', title : 'Remise', value : '- ' + this.getDiscount() + '%' , color : 'red'});
        }
        return data;  
    };
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
    this.retrieveShop = function(func, extra) {
        this.retrieveObject('shop','Shop', func, extra);
    };
    this.setShop = function(shop) {
        this.setFieldObject('shop', shop);    
    };
    this.getLongTitle = function() {
        return this.title + ' / ' + this.price + '€';
    };
    
    this.getTitle = function() {
        return this.category + " " + this.sex + " " + this.brand;
    };
    
    this.getDetails = function(index) {
        return "Taille : " + this.size + " - " + this.description;
    };
    
    this.getPrice = function(index) {
        return this.price;
    };
    this.getInitialPrice = function(index) {
        return this.initial_price;
    };
    
    this.getDiscount = function(index) {
        return Math.ceil((this.initial_price - this.price) * 100 / this.initial_price);
    };
    
    this.getQuantity = function(index) {
        return this.quantity;
    };
    this.isAvailable = function(index) {
        return (this.quantity > 0);
    };
    this.isBooked = function() {
        return this.booked;
    };
    this.isCheckin = function() {
        // we are checked in if this field is true or if there is an history of CI since last X hours
        // TODO : implement the last X hours CI
        return this.checkin;
    };
    this.isBookedByAnother = function() {
        return this.booked && ! this.booked_by_user; 
    };
    this.updateReadViewWithShop = function(shop, me) {
        var rowShop = me.rowShop,
            mapview = rowShop.mapview;
        
        if(shop) {
            me.shop = shop;
            var shoploc = shop.getLocation();
            var region = {latitude: shoploc.lat,longitude:shoploc.lng,latitudeDelta:0.01, longitudeDelta:0.01};
            
            mapview.setLocation(region);
            
            var shopImg = Image.createImageView('read', shop.getPhotoUrl(0), null, { height : 30, width : 30});
            
            var annotation = Titanium.Map.createAnnotation({
                latitude:shoploc.lat,
                longitude:shoploc.lng,
                leftView : shopImg,
                title : shop.getName(),
                subtitle : shop.getAddress() + ' - ' + shop.getZipcode() + ' ' + shop.getCity(),
                animate:true
            });
            mapview.addAnnotation(annotation);
            mapview.selectAnnotation(annotation);
        }
    };
    this.createReadView = function(header, footer) {
        var internBorder = 2;
        var internHeight = 80;
        var internShopHeight = 120;
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
        
        var labelName = Ti.UI.createLabel({
            font : {fontSize: 14, fontWeight : 'bold'},
            color:'#576996',
            text : this.getTitle(),
            left : internBorder,
            top : internBorder,
            height : labelHeight
        });
        rowSelf.add(labelName);
    
        var labelDetails = Ti.UI.createLabel({
            color : '#222',
            font : { fontSize : 12, fontWeight : 'normal'},
            text : this.getDetails(),
            height : labelHeight,
            left : labelName.left,
            top : labelName.top + labelName.height + internBorder
        }); 
        rowSelf.add(labelDetails);

        var labelPrice = Ti.UI.createLabel({
            font : {fontSize: 15, fontWeight : 'bold'},
            color : '#222', 
            text : this.getPrice() + '€',
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            left : internBorder,
            width : 60,
            top : labelDetails.top + labelDetails.height + internBorder,
            height : labelHeight
        });
        rowSelf.add(labelPrice);
        
        var vDiscount = Ti.UI.createLabel({
           color : 'red',
           text : "- " + this.getDiscount() + "%",
           font : { fontSize : 15, fontWeight : 'bold'},
           width : 60,
           left : labelPrice.left + labelPrice.width + internBorder,
           top : labelPrice.top,
           height : labelHeight
        });
        rowSelf.add(vDiscount);

        // last line
        var labelBooked = Ti.UI.createLabel({
            font : {fontSize: 12, fontStyle : 'italic'},
            color : (this.booked ? 'red' : 'gray'), 
            text : (this.booked ? "Réservé !!!" : "Réservé " + this.getNbBookings() + " fois !"),
            width : 150,
            borderWidth : (this.booked ? 1 : 0),
            borderColor : 'red',
            zIndex : 1,
            left : internBorder,
            bottom : internBorder,
            height : labelHeight
        });
        rowSelf.add(labelBooked);
        rowSelf.labelBooked = labelBooked;
        
        if(this.booked){
            var progress = Ti.UI.createView({
                bottom : labelBooked.bottom,
                left : labelBooked.left,
                height : labelBooked.height,
                init_width : labelBooked.width,
                width : labelBooked.width,
                backgroundColor : 'red',
                opacity : 0.6,
                zIndex :0
            });
            rowSelf.progress = progress;
            rowSelf.add(progress);
        }
        
        var labelDistance = Ti.UI.createLabel({
            font : {fontSize: 12, fontStyle : 'italic'},
            color : 'lighgray', 
            text : "450 mètres",
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            right : internBorder * 2,
            bottom : internBorder,
            height : labelHeight
        });
        rowSelf.add(labelDistance);
        
        // The description of the shop
        var rowShop = Ti.UI.createTableViewRow({
            height : internShopHeight,
            object : this
        });
        
        var mapview = Titanium.Map.createView({
            mapType: Titanium.Map.STANDARD_TYPE,
            animate:true,
            region : {latitude: 48.833 ,longitude:2.333,latitudeDelta:0.005, longitudeDelta:0.005},
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
        this.retrieveShop(this.updateReadViewWithShop, this);
        
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
        
        var vDiscount = Ti.UI.createLabel({
           color : 'red',
           textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
           text : "- " + this.getDiscount() + "%",
           font : { fontSize : 14, fontWeight : 'bold'},
           right : internBorder * 2,
           width : 60,
           height : labelHeight + internBorder,
           top : internBorder
        });
        row.add(vDiscount);

        var labelPrice = Ti.UI.createLabel({
            font : {fontSize: 14, fontWeight : 'bold'},
            height : labelHeight,
            color : '#222', 
            text : this.getPrice() + '€',
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            width : vDiscount.width,
            right : vDiscount.right,
            top : vDiscount.top + vDiscount.height + internBorder
        });
        row.add(labelPrice);
    
        var labelName = Ti.UI.createLabel({
            font : {fontSize: 14, fontWeight : 'bold'},
            color:'#576996',
            text : this.getTitle(),
            left : sc.width +  2 * internBorder,
            top : internBorder,
            width : 300- (sc.width + 2 * internBorder + vDiscount.width + 2 * internBorder), 
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
        
        var labelBooked = Ti.UI.createLabel({
            font : {fontSize: 12, fontStyle : 'italic'},
            height : labelHeight,
            color : (this.booked ? 'red' : 'gray'), 
            text : (this.booked ? "Réservé !!!" : "Réservé " + this.getNbBookings() + " fois !"),
            width : labelName.width - 30,
            borderWidth : (this.booked ? 1 : 0),
            borderColor : 'red',
            zIndex : 1,
            left : labelName.left,
            top : labelDetails.top + labelDetails.height + internBorder
        });
        row.add(labelBooked);
        row.labelBooked = labelBooked;
        // Ti.API.info("width of labelBooked : " + labelBooked.width + '-' + (labelName.width - 30));
        
        if(this.booked){
            var progress = Ti.UI.createView({
                top : labelBooked.top,
                left : labelBooked.left,
                height : labelBooked.height,
                init_width : labelBooked.width,
                width : labelBooked.width,
                backgroundColor : 'red',
                opacity : 0.6,
                zIndex :0
            });
            row.progress = progress;
            row.add(progress);
        }
        
        this.labelBooked = labelBooked;
        row.object = this;
        return row;
    };
    this.updateRow = function(row) {
        if(row.progress) {
            var w = this.getBookProgressWidth(row.progress.init_width);
            row.progress.setWidth(w);
            row.labelBooked.setText(this.getRemainingTime());
        }
        return row;
    };

    this.init(json);
    this.checkBooking(currentUser);

    return this;
}

Article.prototype = CloudObject.prototype;
Article.prototype.constructor = Article;

module.exports = Article;
