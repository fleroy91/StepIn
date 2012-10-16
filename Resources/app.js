/*global $$,Ti,Titanium,my_global_1,mb,etc*/
/*
* A tabbed application, consisting of multiple stacks of windows associated with tabs in a tab group.
* A starting point for tab-based application with multiple top-level windows.
* Requires Titanium Mobile SDK 1.8.0+.
*
* In app.js, we generally take care of a few things:
* - Bootstrap the application with any data we need
* - Check for dependencies like device type, platform version or network connection
* - Require and open our top-level UI component
*
*/
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

//bootstrap and check dependencies
if (Ti.version < 1.8) {
    alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

//determine platform and form factor and render approproate components
var osname = Ti.Platform.osname, 
    version = Ti.Platform.version, 
    height = Ti.Platform.displayCaps.platformHeight, 
    width = Ti.Platform.displayCaps.platformWidth;

//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
//yourself what you consider a tablet form factor for android
var isTablet = ((osname === 'ipad') || (osname === 'android' && (width > 899 || height > 899)));

// Standard Style sheet definition
Ti.UI.setBackgroundColor('white');
// Ti.UI.setBackgroundImage('/iphone/Default.png');
// Titanium.UI.iPhone.hideStatusBar();
Ti.Geolocation.purpose = Ti.Locale.getString('geolocation_purpose_text', "Géolocalisation au sein des boutiques");
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

// Main settings
Ti.App.Properties.setInt('MaxBookingTime', 15);
var Spinner = require("etc/Spinner");
var Geoloc = require("etc/Geoloc");

var AppUser = require('model/AppUser');
var Tools = require('/etc/Tools');

// Init global variables
Ti.App.currentUser = null;
Ti.App.allRewards = null;
Ti.App.allShops = null;

var debug;
if (Tools.isSimulator()) {
    // do something useful here
    // alert("We're in simulator !");
    debug = 0;
} else {
    // alert("We're NOT in simulator !'");
    debug = 0;
}

var ApplicationTabGroup ;
if(debug) {
    ApplicationTabGroup = require('ui/common/NewApplicationTabGroup');
} else {
    ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
}

// Management of the Sonic Service !
Ti.App.Properties.setBool('isSonicRunning', false);
/*
var service = Ti.App.iOS.registerBackgroundService({
    url : 'bg-service.js'
});
*/

var SplashWindow = require("ui/common/SplashWindow");
var main = new SplashWindow();

Ti.App.adminMode = false;
function isArray(a) {'use strict';
    return Object.prototype.toString.apply(a) === '[object Array]';
}

// We define our own log message
Ti.API.myLog = function(args) {'use strict';
    var now = new Date();
    if (!isArray(args)) {
        args = [args];
    }
    // We open the file in append
    var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "log.txt");
    var u = AppUser.getCurrentUser();
    file.append(now.toLocaleString() + "- user : " + ( u ? u.getEmail() : "") + '\n');
    var i;
    for ( i = 0; i < args.length; i++) {
        file.append("->" + args[i] + '\n');
    }
};

function runApp() {'use strict';
    Spinner.hide(main);
    var win = new ApplicationTabGroup();
    win.open({
        animated : true
    });
}

function checkUser(e) {'use strict';
    Geoloc.isLocationServicesEnabled(true);
    // We must be logged
    var user = AppUser.getCurrentUser();
    if (!user) {
        // We need to create a dummy user BUT geolocalized
        // We will login later in the process 
        user = new AppUser();
        user.geolocalize(function(newUser) {
            user.setCurrentUser();
            runApp();
        });        
    } else {
        user.reload(function(user1) {
            user1.geolocalize(function(user2) {
                user2.setCurrentUser();
                runApp();
            });
        });
    }
}

main.addEventListener('open', function(e){ 'use strict';
    Spinner.show(main);
    checkUser();
});

main.open();
