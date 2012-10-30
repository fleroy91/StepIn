// 
//  SuperAdminWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/AppImage");
var Tools = require("/etc/Tools");
var ApplicationTabGroup = require("/ui/common/ApplicationTabGroup");

function SuperAdminWindow(args) {'use strict';
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
    var tabGroup = args.tabGroup;
    
	var self = Ti.UI.createWindow({ 
	    title : 'Super Admin', 
	    backgroundColor : 'white',
        barImage : '/images/topbar-stepin.png',
        barColor : 'black'
    });
    
    var row1 = Ti.UI.createTableViewRow({
        height : 'auto' 
    });
    
    // Data from filestystem
    var linfo = '';
    linfo += 'Resources Directory:  ' + Titanium.Filesystem.resourcesDirectory+ '\n';
    linfo += 'Temp Directory:  ' + Titanium.Filesystem.tempDirectory+ '\n';
    linfo += 'Application Directory:  ' + Titanium.Filesystem.applicationDirectory+ '\n';
    linfo += 'Application Data Directory:  ' + Titanium.Filesystem.applicationDataDirectory+ '\n';
    linfo += 'Application Support Directory:  ' + Titanium.Filesystem.applicationSupportDirectory+ '\n';
    linfo += 'External Storage Available:  ' + Titanium.Filesystem.isExternalStoragePresent()+ '\n';
    linfo += 'Separator:  ' + Titanium.Filesystem.separator+ '\n';
    linfo += 'Line Ending:  ' + Titanium.Filesystem.lineEnding+ '\n';
    
    var labelinfo = Titanium.UI.createLabel({
        text:linfo,
        left : 0,
        height : 'auto',
        font:{fontSize:10}
    });
    row1.add(labelinfo);
    
    // And then actions
    
    function cleanFileCache(e) {
        var dir = Titanium.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'cachedImages');
        var dir_files = dir.getDirectoryListing(), i;
        for (i=1; i<dir_files.length; i++){
            Ti.API.info(dir_files[i]); 
            var file = Ti.Filesystem.getFile(dir_files[i]);
            file.deleteFile();
        }
    }
    
    function emailLogFile(e) {
        var emailDialog = Ti.UI.createEmailDialog();
        emailDialog.subject = "Step'In Logfile";
        emailDialog.toRecipients = ['flperso@gmail.com'];
        emailDialog.messageBody = '<b>Log file from : XXX !</b> ' + (new Date()).toLocaleString();
        var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "log.txt");
        emailDialog.addAttachment(f);
        emailDialog.open();
    }
    
    function populateShopDB(e) {
        // We get the shops around us from GMaps and insert them in the DB
        var GmapsReq = "https://maps.googleapis.com/maps/api/place/search/json";
        var GmapsOptions = { radius :500,
            types : 'store|shoe_store|shopping_mall|spa|pharmacy|pet_store|liquor_store|library|grocery_or_supermarket|hardware_store|jewelry_store|home_goods_store|furniture_store|florist|electronics_store|department_store|clothing_store|convenience_store|book_store|bicycle_store|bar|bakery|restaurant',
            sensor : false, // do we ask for using the current GPS location : NO !
            key : 'AIzaSyAkB43SsAc4TGopk7WuvLEspVXrOqwhJbI',
            location : '-33.8670522,151.1957362' // location to be replaced
        };
        user.geolocalize(function() {
            // The use ris now geolocalized
            // GmapsOptions.location = user.location.lat + ',' + user.location.lng;
            GmapsOptions.location = "48.874806,2.331239";
            var DataManager = require("/services/DataManager"),
                dm = new DataManager();
            dm.silent = true;    
            dm.doCall('GET', GmapsReq, Tools.Hash2Qparams(GmapsOptions), null, function(json) {
                // We need to create a shop for each entry
                /*
                 * Example of result :
                 * 
                 * {
   "html_attributions" : [],
   "next_page_token" : "ClREAAAAIkv3dqOf-XrbszCJuo8Y4Tl5paZCVvyB70lZ-FnkN41uGw5UBB-4t28voZtRmy-zCE4J3kcaMfBdfM007J_ckrl5yoO1JWioPkQ26wTzHUsSEILiRTNyEkPi1lrkvLO_X58aFAyMEQCXP1XBsb8-yY-Dg033PCkF",
   "results" : [
      {
         "geometry" : {
            "location" : {
               "lat" : 48.87019140,
               "lng" : 2.33858450
            },
            "viewport" : {
               "northeast" : {
                  "lat" : 48.8720340,
                  "lng" : 2.3432020
               },
               "southwest" : {
                  "lat" : 48.86578790,
                  "lng" : 2.3358630
               }
            }
         },
         "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
         "id" : "f2b8bbdd895a19b20acbc91d6706906046633214",
         "name" : "Vivienne",
         "photos" : [],
         "reference" : "CnRvAAAAcTEUY_-nU_szJCeMMJ8wBITjhofGFH6SgzU5UCWNrV49EEaXSi1SN8pyJOHQV23aG7C4gORfP7izZYGImxBjCX0UC4lWSJNjuq8Wl_jZv1SHtKlcwLyT_X0q0rcwji64d0YOozf1KpOUTB6PcCbUPBIQiSuy3x2pXLhmPDIxhPflRRoUrLVvz597a5Xgza5lP2IdW_6JAkw",
         "types" : [ "neighborhood", "political" ],
         "vicinity" : "Paris"
      },
      {
         "geometry" : {
            "location" : {
               "lat" : 48.8705710,
               "lng" : 2.347770
            }
         },
         "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/movies-71.png",
         "id" : "9214122f5e430762ac5950ec3a38fd1cf552ee97",
         "name" : "Le Grand Rex",
         "photos" : [],
         "rating" : 4.20,
         "reference" : "CnRqAAAAccKYtpEhjXU2q0USVh0QFkqmcO1nAkb1Cdsy282kXMrDxJ5XQZkfemp2cpgOKLQSn8CMOYuYYj6zhatLzDIIXGUcxGfeId5rQmBYetR_pSNPxMJP8XvUVR-XEXHJIaJ5MWmPnntSVSs2Ju-bxlSS6hIQXcolDcGvhrFq1vVCbpQo0RoUxK9MZPUxfZg2BrP_-kCG3MyxEWk",
         "types" : [ "movie_theater", "establishment" ],
         "vicinity" : "1 Boulevard Poissonnière, Paris"
      },
                 * 
                 */           
                 var elem, Shop = require("/model/Shop"), newShop, i = 0;
                 
                 var results = json.results;
                 for(i = 0 ; i < results.length ; i++) {
                     elem = results[i];
                     if(elem.hasOwnProperty('geometry')) {
                         newShop = new Shop();

                         newShop.location = elem.geometry.location;
                         var iconpath = Image.cacheImage(elem.icon);
                         if(iconpath) {
                             var file = Ti.Filesystem.getFile(iconpath);
                             if(file && file.exists()) {
                                var blob = file.read();
                                newShop.setPhoto(0, blob);   
                             }
                         }
                         newShop.name = Tools.StringToUTF8(elem.name);
                         if(elem.hasOwnProperty('vicinity')) {
                             var ads = elem.vicinity.split(',');
                             newShop.address = Tools.StringToUTF8(ads[0]);
                             var city = ads[ads.length-1]; 
                             newShop.city = Tools.StringToUTF8(city);
                             // We need to get back the zipcode
                             if(city.toLowerCase() === 'paris') {
                                 newShop.zipcode = '75000';
                             } 
                             // else TODO : get the zipcode from http://api.geonames.org/postalCodeSearchJSON?placename=paris&country=fr&maxRows=10&username=fleroy
                         }
                         if(elem.types){
                             var j;
                             newShop.tags = [];
                             for(j = 0; j < elem.types.length; j ++) {
                                 newShop.tags.push(Tools.StringToUTF8(elem.types[j]));
                             }
                         }
                         newShop.rating = elem.rating;
                         newShop.ident = elem.id; // uniqueness !! GREAT
                         newShop.points = { stepin : Math.round(2 + Math.random(5)) * 50, stepout : Math.round(2 + Math.random(5)) * 50};
                         newShop.create();
                     }
                 }     
            }, true);
        });
    }
    
    function simulateStepIn(code) {
        tabGroup.didHearCode(code);
        self.close();        
    }
    
    function resetFirstLaunch() {
        Ti.App.Properties.setBool('isFirstLaunch', true);
        self.close();
    }
    
    function clearAllRewards() {
        user = AppUser.getCurrentUser();
        if(user.isDummy()) {
            alert("Cela ne peut fonctionner que sur le user connecté !");
        } else {
            var dlg = Ti.UI.createAlertDialog({
                title:'Attention',
                message:"Cette action va supprimer tous les rewards de l'utilisateur loggé",
                buttonNames : ['Oui on supprime', 'Annuler']
            });
            dlg.addEventListener('click', function(e) {
                if(e.index === 0) {
                    user.deleteAllRewards(function() {
                        user.setTotalPoints(0);
                        user.save();
                        user.setCurrentUser();
                        tabGroup.updateTitle();
                        user.checkAll(tabGroup.updateAllRows);
                        self.close();
                    });
                }
            });
            dlg.show();
        }
    }
    
    function clearAllInvitations() {
        user = AppUser.getCurrentUser();
        if(user.isDummy()) {
            alert("Cela ne peut fonctionner que sur le user connecté !");
        } else {
            var dlg = Ti.UI.createAlertDialog({
                title:'Attention',
                message:"Cette action va supprimer toutes les invitations de l'utilisateur loggé",
                buttonNames : ['Oui on supprime', 'Annuler']
            });
            dlg.addEventListener('click', function(e) {
                if(e.index === 0) {
                    user.deleteAllInvitations(function() {
                        self.close();
                    });
                }
            });
            dlg.show();
        }
    }
    
    var data = [
        { title : "Sonic is running", hasCheck :Ti.App.Properties.getBool('isSonicRunning', false)},
        { title : "Start Sonic", hasChild :false, action : function(e) { ApplicationTabGroup.startSonic(); } },
        { title : "Stop Sonic", hasChild :false, action : function(e) { ApplicationTabGroup.stopSonic(); } },
        { title : "Simulate Step-In Shop 6227", hasChild :false, action : function(e) { simulateStepIn(6227); } },
        { title : "Simulate Step-In Shop 6228", hasChild :false, action : function(e) { simulateStepIn(6228); } },
        { title : "Simulate Step-In Shop 6229", hasChild :false, action : function(e) { simulateStepIn(6229); } },
        { title : "Simulate Step-In Shop 6230", hasChild :false, action : function(e) { simulateStepIn(6230); } },
        { title : "Clear all user rewards", hasChild :false, action : clearAllRewards },
        { title : "Clear all user invitations", hasChild :false, action : clearAllInvitations },
        { title : "Reset first launch", hasChild :false, action : resetFirstLaunch },
        { title : "List users", hasChild :true, req : "/ui/admin/ListUsersWindow"},
        { title : "List shops", hasChild :true, req : "/ui/admin/ListShopsWindow"},
        { title : "Clean file cache", hasChild :false, action : cleanFileCache},
        { title : "Email log file", hasChild :false, action : emailLogFile},
        { title : "Show log file", hasChild :true, req : "/ui/admin/ShowLogWindow"},
        { title : "Populate shop DB", hasChild :false, action : populateShopDB}
    ];
    
    var rows = [], i;
    for(i = 0; i < data.length; i ++) {
        var row = Ti.UI.createTableViewRow(data[i]);
        rows.push(row);
    }
    rows.push(row1);
    
    var tv = Ti.UI.createTableView({
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        scrollable : true,
        height : 'auto',
        data : rows
    });
    
    tv.addEventListener('click', function(e) {
        if(e.rowData) {
            if(e.rowData.req) {
                alert("Not implemented yet !");
            } else if(e.rowData.action) {
                e.rowData.action();
            }
        } 
    });
    
    self.add(tv);
	return self;
}

module.exports = SuperAdminWindow ;