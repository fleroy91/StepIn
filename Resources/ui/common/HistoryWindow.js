// 
//  ShopHistoryWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, TV : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

var allRewards = [];
var refresh_all = true;

var TV = require("/etc/TV");

function HistoryWindow(args) { 'use strict';
    var self = Ti.UI.createWindow({
        barColor : 'black'});
    self.total_points = 0;
    var tabGroup = args.tabGroup;
    
    var tv = TV.create({
        scrollable : true, 
        editable : true
    }, function(e)  {
        tabGroup.getAllRewards();
    });
    self.add(tv);

    self.tv = tv;
    
    tv.addEventListener('delete', function(e) {
        var rew = e.row.object;
        rew.remove();
    });
    
    var btConvert = Ti.UI.createButton({
        title : "Convertir"
    });
    self.setRightNavButton(btConvert);
    btConvert.addEventListener('click', function(e) {
        var ShopPresentsWindow = require("/ui/common/PresentsWindow"),
            win = new ShopPresentsWindow(self);
        self.containingTab.open(win, {animated:true});
    });
    
    self.updateTitle = function(nb) {
        self.total_points = nb;
        self.setTitle(nb + " points");
    };
    
    self.addEventListener('focus', function(e) {
        self.containingTab.setBadge(null);
        self.updateTitle(self.total_points);
    });
    
    return self;
}

module.exports = HistoryWindow;
