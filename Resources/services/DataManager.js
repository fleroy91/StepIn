// 
//  DataManager.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var Spinner = require("/etc/AppSpinner");

function DataManager() {'use strict';
	// Initialisation of the calls to the API
	this.account_id = '4ff6ebed1b338a6ace001893';
	this.auth_token = 'seK41wiSZxB6Rr1iGLyg';
	this.base_url = "http://api.storageroomapp.com/accounts/" + this.account_id;
	this.silent = false;
	
	this.completeURL = function(sub_url) {
	    return this.base_url + sub_url;
	};
	
    this.doCall = function(method, url, qparams, body, func, not_storage_room_call) {
        var silent = this.silent;
        
        if(url[0] === '/') {
            url = this.completeURL(url);
        }
        if(not_storage_room_call) {
            url += "?" + qparams;
        } else {
            url += ".json?meta_prefix=m_&auth_token=" + this.auth_token;
            if(qparams) {
                url = url + "&" + qparams;
            }
        }
        Ti.API.info(method + ' ' + url + '\nBody : ' + body);
        if(Ti.App.Properties.hasProperty('Demo') && method === "GET" && Ti.App.Properties.hasProperty(url)) { 
             var cache = Ti.App.Properties.getString(url);
             Ti.API.info("WARNING : Use cache value for " + url + "\n" + cache);
             var responseJSON = JSON.parse(cache);
             func(responseJSON);   
        } else {
            var client = Ti.Network.createHTTPClient({
             // function called when the response data is available
             onload : function(e) {
                 Ti.App.Properties.setString(url, this.responseText);
                 var response = JSON.parse(this.responseText);
                 func(response);
             },
             
             // function called when an error occurs, including a timeout
             onerror : function(e) {
                //alert('error')
                 Spinner.hide(); 
                 if(client.status === 204 && method === 'DELETE') {
                     Ti.API.info("DELETE Ok");
                 } else {
                     Ti.API.debug("HTTP Error : " + JSON.stringify(e) + " / " + qparams);
                     var prevAnswer = Ti.App.Properties.getString(url);
                     if(method === "GET" && prevAnswer) 
                     {
                         Ti.API.info("WARNING : Use cache value for " + url + "\n" + prevAnswer);
                         var response = JSON.parse(prevAnswer);
                         func(response);
                     } 
                     else 
                     {
                         if(silent) {
                             Ti.API.info("--> HTTP return code : " + client.status + '-' + client.statusText);
                         } else { 
                             Ti.API.info('Impossible to connect to network ' + client.status + ' - ' + client.statusText);
                         }
                         func(null);
                     }
                 }
                 
             },
             timeout : 20000  // in milliseconds
            });
            // Prepare the connection.
            client.open(method, url);
            client.setRequestHeader("Content-Type","application/json");
            // Send the request.
            try {
                if(body) {
                    client.send(body);         
                } else {
                    client.send();
                }
            } catch(err) {
                Ti.API.info("Error in Datamager : send => " + err);
            }
        }
    };

    return this;
}

DataManager.prototype.updateObject = function(obj, func) {'use strict';
    var entry = obj.getJSON(true);
    this.doCall("PUT", obj.getUrl(), null, entry, function(ret) {
        // Ti.API.info('PUT answer : ' + JSON.stringify(ret));
        if(func) {
            func(ret.entry);
        }
    });  
};

DataManager.prototype.removeObject = function(obj, func) {'use strict';
    this.doCall("DELETE", obj.getUrl(), null, null, function(ret) {
        // Ti.API.info('DELETE answer : ' + JSON.stringify(ret));
        if(func) {
            func(ret);
        }
    });  
};

DataManager.prototype.createObject = function(obj, func) {'use strict';
    var entry = obj.getJSON(true);
    this.doCall("POST", obj.getEntriesUrl(), null, entry, function(ret) {
        // Ti.API.info('POST answer : ' + JSON.stringify(ret));
        if(func) {
            func(ret.entry);
        }
    });
};

DataManager.prototype.getObject = function(obj, qparams, func) {'use strict';
    this.doCall("GET", obj.getUrl(), qparams, null,
        function(ret) {
            Ti.API.info('GET answer : ' + JSON.stringify(ret));
            if(func) {
                func(ret.entry);
            } 
        }
    );
};

DataManager.prototype.getUrl = function(url, qparams, func) {'use strict';
    this.doCall("GET", url, qparams, null,
        function(ret) {
            Ti.API.info('GET answer : ' + JSON.stringify(ret));
            if(func) {
                func(ret.entry);
            } 
        }
    );
};

DataManager.prototype.getList = function(obj, qparams, func) {'use strict';
    this.doCall("GET", obj.getEntriesUrl(), qparams, null,
        function(ret) {
            Ti.API.info('GET List answer : ' + JSON.stringify(ret));
            if(func) {
                func(ret && ret.array && ret.array.resources);
            } 
        }
    );
};

module.exports = DataManager;