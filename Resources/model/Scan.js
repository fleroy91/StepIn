/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var CloudObject = require("model/CloudObject");
var Image = require("/etc/AppImage");
var AppUser = require("/model/AppUser");

function Scan(json) {'use strict';
    CloudObject.call(this);
    
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "Scan";    
    };
    this.getEntriesUrl = function() {
        return "/collections/506eec600f660214ae00013a/entries";    
    };
    this.getFormPhotoFields = function() {
        return ['photo0'];
    };
    this.getFormFields = function(read) {
        var data = []; 
        return data;  
    };
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
    this.doActionsAfterCrud = function(tabGroup) {
    };
    
    this.getPoints = function() {
        var ret = this.points;
        if(this.scanned) {
            ret = 0;
        }
        return ret;
    };
    this.getTitle = function() {
        return this.title;
    };
    
    this.createReadView = function(tabGroup) {
        var internBorder = 2;
        var labelHeight = 13;

        var main = Ti.UI.createView({
            top : 0,
            left : 0,
            width : Ti.UI.FILL,
            height : 60,
            zIndex : 1000
        });
        
        var opacView = Ti.UI.createView({
            opacity : 0.5,
            backgroundColor : 'black',
            zIndex : 1500,
            height : 36,
            top : 17
        });
        main.add(opacView);
        
        var img = Ti.UI.createImageView({
            borderRadius : 1,
            borderWidth : 2,
            borderColor : 'white',
            zIndex : 2000,
            height : 60,
            width : 60,
            top : 0,
            left : 9,
            shadow:{
                shadowRadius:2,
                shadowOpacity:0.5,
                shadowOffset:{x:3, y:3}
            }
        });
        main.add(img);
        Image.cacheImage(this.getPhotoUrl(0), function(image) {
            img.setBackgroundImage(image);
        });
        
        // Line 1
        var labelName = Ti.UI.createLabel({
            font : {fontSize: 13, fontWeight : 'bold'},
            left : 73,
            top : 17,
            color: 'white',
            zIndex : 2000,
            width : 175,
            text : this.title,
            height : labelHeight
        });
        main.add(labelName);
    
        // line 2
        var labelDetails = Ti.UI.createLabel({
            color : 'white',
            left : 73,
            top : labelName.top + 20,
            height : 13,
            zIndex : 2000,
            width : 175,
            font : { fontSize : 11, fontWeight : 'normal'},
            text : this.desc
        }); 
        main.add(labelDetails);
        
        // Add the points
        var vPoints = Image.createPointView(this.points, 50,70, this.scanned);
        vPoints.right = 5;
        vPoints.zIndex = 2000;
        main.add(vPoints);

        return main;
    };

    this.newObjectScanned = function(code, tabGroup, func) {
        if(code && this.code.toString() === code.toString()) {
            this.scanned = true;
            // We have found it
            var Reward = require("model/Reward"),
                rew = new Reward({ nb_points : this.points, code : this.code});
            rew.setActionKind(Reward.ACTION_KIND_SCAN);
            rew.setShop(this.shop);
            rew.setUser(AppUser.getCurrentUser());
            var self = this;
            tabGroup.addNewReward(rew, this.shop, function(newRew) {
                if(newRew) {
                    if(func) {
                        func(self);
                    }
                }
            });
        } else {
            alert("Désolé mais l'article scanné ne correspond pas à un article de cette boutique !");
        }
    };
    
    this.createTableRow = function(options) {
        var scanned = this.scanned;
        
        options.height = 44;
        options.className = 'scanRow';
        var row = Ti.UI.createTableViewRow(options);
        
        var img = Image.createImageView('read', this.getPhotoUrl(0), null, {noEvent : true, borderWidth : 0, left : 2, top : 2, width : 40, height : 40});
        row.add(img);
        
        var lbl = Ti.UI.createLabel({
            left : 44,
            top : 4,
            font : {fontSize : 12},
            color : '#4d4d4d',
            text : this.title,
            width : 190 - 40 
        });
        row.add(lbl);
        
        var btAction = Ti.UI.createImageView({
            image : (scanned ? '/images/checked.png' : '/images/bullet.png'),
            width : 25,
            height : 25,
            right : 5
        });
        row.add(btAction);
    
        var pt = Image.createPointView(this.points, 40, 80, scanned);
        pt.right = btAction.right + btAction.width + 2;
        row.add(pt);
        row.ptView = pt;
        return row;
    };

    this.init(json);

    return this;
}

Scan.prototype = CloudObject.prototype;
Scan.prototype.constructor = Scan;

module.exports = Scan;
