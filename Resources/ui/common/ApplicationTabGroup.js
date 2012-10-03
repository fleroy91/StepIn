// 
//  ShopApplicationTabGroup.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
// Display tabWindows for Objects + bookings
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

function addBackButton(win) { 'use strict';
    var btRefresh = Ti.UI.createButton({title : 'Accueil', win:win});
    win.setLeftNavButton(btRefresh);
    btRefresh.addEventListener('click', function(e) {
        win.tabGroup.close();
    });
}
var self, messageWin, messageView, messageLabel, displayNewPoints = false, rewardWindow = null;

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
        message : Ti.Locale.getString('loading_indicator_text'),
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

    Ti.include("etc/spinner.js");
    Spinner.add(self);

	var win1 = new TabWindow({booking : false, tabGroup : self});
	var tabSearch = Ti.UI.createTab({
		title : Ti.Locale.getString('mystock_tab_title','Objects'),
		icon : '/images/35-shopping.png',
		window : win1
	});
	win1.containingTab = tabSearch;
	Spinner.add(win1);
	self.tabSearch = tabSearch;
	self.tvSearch = win1.tv;
    tabSearch.tv = win1.tv;
	
	var win2 = new TabWindow({booking : true, tabGroup : self});
	var tabResa = Ti.UI.createTab({
		title : Ti.Locale.getString('bookings_tab_title','Résas'),
        icon : '/images/15-tags.png',
		window : win2,
		nbBadges : 0
	});
	win2.containingTab = tabResa;
	win1.bookingTab = tabResa;
    Spinner.add(win2);
    self.tvBooked = win2.tv;
    self.tabResa = tabResa;
    tabResa.tv = win2.tv;
    
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
	self.addTab(tabResa);
	self.addTab(tabRewards);
	self.addTab(tabAccount);
	
	//
	// Management of arrays of objects
	//
    self.fillTable = function(allObjects) {
        Ti.API.info("In refresh table");
        var dataSearch = [], dataBooked = [], i;
        for(i = 0; i < allObjects.length; i ++) {
            var obj = allObjects[i];
            var booked = obj.isBooked(); 
            var row = obj.createTableRow();
            if(booked) {
                dataBooked.push(row);     
            } else {
                dataSearch.push(row);
            }
        }
        self.tvBooked.setData(dataBooked);
        self.tvSearch.setData(dataSearch);
        self.activeTab.tv.fireEvent('app:endReloading');
        setTimeout(self.hideIndicator, 500);
    };

    self.fillRewards = function(allRewards) {
        Ti.API.info("In refresh table");
        var data = [], i;     

        for(i = 0; allRewards && i < allRewards.length; i ++) {
            var rew = allRewards[i];
            var row = rew.createTableRow();
            data.push(row);
            win3.total_points += rew.getNbPoints();
        }
        self.tvRewards.setData(data);
        self.activeTab.tv.fireEvent('app:endReloading');
        setTimeout(self.hideIndicator, 500);
    };
    
    self.updateBadges = function() {
        var section = self.tvBooked.getData();
        if(section && section.length > 0) {
            var dataBooked = section[0].getRows();
            self.tabResa.setBadge((dataBooked.length > 0 ? dataBooked.length : null));
        }
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
    
    self.toggleBooking = function(article, do_booking, func) {
        var message = "";
        // We have to check that the action is equal to the state of the article
        // It not we do nothing
        if(article.isBooked() !== do_booking) {
            if(article.isBooked()) {
                article.unbook();
                article.save();
                message = "La réservation de votre article a été annulée !";
            } else  {
                article.book();
                article.save();
                message = "Félicitations ! Votre article est réservé pour 15 minutes !";
            }
            var index, row = article.createTableRow();
            if(article.isBooked()) {
                index = self.getIndex(self.tvSearch, article);
                self.tvSearch.deleteRow(index);
                self.tvBooked.appendRow(row);
            } else {
                index = self.getIndex(self.tvBooked, article);
                self.tvBooked.deleteRow(index);
                self.tvSearch.appendRow(row);
            }
            self.updateBadges();
            self.setDisplayMessage(message);
            if(func) {
                func(article);
            }
        }
    };
    
    function getNbRows(tv) {
        var nb = 0;
        var section = tv.getData();
        if(section && section.length > 0) {
            nb = section.getRows().length;
        }
        return nb;
    }
    
    self.updateArticle = function(obj, func) {
        var index, row;
        if(obj.isBooked()) {
            index = self.getIndex(self.tvBooked, obj);
        } else {
            index = self.getIndex(self.tvSearch, obj);
        }
        if(index) {
            row = obj.createTableRow();
            if(obj.isBooked()) {
                self.tvBooked.updateRow(index, row);
            } else {
                self.tvSearch.updateRow(index, row);
            }
        } else {
            // It's a new object
            if(obj.isBooked()) {
                obj.index = getNbRows(self.tvBooked);
                row = obj.createTableRow();
                self.tvBooked.appendRow(row);
            } else {
                obj.index = getNbRows(self.tvSearch);
                row = obj.createTableRow();
                self.tvSearch.appendRow(row);
            }
        }
        if(func) {
            func(obj);
        }
    };
    
    self.getAllObjects = function() {
        self.showIndicator();
        mainObject.retrieveShops(self.fillTable);
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
    
    self.setDisplayNewPoints = function(title, details, points) {
        displayNewPoints = true;
        var NewRewardWindow = require("ui/common/NewRewardWindow");
        rewardWindow = new NewRewardWindow({title : title, details : details, points : points});
        
        rewardWindow.open({animated:true});
    };
    
    self.displayMessage = function(message) {
        Titanium.UI.setBackgroundColor('#fff');
        if(message) {
            messageLabel.text = message;
        }
        messageWin.open();

        setTimeout(function() {
            messageWin.close({opacity:0,duration:500});
        },3000);
    };

    var timer = null;
    // Function we have to call every X secs
    self.updateAllRows = function() {
        self.tvBooked.startLayout();
        var section = self.tvBooked.getData();
        if (section && section.length > 0) {
            var data = section[0].getRows();
            var i, booked = false;
            for ( i = 0; i < data.length; i++) {
                var obj = data[i].object;
                var row = data[i];
                if (obj) {
                    var stillBooked = obj.stillBooked();
                    if (stillBooked) {
                        row = obj.updateRow(row);
                        self.tvBooked.updateRow(i, row);
                    } else {
                        // The article is not booked anymore
                        self.tvBooked.deleteRow(i);
                        row = obj.createTableRow();
                        self.tvSearch.appendRow(row);
                    }
                }
            }
            self.updateBadges();
        }
        self.tvBooked.finishLayout();
    };
   // Creates the timer
    timer = setInterval(self.updateAllRows, 1000);
    
    self.addEventListener('open', self.getAllObjects);
    self.addEventListener('open', self.getAllRewards);
    
    // To hear the sound
    self.addEventListener('open', ApplicationTabGroup.startSonic); 
   
    self.addEventListener('focus', ApplicationTabGroup.startSonic); 
     
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
