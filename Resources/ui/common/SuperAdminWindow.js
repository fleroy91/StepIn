// 
//  SuperAdminWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
Ti.include("/etc/image.js");

function SuperAdminWindow(args) {'use strict';
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
    
	var self = Ti.UI.createWindow({ 
	    title : 'Super Admin', 
	    backgroundColor : 'white'
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
            // types : 'food', // TODO
            // name: 'harbour',
            sensor : false, // ???
            key : 'AIzaSyAkB43SsAc4TGopk7WuvLEspVXrOqwhJbI',
            location : '-33.8670522,151.1957362' // location to be replaced
        };
        user.geolocalize(function() {
            // The use ris now geolocalized
            GmapsOptions.location = user.location.lng + ',' + user.location.lat;
            var DataManager = require("/services/DataManager"),
                dm = new DataManager();
                
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
                 for(i = 0 ; i < 2 && i < results.length ; i++) {
                     elem = results[i];
                     if(elem.hasOwnProperty('geometry')) {
                         newShop = new Shop();

                         newShop.location = elem.geometry.location;
                         var iconpath = Image.cacheImage(newShop.icon);
                         var file = Ti.Filesystem.getFile(iconpath);
                         if(file && file.exists()) {
                            var blob = file.read();
                            newShop.setPhoto(0, blob);   
                         }
                         newShop.setName(elem.name);
                         if(elem.hasOwnProperty('vicinity')) {
                             var ads = elem.vicinity.split(',');
                             newShop.setAddress(ads[0]);
                             var city = ads[ads.length-1]; 
                             newShop.setCity(city);
                             // We need to get back the zipcode
                             if(city.toLower() === 'paris') {
                                 newShop.setZipcode('75000');
                             } 
                             // else TODO : get the zipcode from http://api.geonames.org/postalCodeSearchJSON?placename=paris&country=fr&maxRows=10&username=fleroy
                         }
                         if(elem.hasOwnProperty('types')) {
                            newShop.tags = elem.types.toString();
                         }
                         newShop.rating = elem.rating;
                         newShop.create();
                     }
                 }     
            });
        });
    }
    
    var data = [
        { title : "List users", hasChild :true, req : "/ui/admin/ListUsersWindow"},
        { title : "List shops", hasChild :true, req : "/ui/admin/ListShopsWindow"},
        { title : "Clean file cache", hasChild :true, action : cleanFileCache},
        { title : "Email log file", hasChild :true, action : emailLogFile},
        { title : "Show log file", hasChild :true, req : "/ui/admin/ShowLogWindow"},
        { title : "Populate shop DB", hasChild :true, action : populateShopDB}
    ];
    
    var rows = [row1], i;
    for(i = 0; i < data.length; i ++) {
        var row = Ti.UI.createTableViewRow(data[i]);
        rows.push(row);
    }
    
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