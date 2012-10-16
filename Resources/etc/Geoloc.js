/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true */

var LatLon = require("/etc/LatLon");

function Geoloc(){ 'use strict';
    return this;
}

Geoloc.translateErrorCode = function(code) {'use strict';
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

Geoloc.isLocationServicesEnabled = function(askQuestion) { 'use strict';
    var ok = false ;
    if (! Titanium.Geolocation.locationServicesEnabled)
    {
        if(askQuestion) {
            Titanium.UI.createAlertDialog({title:'TODO', message:'Your device has geo turned off - turn it on.'}).show();
        }
    }
    else
    {
        var authorization = Titanium.Geolocation.locationServicesAuthorization;
        // Ti.API.info('Authorization: '+authorization);
        if (authorization === Titanium.Geolocation.AUTHORIZATION_DENIED) {
            if(askQuestion) {
                Ti.UI.createAlertDialog({
                    title:'TODO',
                    message:'You have disallowed StepIn from running geolocation services.'
                }).show();
            }
        }
        else if (authorization === Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
            if(askQuestion) {
                Ti.UI.createAlertDialog({
                    title:'TODO',
                    message:'Your system has disallowed StepIn from running geolocation services.'
                }).show();
            }
        } else {
            ok = true;
        }
    }
    return ok;
};

Geoloc.computeDistance = function(lat1, lon1, lat2, lon2) {'use strict';
    var p1 = new LatLon(lat1, lon1);
    var p2 = new LatLon(lat2, lon2);
    return p1.distanceTo(p2);
};

Geoloc.km2Rad = function(km) { 'use strict';
    var R = 6371; // km
    var d = km * 1000 / R;
    return d;    
};

module.exports = Geoloc;