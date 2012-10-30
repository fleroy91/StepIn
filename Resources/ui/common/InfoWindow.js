// 
//  InfoWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/AppImage");

function InfoWindow(args) {'use strict';
	var self = Ti.UI.createWindow({ 
	    title : 'Infos', 
	    backgroundColor : 'white',
        barImage : '/images/topbar.png'
    });
    
    function batteryStateToString(state)
    {
        switch (state)
        {
            case Titanium.Platform.BATTERY_STATE_UNKNOWN:
                return 'unknown';
            case Titanium.Platform.BATTERY_STATE_UNPLUGGED:
                return 'unplugged';
            case Titanium.Platform.BATTERY_STATE_CHARGING:
                return 'charging';
            case Titanium.Platform.BATTERY_STATE_FULL:
                return 'full';
        }
        return '???';
    }

    var data = '';
    
    data+= 'ID: ' + Titanium.App.getID() + '\n';
    data+= 'Name: ' + Titanium.App.getName() + '\n';
    data+= 'Version: ' + Titanium.App.getVersion() + '\n';
    data+= 'Publisher: ' + Titanium.App.getPublisher() + '\n';
    data+= 'URL: ' + Titanium.App.getURL() + '\n';
    data+= 'Description: ' + Titanium.App.getDescription() + '\n';
    data+= 'Copyright: ' + Titanium.App.getCopyright() + '\n';
    data+= 'GUID: ' + Titanium.App.getGUID() + '\n';
    if (Titanium.Platform.osname === 'mobileweb') {
        data+= 'Path: ' + Titanium.App.appURLToPath('index.html') + '\n';
    }
    data+= 'Build: ' + Titanium.version + '.' + Titanium.buildHash + ' (' + Titanium.buildDate + ')\n';
    
    var linfo = '';

    linfo += 'name/osname: ' + Titanium.Platform.name+'/'+Titanium.Platform.osname + '\n';
    linfo += 'model: ' + Titanium.Platform.model + '\n';
    linfo += 'version: ' + Titanium.Platform.version +'\n';    
    linfo += 'architecture: ' + Titanium.Platform.architecture + '\n';
    linfo += 'macaddress: ' + Titanium.Platform.macaddress + '\n';
    linfo += 'processor count: ' + Titanium.Platform.processorCount + '\n';
    linfo += 'username: ' + Titanium.Platform.username + '\n';
    linfo += 'address: ' + Titanium.Platform.address + '\n';
    linfo += 'ostype: ' + Titanium.Platform.ostype + '\n';
    linfo += 'battery state: ' + batteryStateToString(Titanium.Platform.batteryState) + '\n';
    linfo += 'battery level: ' + Titanium.Platform.batteryLevel + '\n';
    linfo += 'display width-x-height: ' + Titanium.Platform.displayCaps.platformWidth + 'x' + Titanium.Platform.displayCaps.platformHeight + '\n';
    linfo += 'display density: ' + Titanium.Platform.displayCaps.density + '\n';
    linfo += 'display dpi: ' + Titanium.Platform.displayCaps.dpi + '\n';
    linfo += 'available memory: ' + Titanium.Platform.availableMemory + '\n';
    linfo += 'is24HourTimeFormat: ' + Titanium.Platform.is24HourTimeFormat() + '\n';
    
    linfo += "\nCurrent Phone Locale: "+Titanium.Platform.locale + '\n';
    linfo += "OS name: " + Titanium.Platform.osname + '\n';
    linfo += "Runtime: " + Titanium.Platform.runtime + '\n';
    
    if (Titanium.Platform.osname === 'iphone' || Titanium.Platform.osname === 'ipad') {
        linfo += "Data network:  " + Titanium.Platform.dataAddress + '\n';
        linfo += "Netmask: " + Titanium.Platform.netmask + '\n';
    }    
    
    var row1 = Ti.UI.createTableViewRow({width : Ti.UI.FILL});
    var lbl1 = Ti.UI.createLabel({
        text:data,
        left : 0,
        font:{fontSize:12}
    });
    row1.add(lbl1);
    var row2 = Ti.UI.createTableViewRow({width : Ti.UI.FILL});
    var lbl2 = Ti.UI.createLabel({
        text:linfo,
        left : 0,
        font:{fontSize:12}
    });
    row2.add(lbl2);
    var rows = [row1, row2];
    
    var tv = Ti.UI.createTableView({
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        height : 'auto',
        scrollable : true,
        data : rows
    });
    
    self.add(tv);
	return self;
}

module.exports = InfoWindow ;