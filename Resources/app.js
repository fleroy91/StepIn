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
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
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
Ti.Geolocation.purpose = Ti.Locale.getString('geolocation_purpose_text', "Géolocalisation pour checkin dans les boutiques");
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

// Main settings
Ti.App.Properties.setInt('MaxBookingTime', 15);
Ti.include("etc/spinner.js");
Ti.include("etc/Geolocation.js");

var AppUser = require('model/AppUser');
var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');

// Management of the Sonic Service !
Ti.App.Properties.setBool('isSonicRunning', false);
var service = Ti.App.iOS.registerBackgroundService({
    url : 'bg-service.js'
});
Ti.App.addEventListener("resumed", function(e) {'use strict';
    ApplicationTabGroup.startSonic();
});

var SplashWindow = require("ui/common/SplashWindow");
var main = new SplashWindow();
var nav = main.navGroup;
Spinner.add(main);

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
    Ti.API.info("RunApp");
    var win = new ApplicationTabGroup(nav);
    //nav.open(win);
    Ti.API.myLog("Open main tabGroup with adminMode=" + Ti.App.adminMode);
    win.open({
        animated : true
    });
}

function checkUser(e) {'use strict';
    Geo.isLocationServicesEnabled(true);
    // We must be logged
    var user = Ti.App.Properties.getString('AppUser');
    if (!user) {
        Titanium.Facebook.logout();
        var Login = require('ui/common/Login');
        var win = new Login();
        win.addEventListener('close', function(e) {
            main.update();
        });
        nav.open(win);
    }
}

function checkShop() {'use strict';
    // We first look for the user shop
    var user = AppUser.getCurrentUser();
    if (user) {
        user.retrieveShop(function(shop) {
            if (shop) {
                Ti.API.info("Shop OK");
                shop.setCurrentShop();
                Ti.App.adminMode = true;
                runApp();
            } else {
                var CreateShop = require('ui/common/CreateShopWindow');
                var win = new CreateShop();
                win.addEventListener('close', function(e) {
                    user.retrieveShop(function(shop) {
                        if (shop) {
                            shop.setCurrentShop();
                            Ti.App.adminMode = true;
                            runApp();
                        }
                    });
                });
                nav.open(win);
            }
        });
    } else {
        checkUser();
    }
}

main.adminButton.addEventListener('click', function(e) {'use strict';
    var dlg = Ti.UI.createAlertDialog({
        message : 'Voulez-vous entrer en mode administration ?',
        buttonNames : ['Oui', 'Non'],
        cancel : 1,
        title : 'Mode admin'
    });
    dlg.addEventListener('click', function(e) {
        if (e.index === 0) {
            checkShop();
        }
    });
    dlg.show();
});

main.button.addEventListener('click', function(e) {'use strict';
    Ti.App.adminMode = false;
    runApp();
});

main.addEventListener('open', checkUser);
main.open();

