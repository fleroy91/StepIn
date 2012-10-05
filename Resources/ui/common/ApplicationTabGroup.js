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

function addBackButton(win) { 'use strict';
    var btRefresh = Ti.UI.createButton({title : 'Accueil', win:win});
    win.setLeftNavButton(btRefresh);
    btRefresh.addEventListener('click', function(e) {
        win.tabGroup.close();
    });
}
var self, messageWin, messageView, messageLabel, displayNewPoints = false, rewardWindow = null;
var allTags;

function ApplicationTabGroup() { 'use strict';

    var Shop = require("/model/Shop"),
       shop = Shop.getCurrentShop();
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
    
    self = Titanium.UI.createTabGroup();
    
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

	var win1 = new TabWindow({booking : false, tabGroup : self});
	var tabSearch = Ti.UI.createTab({
		title : Ti.Locale.getString('mystock_tab_title','Autour de moi'),
		icon : '/images/35-shopping.png',
		window : win1
	});
	win1.containingTab = tabSearch;
	Spinner.add(win1);
	self.tabSearch = tabSearch;
	self.tvSearch = win1.tv;
    tabSearch.tv = win1.tv;
	
	var RewardWindow = require('ui/common/HistoryWindow');
	var win3 = new RewardWindow({tabGroup : self});
	var tabRewards = Ti.UI.createTab({
		title : Ti.Locale.getString('history_tab_title','Historique'),
        icon : '/images/172-pricetag.png',
		window : win3
	});
	win3.containingTab = tabRewards;
    Spinner.add(win3);
    self.tvRewards = win3.tv;
    self.tabRewards = tabRewards;
    tabRewards.tv = win3.tv;

	var AccountWindow = require('ui/common/AccountWindow');
	var win4 = new AccountWindow({tabGroup : self});
	var tabAccount = Ti.UI.createTab({
		title : Ti.Locale.getString('account_tab_title','Mon compte'),
        icon : '/images/111-user.png',
		window : win4
	});
	win4.containingTab = tabAccount;
    Spinner.add(win4);
    addBackButton(win4);

	//
	//  add tabs
	//
	self.addTab(tabSearch);
	self.addTab(tabRewards);
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
            var dataSearch = [], dataBooked = [], i;
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
                dataSearch.push(row);
            }
            allTags = newTags;
            self.tvSearch.setData(dataSearch);
        }
        self.activeTab.tv.fireEvent('app:endReloading');
        setTimeout(self.hideIndicator, 250);
        
        // We sort the tags
        allTags.sort(function(t1, t2) { return strcmp(t1.tag,t2.tag); });
    };
    
    function updateTitle() {
        // We change the titleControl of the current window
        var win = self.activeTab.window;
        var points = win3.total_points;
        var view = Ti.UI.createView({
            height : 48,
            width : 150
        });
        
        var image = 'platinum.gif';
        if(points < 1500) {
            image = 'ivory.gif';
        } else if(points < 5000) {
            image = 'silver.gif';
        } else if(points < 20000) {
            image = 'gold.gif';
        }
        
        var img = Ti.UI.createImageView({
            width : 48,
            height : 48,
            left : 0,
            borderRadius : 2,
            image : '/images/' + image
        });
        view.add(img);
        
        var lbl = Ti.UI.createLabel({
            text : points + " points",
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            width :100,
            left : 50,
            font:{fontSize : 14},
            color : '#ba307c',
            shadowOffset : { x : 1, y : 1},
            shadowColor : '#eadae3'
        });
        view.add(lbl);
        
        win.setTitleControl(view);
        win.barImage = '/images/bg_gradient.png';
    } 

    self.fillRewards = function(allRewards) {
        win3.total_points = 0;
        if(allRewards) {
            Ti.API.info("In refresh table");
            var data = [], i;     
    
            for(i = 0; allRewards && i < allRewards.length; i ++) {
                var rew = allRewards[i];
                var row = rew.createTableRow();
                data.push(row);
                // TODO : updater les shops en checkin / checkout
                win3.total_points += rew.getNbPoints();
            }
            self.tvRewards.setData(data);
        }
        updateTitle();
        self.activeTab.tv.fireEvent('app:endReloading');
        setTimeout(self.hideIndicator, 250);
    };
    
    self.updateBadges = function() {
        // TODO : see if we can remove this one
        var ii = 0;
    };
    
    self.addNewReward = function(rew, comeFromWindow) {
        var ret = false;
        // We need to check that the reward doesn't exist
        var section = self.tvRewards.getData(), i, found = false;
        if(section && section.length > 0) {
            var rows = section[0].getRows();
            for(i = 0; !found && i < rows.length; i ++) {
                found = rew.isClosedTo(rows[i].object);
            }
        }
        if(found) {
            if(comeFromWindow) {
                self.setDisplayMessage("Désolé mais vous avez déjà fait un " + rew.getActionKind() + " récemment dans cette boutique !");
            }
        } else {
            ret = true;
            rew.create(function(newRew) {
                if(newRew) {
                    var row = newRew.createTableRow();
                    self.tvRewards.insertRowBefore(0, row);
                    var nbBadges = self.tabRewards.getBadge() || 0;
                    self.tabRewards.setBadge(nbBadges+1);
                    win3.total_points += newRew.getNbPoints();
                    self.setDisplayNewPoints("Bravo !", "Vous venez de gagner " + newRew.getNbPoints() + " points grâce à ce " + rew.getActionKind(), newRew.getNbPoints());
                    return true;
                }
            });
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

    self.getAllRewards = function() {
        Ti.API.info("In getAllRewards");
        mainObject.retrieveRewards(self.fillRewards);
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
            self.updateBadges();
        }
        self.tvSearch.finishLayout();
    };
   // Creates the timer
    timer = setInterval(self.updateAllRows, 1000);
    
    self.addEventListener('open', self.getAllObjects);
    self.addEventListener('open', self.getAllRewards);
    
    // To hear the sound
    self.addEventListener('open', ApplicationTabGroup.startSonic); 
   
    self.addEventListener('focus', ApplicationTabGroup.startSonic); 

    self.addEventListener('focus', updateTitle);
     
    self.addEventListener('close', function(e){
        clearInterval(timer);
        ApplicationTabGroup.stopSonic();
    });
    
	return self;
}
    
