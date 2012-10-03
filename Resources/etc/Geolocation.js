/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true */

var Geo = {};

Geo.translateErrorCode = function(code) {'use strict';
    if (code === null) {
        return null;
    }
    switch (code) {
        case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
            return "Location unknown";
        case Ti.Geolocation.ERROR_DENIED:
            return "Access denied";
        case Ti.Geolocation.ERROR_NETWORK:
            return "Network error";
        case Ti.Geolocation.ERROR_HEADING_FAILURE:
            return "Failure to detect heading";
        case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
            return "Region monitoring access denied";
        case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
            return "Region monitoring access failure";
        case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
            return "Region monitoring setup delayed";
    }
};

Geo.isLocationServicesEnabled = function(askQuestion) { 'use strict';
    var ok = false ;
    if (Titanium.Geolocation.locationServicesEnabled === false)
    {
        if(askQuestion) {
            Titanium.UI.createAlertDialog({title:'TODO', message:'Your device has geo turned off - turn it on.'}).show();
        }
    }
    else
    {
        var authorization = Titanium.Geolocation.locationServicesAuthorization;
        Ti.API.info('Authorization: '+authorization);
        if (authorization === Titanium.Geolocation.AUTHORIZATION_DENIED) {
            if(askQuestion) {
                Ti.UI.createAlertDialog({
                    title:'TODO',
                    message:'You have disallowed SoldEasy from running geolocation services.'
                }).show();
            }
        }
        else if (authorization === Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
            if(askQuestion) {
                Ti.UI.createAlertDialog({
                    title:'TODO',
                    message:'Your system has disallowed SoldEasy from running geolocation services.'
                }).show();
            }
        } else {
            ok = true;
        }
    }
    return ok;
};

Geo.computeDistance = function(lon1, lat1, lon2, lat2) {'use strict';
    var R = 6371; // km
    var d = Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
                  Math.cos(lat1)*Math.cos(lat2) *
                  Math.cos(lon2-lon1)) * R;

    return d;
};

Geo.km2Rad = function(km) { 'use strict';
    var R = 6371; // km
    var d = km / R;
    return d;    
};
