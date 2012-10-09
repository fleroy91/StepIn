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

function addBackButton(win) { 'use strict';
    var btRefresh = Ti.UI.createButton({title : 'Accueil', win:win});
    win.setLeftNavButton(btRefresh);
    btRefresh.addEventListener('click', function(e) {
        win.tabGroup.close();
    });
}
var self, messageWin, messageView, messageLabel, displayNewPoints = false, rewardWindow = null;
var allTags;
var _tabGroup;
var _allWindows = [];

function ApplicationTabGroup() { 'use strict';

    var Shop = require("/model/Shop"),
       shop = Shop.getCurrentShop();
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
    
    self = Titanium.UI.createTabGroup({});
    
    var TabWindow = require('ui/common/TabviewWindow');
       
    var mainObject = (Ti.App.adminMode ? shop : user); 
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
    addBackButton(winAccount);

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
    allTags = [];
    self.fillTable = function(allObjects) {
        if(allObjects) {
            var newTags = allTags;
            Ti.API.info("In refresh table");
            self.tvSearch.setData([]);
            var i;
            for(i = 0; i < allObjects.length; i ++) {
                var obj = allObjects[i];
                var j, tags = obj.tags;
                if(tags){
                    for(j = 0; j < tags.length; j ++) {
                        var tag = tags[j];
                        var curTag = tagAlreadyIn(newTags, tag);
                        if(! curTag) {
                            var prevtag = tagAlreadyIn(allTags, tag);
                            newTags.push({'tag':tag, 'value':(prevtag ? prevtag.value : true)});
                        }   
                    }
                }
                var row = obj.createTableRow();
                self.tvSearch.appendRow(row, {animated: true});
            }
            allTags = newTags;
        }
        if(self.activeTab.tv) {
            self.activeTab.tv.fireEvent('app:endReloading');
        }
        setTimeout(self.hideIndicator, 250);
        
        // We sort the tags
        allTags.sort(function(t1, t2) { return strcmp(t1.tag,t2.tag); });
    };
    
    self.createTitle = function(win) {
        // We change the titleControl of the current window
        var points = user.getTotalPoints();
        // For platinum !
        var min = 20000;
        var max = 100000;
        
        var image = 'platinum.gif';
        if(points < 1500) {
            min = 0;
            max = 1500;
            image = 'ivory.gif';
        } else if(points < 5000) {
            min = 1500;
            max = 5000;
            image = 'silver.gif';
        } else if(points < 20000) {
            min = 5000;
            max = 20000;
            image = 'gold.gif';
        }
        var prog = Ti.UI.createProgressBar({
            min : min,
            max : max,
            value : points,
            width : 150,
            message : (points || "0") + " points",
            color:'#fff',
            font : {fontSize : 12, fontWeight : 'normal'},
            style : Ti.UI.iPhone.ProgressBarStyle.BAR
        });
        prog.show();
        win.prog = prog;
        
        win.addEventListener('focus', function(e) {
            self.updateTitle(win);
        });
        
        win.barColor = 'black';
        win.setTitleControl(prog);
    };
    
    self.createTitle(winSearch);
    self.createTitle(winAccount);
    self.createTitle(winPresents);
    self.createTitle(winMorePoints);
    
    self.updateTitleWindow = function(win) {
        if(win && win.prog) {
            var user = AppUser.getCurrentUser();
            var points = user.getTotalPoints();
            win.prog.show();
            win.prog.setValue(points);
            win.prog.setMessage((points || "0") + " points");
        }
    };
    
    self.updateTitle = function(win) {
        if(! win) {
            self.updateTitleWindow(winSearch);
            self.updateTitleWindow(winAccount);
            self.updateTitleWindow(winPresents);
            self.updateTitleWindow(winMorePoints);
        } else {
            self.updateTitleWindow(win);
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
        setTimeout(self.hideIndicator, 250);
    };
    
    self.addNewReward = function(rew, verbose, func) {
        var ret = false;
        // We need to check that the reward doesn't exist
        // FIXME : inutile de regarder dans tvPresents !!!!
        var found = false;
        
        // var section = self.tvPresents.getData(), i, found = false;
        // if(section && section.length > 0 && rew.points > 0) {
            // var rows = section[0].getRows();
            // for(i = 0; !found && i < rows.length; i ++) {
                // found = rew.isClosedTo(rows[i].object);
            // }
        // }
        if(found) {
            rew.points = 0;
            if(verbose) {
                self.setDisplayMessage("Désolé mais vous avez déjà fait un " + rew.getActionKind() + " récemment dans cette boutique !");
            }
            if(func) {
                func(rew);                
            }
        } else {
            ret = true;
            user.total_points += rew.getNbPoints();
            user.saveAll();
            self.updateTitle();
            if(verbose) {
                self.setDisplayNewPoints("Bravo !", "Vous venez de gagner " + rew.getNbPoints() + " points grâce à ce " + rew.getActionKind(), rew.getNbPoints());
            }
            rew.create();
            if(func) {
                func(rew);
            }
            return true;
        }
        return ret;
    };
    
    self.getIndex = function(tv, object) {
        var index = null;
        var found = false;
        var section = tv.getData();
        if(section && section.length > 0) {
            var rows = section[0].getRows(), i;
            for(i = 0; !found && i < rows.length; i++) {
                if(rows[i].object.getUrl() === object.getUrl()) {
                    index = i;
                    found = true;
                }
            }
        }
        return index;
    };
    
    function getNbRows(tv) {
        var nb = 0;
        var section = tv.getData();
        if(section && section.length > 0) {
            nb = section.getRows().length;
        }
        return nb;
    }
    
    self.updateobj = function(obj, func) {
        var index, row;
        index = self.getIndex(self.tvSearch, obj);
        if(index) {
            row = obj.createTableRow();
            self.tvSearch.updateRow(index, row);
        } else {
            // It's a new object
            obj.index = getNbRows(self.tvSearch);
            row = obj.createTableRow();
            self.tvSearch.appendRow(row);
        }
        if(func) {
            func(obj);
        }
    };
    self.getAllObjects = function() {
        self.showIndicator();
        mainObject.retrieveShops(allTags, self.fillTable, true);
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
    
    self.chooseFilter = function() {
        var ChooseFilterWindow = require("/ui/common/ChooseFilterWindow"),
            win = new ChooseFilterWindow(allTags);
            
        win.addEventListener('close', function(e) {
            if(e.source.tags) {
                allTags = e.source.tags;
                self.getAllObjects();
            }
        });
        self.activeTab.open(win, {animated:true});
    };
    
    self.setDisplayNewPoints = function(title, details, points) {
        displayNewPoints = true;
        messageLabel.text = null;
        var NewRewardWindow = require("ui/common/NewRewardWindow");
        rewardWindow = new NewRewardWindow({title : title, details : details, points : points});
        
        rewardWindow.open({animated:true});
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

    var timer = null;
    // Function we have to call every X secs
    self.updateAllRows = function() {
        self.tvSearch.startLayout();
        var section = self.tvSearch.getData();
        if (section && section.length > 0) {
            var data = section[0].getRows();
            var i, booked = false;
            for ( i = 0; i < data.length; i++) {
                var obj = data[i].object;
                var row = data[i];
                if (obj) {
                    row = obj.updateRow(row);
                    self.tvSearch.updateRow(i, row);
                }
            }
        }
        self.tvSearch.finishLayout();
    };
    var allCodes = [];
    self.didHearCode = function(code) {
        if(allCodes.indexOf(code) >= 0) {
            Ti.API.info("Code already heard so ignored : " + code);
        } else {
            allCodes.push(code);
            // The shop must be in the tvSearch
            var section = self.tvSearch.getData(); 
            var shopFound = null;
            if(section && section.length > 0) {
                var rows = section[0].getRows();
                var indexFound = null;
                if(rows) {
                    var i;
                    for(i = 0; !shopFound && i < rows.length; i++) {
                        if(rows[i].object && rows[i].object.beancode.toString() === code.toString() && rows[i].hasDetail) {
                            indexFound = i;
                            rows[i].backgroundColor = '#eadae3';
                            rows[i].hasDetail = false;
                            rows[i].hasCheck = true;
                            shopFound = rows[i].object;
                            shopFound.checkin = true;
                            rows[i] = shopFound;
                        }
                    }
                    /*
                    if(shopFound) {
                        for(i = 0; i < rows.length; i++) {
                            if(i !== indexFound && rows[i].object.checkin) {
                                var s = rows[i].object;
                                s.checkin = false;
                                rows[i].hasCheck = false;
                                rows[i].hasDetail = true;
                                rows[i].object = s;
                                rows[i].backgroundColor = null;
                            }
                        }
                    }
                    */
                }
            }
            // We need to look for the shop
            if(shopFound) {
                Ti.API.info("Shop found for code : " + code + " :" + shopFound.getJSON());
                // We create a reward
                var Reward = require("model/Reward"), 
                    rew = new Reward();
                rew.setUser(user);
                rew.setShop(shopFound);
                rew.setNbPoints(shopFound.getPoints('stepin'));
                rew.setActionKind("Step-in");
                self.addNewReward(rew, true, function(reward) {
                    // We open the shop window
                    var checkin = shopFound.checkin; 
                    var FormWindow = require("ui/common/FormWindow"),
                        subwin = new FormWindow(null, 'read', shopFound, self);
                    self.setActiveTab(0);
                    self.tabSearch.open(subwin, {animated:true});
                });
            }
        } 
    };
    // Creates the timer
    // TODO : not useful
    // timer = setInterval(self.updateAllRows, 1000);
    
    self.addEventListener('open', self.getAllObjects);
    self.addEventListener('open', self.getAllPresents);
    
    // To hear the sound
    var SonicModule = require('com.sonic');
    self.addEventListener('open', function(e) {
        _tabGroup = self;
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
    }); 
   
    self.addEventListener('focus', function(e) {
        _tabGroup = self;
    }); 

    self.addEventListener('close', function(e){
        clearInterval(timer);
        SonicModule.stopSonic();
        Ti.API.info("==> Arrêt de Sonic");
        Ti.App.Properties.setBool('isSonicRunning', false);
    });
    
    // TODO : Implement the management by tab !!!!
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
    
    self.openWindow = function(win) {
        self.createTitle(win);
        _allWindows.push(win);
        win.containingTab = self.activeTab;
        win.containingTab.open(win, {animated:true});
    };
    
    self.closeAllWindows = function() {
        var i = 0;
        for(i = _allWindows.length-1; i >=0; i--) {
            _allWindows[i].containingTab.close(_allWindows[i], {animated:false});    
        }
        _allWindows = [];
    };
	return self;
}

ApplicationTabGroup.startSonic = function() { 'use strict';
    if(! Ti.App.Properties.getBool('isSonicRunning', false)) {
        // alert("On lance Sonic");
        if(! Tools.isSimulator()) {
            Ti.App.Properties.setBool('isSonicRunning', true);
            Ti.API.info("==> Lancement de Sonic");
            var SonicModule = require('com.sonic');
            SonicModule.StartSonic({
                onHear : function(e) {
                    alert("Hear from Sonic : " + e + " -" + JSON.stringify(_tabGroup));
                    Ti.API.info("Hear from Sonic : " + e);
                    if(_tabGroup) {
                        _tabGroup.didHearCode(e);
                    }
                },
                onError : function(e) {
                    Ti.API.info("Error : " + e);
                    alert("Erreur : On a entendu le son" + e.toString() +"\nMais rien ne correspond !");
                }
            });
        }
    }
};

ApplicationTabGroup.stopSonic = function() { 'use strict';
    if(Ti.App.Properties.getBool('isSonicRunning', false)) {
        // alert("On stoppe Sonic");
        var SonicModule = require('com.sonic');
        if(! Tools.isSimulator()) {
            Ti.API.info("==> Arrêt de Sonic");
            Ti.App.Properties.setBool('isSonicRunning', false);
        }
    }
};

module.exports = ApplicationTabGroup;