ApplicationTabGroup.startSonic = function() { 'use strict';
    if(self && ! Ti.App.Properties.getBool('isSonicRunning', false)) {
        Ti.API.info("==> Lancement de Sonic");
        var SonicModule = require('com.sonic');
        SonicModule.StartSonic({
            onHear : function(e) {
                Ti.API.info("Hear : " + e);
                // TODO : We need to retreive the shop with this code
                var AppUser = require("model/AppUser"),
                    user = AppUser.getCurrentUser();
                
                user.retreiveShop(function(shopFound) {
                    if(shopFound) {
                        // We create a reward
                        var Reward = require("model/Reward"), 
                            rew = new Reward();
                        rew.setUser(user);
                        rew.setShop(shopFound);
                        rew.setNbPoints(250);
                        rew.setActionKind("Step-in");
                        rew.create(self.addNewReward);
                    }
                }, 
                // qparams to look
                {beancode : e});
            },
            onError : function(e) {
                Ti.API.info("Error : " + e);
                alert("Erreur : On a entendu le son" + e.toString() +"\nMais rien ne correspond !");
            }
        });
        Ti.App.Properties.setBool('isSonicRunning', true);
    }
};

ApplicationTabGroup.stopSonic = function() { 'use strict';
    if(Ti.App.Properties.getBool('isSonicRunning', false)) {
        Ti.API.info("==> Arrêt de Sonic");
        var SonicModule = require('com.sonic');
        SonicModule.StopSonic();
        Ti.App.Properties.setBool('isSonicRunning', false);
    }
};

module.exports = ApplicationTabGroup;
