// 
//  ShopApplicationTabGroup.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
// Display tabWindows for Objects + bookings
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Spinner = require("etc/Spinner");
var Tools = require("etc/Tools");
var Image = require("etc/AppImage");

var self, messageWin, messageView, messageLabel, displayNewPoints = false, rewardWindow = null;
var _allWindows = [];

function ApplicationTabGroup() { 'use strict';

    var Shop = require("/model/Shop"),
       shop = Shop.getCurrentShop();
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
    
    // FIXME : colors checking
    self = Titanium.UI.createTabGroup({
        activeTabBackgroundColor : 'red',
        activeTabBackgroundFocusedColor : '#d92276',
        activeTabBackgroundSelectedColor : 'yellow'
    });
    
    var TabWindow = require('ui/common/TabviewWindow');
       
    var mainObject = user; 
    var actInd = Titanium.UI.createActivityIndicator({
        style : Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
        font : {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'},
        color : 'white',
        message : Ti.Locale.getString('loading_indicator_text','Chargement...'),
        textAlign : 'center'
    });
    self.actInd = actInd;
        
    self.showIndicator = function() {
        var tab = self.getActiveTab();
        if(tab && tab.window) {
            tab.window.setToolbar([self.actInd],{animated:true});
            self.actInd.show();
        }
    };
    self.hideIndicator = function() {
        var tab = self.getActiveTab();
        if(tab && tab.window) {
            self.actInd.hide();
            tab.window.setToolbar(null,{animated:true});
        }
    };

    Spinner.add(self);

	var winSearch = new TabWindow({booking : false, tabGroup : self});
	var tabSearch = Ti.UI.createTab({
		title : Ti.Locale.getString('mystock_tab_title','A coté'),
		icon : '/images/Sin-proximite.png',
		window : winSearch
	});
	winSearch.containingTab = tabSearch;
	Spinner.add(winSearch);
	self.tabSearch = tabSearch;
	self.tvSearch = winSearch.tv;
    self.mapSearch = winSearch.map;
    tabSearch.tv = winSearch.tv;
    
    var MorePointsWindow = require("/ui/common/MorePointsWindow");
    var winMorePoints = new MorePointsWindow({booking : false, tabGroup : self});
    var tabMorePoints = Ti.UI.createTab({
        title : "Plus de points",
        icon : '/images/Sin-plus-pts.png',
        window : winMorePoints
    });
    winMorePoints.containingTab = tabMorePoints;
    Spinner.add(winMorePoints);
    self.tabMorePoints = tabMorePoints;
    self.tvMorePoints = winMorePoints.tv;
    tabMorePoints.tv = winMorePoints.tv;

	var PresentsWindow = require('ui/common/PresentsWindow');
	var winPresents = new PresentsWindow({tabGroup : self});
	var tabPresents = Ti.UI.createTab({
		title : 'Cadeaux',
        icon : '/images/Sin-cadeaux.png',
		window : winPresents
	});
	winPresents.containingTab = tabPresents;
    Spinner.add(winPresents);
    self.tvPresents = winPresents.tv;
    self.tabPresents = tabPresents;
    tabPresents.tv = winPresents.tv;

	var AccountWindow = require('ui/common/AccountWindow');
	var winAccount = new AccountWindow({tabGroup : self});
	var tabAccount = Ti.UI.createTab({
		title : Ti.Locale.getString('account_tab_title','Compte'),
        icon : '/images/Sin-param.png',
		window : winAccount
	});
	winAccount.containingTab = tabAccount;
    Spinner.add(winAccount);

	//
	//  add tabs
	//
	self.addTab(tabSearch);
	self.addTab(tabPresents);
    self.addTab(tabMorePoints);
	self.addTab(tabAccount);
	
	//
	// Management of arrays of objects
	//
	function strcmp(a, b) {
        if (a.toString() < b.toString()) { return -1; }
        if (a.toString() > b.toString()) { return 1; }
        return 0;
    }
    
    function tagAlreadyIn(all, tag) {
        var i, ret = null;
        for(i = 0 ; !ret && i< all.length; i ++) {
            var t = all[i];
            if(t.tag === tag) {
                ret = t;
            }
        }
        return ret;
    }
    self.addNewObject = function(obj) {
        var row = obj.createTableRow();
        self.tvSearch.appendRow(row, {animated: true});
        if(self.activeTab.tv) {
            self.activeTab.tv.fireEvent('app:endReloading');
        }
    };
    
    self.createPointsButton = function() {
        // We change the titleControl of the current window
        var points = user.getTotalPoints() || 0;
        var maxWidth = 80;
        var viewWidth = maxWidth - 14;
        var w = Math.round(((points % 2000) + 1) / 2000 * viewWidth);
        var enclosingView = Ti.UI.createView({
            right : 10,
            height : 20,
            width : maxWidth
        });
        var view = Ti.UI.createView({
            left : 0,
            height : 16,
            width : viewWidth,
            borderRadius : 4,
            borderColor : '#d92276',
            borderWidth : 1
        });
        enclosingView.add(view);
        var backView = Ti.UI.createView({
            width : w,
            left:0,
            height : view.height,
            backgroundColor : '#d92276',
            borderRadius : view.borderRadius,
            borderWidth : 0
        });
        view.add(backView);
        var lblIn = Image.createStepInStar({
            right : 0,
            height : 13,
            width : 13
        });
        enclosingView.add(lblIn);
        var lblPoints = Ti.UI.createLabel({
            text : points,
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            right : 4,
            font:{fontSize : 12, fontWeight : 'bold'},
            color : 'white'
        });
        view.add(lblPoints);
        enclosingView.addEventListener('click', function(e) {
            self.setActiveTab(1); 
        });
        enclosingView.setPoints = function(p, animated) {
            p = p || 0;
            lblPoints.setText(p);
            var w = Math.round(((p % 2000) + 1) / 2000 * viewWidth);
            if(animated) {
                var a = Ti.UI.createAnimation({width : w, duration : 500});
                backView.animate(a);
            } else {
                backView.setWidth(w);
            }
        };
        return enclosingView;
    };
    
    self.createTitle = function(win, hiddenTitle) {
        win.addEventListener('focus', function(e) {
            self.updateTitle(win);
        });
        win.barColor = 'black';
        win.setTitle(null);
        win.hiddenTitle = hiddenTitle || win.hiddenTitle;
        if(Ti.UI.getCurrentWindow() && Ti.UI.getCurrentWindow().hiddenTitle) {
            win.setLeftNavButtonTitle(Ti.UI.getCurrentWindow().hiddenTitle);
        }
        
        var btPoints = self.createPointsButton();
        win.setRightNavButton(btPoints);
        win.btPoints = btPoints;
    };
    
    self.createTitle(winSearch, "A coté");
    self.createTitle(winAccount, "Mon compte");
    self.createTitle(winPresents, "Cadeaux");
    self.createTitle(winMorePoints, "Plus de points");
    
    self.updateTitleWindow = function(win, animated) {
        if(win && win.btPoints) {
            var user = AppUser.getCurrentUser();
            var points = user.getTotalPoints();
            win.btPoints.setPoints(points || 0, animated);
        }
    };
    
    self.updateTitle = function(win, animated) {
        if(! win) {
            self.updateTitleWindow(winSearch, animated);
            self.updateTitleWindow(winAccount, animated);
            self.updateTitleWindow(winPresents, animated);
            self.updateTitleWindow(winMorePoints, animated);
            var i = 0;
            for(i = _allWindows.length-1; i >=0; i--) {
                self.updateTitleWindow(_allWindows[i], animated);
            }
        } else {
            self.updateTitleWindow(win, animated);
        }
    };
    
    self.fillPresents = function(allPresents) {
        if(allPresents) {
            winPresents.setPresents(allPresents);
        }
        self.updateTitle(self.activeTab.window);
        if(self.activeTab.tv) {
            self.activeTab.tv.fireEvent('app:endReloading');
        }
    };
    
    self.getTwoMorePoints = function() {
        // TODO : to implement
        return null;
    };
    
    self.addNewReward = function(rew, shop, func) {
        // We display the screen but we need to compute the next actions
        var nextActions = null;
        if(shop && shop.getTwoFreeScans) {
            // We have a shop so we search for free scans
            nextActions = shop.getTwoFreeScans();
        }
        if(! nextActions) {
            // No scans or no shops, we look for free shops
            nextActions = user.getTwoFreeShops();
        }
        if(! nextActions) {
            nextActions = self.getTwoMorePoints();
        }
        displayNewPoints = true;
        messageLabel.text = null;
        var NewRewardWindow = require("ui/common/NewRewardWindow");
        rewardWindow = new NewRewardWindow(self, rew, nextActions);
        rewardWindow.addEventListener('close', function(e) {
            if(e.source.object) {
                var newRew = e.source.object;
                user = AppUser.getCurrentUser();
                newRew.setUser(user);
                newRew.create();
                user.setTotalPoints(user.getTotalPoints() + newRew.getNbPoints());
                user.saveAll();
                self.updateTitle(null, true);
                if(! e.source.managedWindow) {
                    if(func) {
                        func(newRew);
                    }
                }
            }
        });
        rewardWindow.open();
    };
    
    function getNbRows(tv) {
        var nb = 0;
        var section = tv.getData();
        if(section && section.length > 0) {
            nb = section.getRows().length;
        }
        return nb;
    }
    
    self.getAllObjects = function() {
        self.showIndicator();
        self.tvSearch.setData([]);
        mainObject.retrieveShops(null, self.addNewObject, function(e) {
            self.hideIndicator();
        });
    };

    self.getAllPresents = function() {
        mainObject.retrievePresents(self.fillPresents);
    };

    messageWin = Titanium.UI.createWindow({
        height:80,
        width:250,
        bottom : 70,
        borderRadius:10,
        touchEnabled:false,
        orientationModes : [
            Titanium.UI.PORTRAIT,
            Titanium.UI.UPSIDE_PORTRAIT,
            Titanium.UI.LANDSCAPE_LEFT,
            Titanium.UI.LANDSCAPE_RIGHT
        ]
    });
    messageView = Titanium.UI.createView({
        id:'messageview',
        height:80,
        width:250,
        borderRadius:10,
        backgroundColor:'#000',
        opacity:0.7,
        touchEnabled:false
    });
        
    messageLabel = Titanium.UI.createLabel({
        id:'messagelabel',
        text:'',
        color:'#fff',
        width:250,
        height:80,
        font:{
            fontFamily:'Helvetica Neue',
            fontSize:13
        },
        textAlign:'center'
    });
    messageWin.add(messageView);
    messageWin.add(messageLabel);
    
    self.setDisplayMessage = function(message) {
        displayNewPoints = false;
        if(message) {
            messageLabel.text = message;
        }
    };
    
    self.displayMessage = function(message) {
        Titanium.UI.setBackgroundColor('#fff');
        if(message) {
            messageLabel.text = message;
        }
        // We don't display an empty message !
        if(messageLabel.text) {
            messageWin.open();

            setTimeout(function() {
                messageWin.close({opacity:0,duration:500});
            },3000);
        }
    };

    var allCodes = [];
    self.didHearCode = function(code) {
        if(allCodes.indexOf(code) >= 0) {
            Ti.API.info("Code already heard so ignored : " + code);
        } else {
            // The shop must be in the tvSearch
            var section = self.tvSearch.getData(); 
            var shopFound = null, row_index, obj_index;
            if(section && section.length > 0) {
                var rows = section[0].getRows();
                if(rows) {
                    var i;
                    for(i = 0; !shopFound && i < rows.length; i++) {
                        if(rows[i].object_index) {
                            var s = AppUser.getShop(rows[i].object_index);
                            if(s.beancode.toString() === code.toString() && ! s.isCheckin()) {
                                shopFound = s;
                                obj_index = rows[i].object_index;
                                row_index = i;
                            }
                        }
                    }
                }
            }
            if(shopFound) {
                Ti.API.info("Shop found for code : " + code + " :" + shopFound.getJSON());
                // We create a reward
                var row = shopFound.createTableRow();
                self.tvSearch.updateRow(row_index, row);
                
                var Reward = require("model/Reward"), 
                    rew = new Reward();
                rew.setUser(user);
                rew.setShop(shopFound);
                rew.setNbPoints(shopFound.getPoints(Reward.ACTION_KIND_STEPIN));
                rew.setActionKind(Reward.ACTION_KIND_STEPIN);
                self.closeAllWindows();
                self.setActiveTab(0);
                
                // We open the window 
                // TODO (except if it's already opened)
                var ShopDetailWindow = require("/ui/common/ShopDetailWindow"),
                    swin = new ShopDetailWindow(shopFound, self);
                self.openWindow(null, swin, {animated:true});

                self.addNewReward(rew, shopFound, function(reward) {
                    if(reward) {
                        allCodes.push(code);
                        var newShop = AppUser.getShop(obj_index);
                        newShop.checkin = true;
                        var row = newShop.createTableRow();
                        self.tvSearch.updateRow(row_index, row);
                    }
                });
            }
        } 
    };
    
    self.addEventListener('open', self.getAllPresents);
    self.addEventListener('open', self.getAllObjects);
    
    // To hear the sound
    var SonicModule = require('com.sonic');
    function sonicOn() {
        if(! Ti.App.Properties.getBool('isSonicRunning', false)) {
            // alert("On lance Sonic");
            if(! Tools.isSimulator()) {
                Ti.App.Properties.setBool('isSonicRunning', true);
                Ti.API.info("==> Lancement de Sonic");
                SonicModule.StartSonic({
                    onHear : function(e) {
                        // alert("Hear from Sonic : " + e);
                        Ti.API.info("Hear from Sonic : " + e.code);
                        self.didHearCode(e.code);
                    },
                    onError : function(e) {
                        Ti.API.info("Error : " + e.code);
                        // alert("Erreur : On a entendu le son" + e.toString() +"\nMais rien ne correspond !");
                    }
                });
            }
        }
    }
    function sonicOff() {
        if(Ti.App.Properties.setBool('isSonicRunning', false)) {
            SonicModule.StopSonic();
            Ti.API.info("==> Arrêt de Sonic");
            Ti.App.Properties.setBool('isSonicRunning', false);
        }
    }
    
    self.addEventListener('open', sonicOn);
    Ti.App.addEventListener("resumed", sonicOn);
    Ti.App.addEventListener("paused", sonicOff);
    // Should never happen
    self.addEventListener('close', sonicOff);
   
    self.closeWindow = function(win) {
        var pos = _allWindows.indexOf(win);
        if(pos >= 0) {
            _allWindows = _allWindows.slice(pos, 1);
        } else {
            alert("Fenetre inconnue !");
        }
        if(win.containingTab) {
            win.containingTab.close(win, {animated:true});
        } else {
            win.close({animated:true});
        }
    };
    
    self.openWindow = function(tab, win, options) {
        tab = tab || self.tabSearch;
        self.createTitle(win);
        _allWindows.push(win);
        win.containingTab = tab;
        tab.open(win, options);
    };
    
    self.closeAllWindows = function(options) {
        var i = 0;
        for(i = _allWindows.length-1; i >=0; i--) {
            _allWindows[i].containingTab.close(_allWindows[i], options || {animated : false});    
        }
        _allWindows = [];
    };
    
    self.updateAllRows = function() {
        var section = self.tvSearch.getData(); 
        if(section && section.length > 0) {
            var rows = section[0].getRows();
            if(rows) {
                var i;
                for(i = 0; i < rows.length; i++) {
                    if(rows[i].object_index) {
                        var s = AppUser.getShop(rows[i].object_index);
                        if(s.changed) {
                            var row = s.createTableRow();
                            self.tvSearch.updateRow(i, row);
                            s.changed = false;
                            AppUser.updateShop(s);
                        }
                    }
                }
            }
        }
        self.updateTitle();
    };
    
	return self;
}

module.exports = ApplicationTabGroup;
