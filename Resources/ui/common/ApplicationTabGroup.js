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
var Spinner = require("etc/AppSpinner");
var Tools = require("etc/Tools");
var Image = require("etc/AppImage");

var self, messageWin, messageView, messageLabel, displayNewPoints = false, rewardWindow = null;
var _allWindows = [];
var _allPresents = null;
var _prevPresents = [];
var _nextPresent = null;

/**
 * Override a tab group's tab bar on iOS.
 *
 * NOTE: Call this function on a tabGroup AFTER you have added all of your tabs to it! We'll look at the tabs that exist
 * to generate the overriding tab bar view. If your tabs change, call this function again and we'll update the display.
 *
 * @param tabGroup The tab group to override
 * @param backgroundOptions The options for the background view; use properties like backgroundColor, or backgroundImage.
 * @param selectedOptions The options for a selected tab button.
 * @param deselectedOptions The options for a deselected tab button.
 */
function overrideTabs(tabGroup, backgroundOptions, selectedOptions, deselectedOptions) { 'use strict';

    // are we restyling the tab groups?
    if (tabGroup.overrideTabs) {
        tabGroup.remove(tabGroup.overrideTabs);
    }

    // a bunch of our options need to default to 0 for everything to position correctly; we'll do it en mass:
    deselectedOptions.top = deselectedOptions.bottom = selectedOptions.top = selectedOptions.bottom = backgroundOptions.left
            = backgroundOptions.right = backgroundOptions.bottom = 0;

    // create the overriding tab bar using the passed in background options
    backgroundOptions.height = 50;
    var background = Ti.UI.createView(backgroundOptions);

    // and create our individual tab buttons
    var activeTab = null, increment = 100 / tabGroup.tabs.length;
    deselectedOptions.width = selectedOptions.width = String(increment) + '%';
    
    function setOverride(tab, i) {
        selectedOptions.left = deselectedOptions.left = String(increment * i) + '%';

        // set the title of the button to be the title of the tab
        selectedOptions.title = deselectedOptions.title = tab.title;
        
        tab.selected = Ti.UI.createButton(selectedOptions);
        tab.deselected = Ti.UI.createButton(deselectedOptions);
        tab.deselected.addEventListener('click', function() {
            if (activeTab) {
                activeTab.selected.visible = false;
            }
            tab.selected.visible = true;
            activeTab = tab;
            tabGroup.setActiveTab(i);
        });
        tab.selected.visible = false;
        background.add(tab.deselected);
        background.add(tab.selected);
    }
    
    var i, l = tabGroup.tabs.length;
    for (i = 0; i < l; i++) {
        var tab = tabGroup.tabs[i];
        setOverride(tab, i);
    }

    tabGroup.add(background);
    tabGroup.overrideTabs = background;

    // "click" the first tab to get things started
    tabGroup.tabs[0].deselected.fireEvent('click');
}


function ApplicationTabGroup() { 'use strict';

    var Shop = require("/model/Shop"),
       shop = Shop.getCurrentShop();
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
    
    self = Titanium.UI.createTabGroup({
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
    var winMorePoints = new MorePointsWindow(self);
    var tabMorePoints = Ti.UI.createTab({
        title : "Plus de steps",
        icon : '/images/Sin-plus-pts.png',
        window : winMorePoints
    });
    winMorePoints.containingTab = tabMorePoints;
    Spinner.add(winMorePoints);
    self.tabMorePoints = tabMorePoints;
    self.tvMorePoints = winMorePoints.tv;
    tabMorePoints.tv = winMorePoints.tv;

	var PresentListWindow = require('ui/common/PresentListWindow');
	var winPresents = new PresentListWindow(self);
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
        var row = obj.createTableRow(self);
        self.tvSearch.appendRow(row, {animated: true});
        if(self.activeTab.tv) {
            self.activeTab.tv.fireEvent('app:endReloading');
        }
    };
    
    /**
     * Find the 2 previous earned presents + the next one
     */ 
    var _prevUser = null;
    var _prevPoints = 0;
    function updatePresents() {
        var user = AppUser.getCurrentUser();
        var points = user.getTotalPoints() || 0;
        
        // We store the current user to not compute it every time
        if(_allPresents && (! _prevUser || _prevUser.m_url !== user.m_url || _prevPoints !== points)) {
            var i;
            _nextPresent = null;
            _prevPresents = [];
            for(i = 0; !_nextPresent && i < _allPresents.length; i ++) {
                var present = _allPresents[i];
                if(present.points <= points) {
                    _prevPresents.push(present);
                } else {
                    _nextPresent = present;
                }
            }
            _prevPoints = points;
            _prevUser = user;
        }
    }
    
    function displayPresentsExample() {
        updatePresents();
        var SmallPresentWindow = require("/ui/common/SmallPresentWindow"),
            swin = new SmallPresentWindow(_prevPresents, _nextPresent, self);
        swin.open();
    }
    
    self.createPointsButton = function() {
        // We change the titleControl of the current window
        var points = user.getTotalPoints() || 0;
        var maxWidth = 80;
        var viewWidth = maxWidth - 21;
        var w = Math.round(((points % 2000) + 1) / 2000 * viewWidth);
        var enclosingView = Ti.UI.createView({
            right : 10,
            height : 30,
            width : maxWidth
        });
        var view = Ti.UI.createView({
            left : 0,
            height : 16,
            width : viewWidth,
            borderRadius : 4,
            borderColor : Ti.App.PinkColor,
            borderWidth : 1
        });
        enclosingView.add(view);
        var backView = Ti.UI.createView({
            width : w,
            left:0,
            height : view.height,
            backgroundColor : Ti.App.PinkColor,
            borderRadius : view.borderRadius,
            borderWidth : 0
        });
        view.add(backView);
        var lblIn = Image.createStepInStar({
            right : 0,
            height : 25,
            width : 20,
            bottom : 4,
            image : "images/present.png"
        });
        enclosingView.add(lblIn);
        var lblPoints = Ti.UI.createLabel({
            text : points,
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            right : 4,
            font:{fontSize : 12, fontWeight : 'bold'},
            color : 'gray'
        });
        view.add(lblPoints);
        enclosingView.addEventListener('click', function(e) {
            displayPresentsExample(); 
        });
        enclosingView.setPoints = function(p, animated) {
            p = p || 0;
            var bmin = 0;
            if(_prevPresents.length > 0) {
                bmin = _prevPresents[_prevPresents.length-1].points;
            }
            var bmax = 2000;
            if(_nextPresent) {
                bmax = _nextPresent.points;
            }
            lblPoints.setText(p);
            var w = Math.round((p - bmin) / (bmax - bmin) * viewWidth);
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
        win.addEventListener('blur', function(e) {
            Spinner.hide(win);
        });
        win.barImage = '/images/topbar-stepin.png';
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
            var points = user.getTotalPoints() || 0;
            win.btPoints.setPoints(points || 0, animated);
        }
    };
    
    self.updateTitle = function(win, animated) {
        updatePresents();
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
        _allPresents = allPresents;
        if(allPresents) {
            winPresents.setPresents(allPresents);
        }
        self.updateTitle(self.activeTab.window);
        if(self.activeTab.tv) {
            self.activeTab.tv.fireEvent('app:endReloading');
        }
    };
    
    self.addNewReward = function(rew, func) {
        // We display the screen but we need to compute the next actions
        displayNewPoints = true;
        messageLabel.text = null;
        var NewRewardWindow = require("ui/common/NewRewardWindow");
        rewardWindow = new NewRewardWindow(self, rew);
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

    var in_manage_code = false; 
    var allCodes = [];
    self.didHearCode = function(code) {
        if(allCodes.indexOf(code) >= 0) {
            Ti.API.info("Code already heard so ignored : " + code);
        } else if(! in_manage_code){
            in_manage_code = true;
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
                var row = shopFound.createTableRow(self);
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

                self.addNewReward(rew, function(reward) {
                    if(reward) {
                        allCodes.push(code);
                        var newShop = AppUser.getShop(obj_index);
                        newShop.checkin = true;
                        var row = newShop.createTableRow(self);
                        self.tvSearch.updateRow(row_index, row);
                        newShop.saveAll();
                        swin.setObject(newShop);
                    }
                    in_manage_code = false;
                });
            } else {
                in_manage_code = false;
            } 
        } 
    };
    
    self.addEventListener('open', self.getAllPresents);
    self.addEventListener('open', self.getAllObjects);
    
    // To hear the sound
    var UDModule = require('com.ultradata');
    function myStartUD() {
        if(! Tools.isSimulator()) {
            UDModule.StartUD({
                onHear : function(e) {
                    // alert("Hear from UD : " + e);
                    Ti.API.info("Hear from UD : " + e.code);
                    self.didHearCode(e.code);
                }
            });
            Ti.App.Properties.setBool('isUDRunning', true);
            Ti.API.info("==> Lancement de UD");
        }
    }
    function myResumeUD() {
        if(! Ti.App.Properties.getBool('isUDRunning')) {
            UDModule.ResumeUD();
            Ti.App.Properties.setBool('isUDRunning', true);
            Ti.API.info("==> Resume de UD");
        }
    }
    function myPauseUD() {
        if(Ti.App.Properties.getBool('isUDRunning')) {
            UDModule.PauseUD();
            Ti.API.info("==> Pause de UD");
            Ti.App.Properties.setBool('isUDRunning', false);
        }
    }
    
    self.addEventListener('open', myStartUD);
    Ti.App.addEventListener("resumed", myResumeUD);
    Ti.App.addEventListener("paused", myPauseUD);
    // Should never happen
    self.addEventListener('close', function(e) {
        Ti.API.info("****** ERROR : Should never happen !!! *********");
        myPauseUD();
    });
   
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
    
    var count = 0;
    self.updateAllRows = function() {
        Spinner.show();
        var count2 = count;
        count ++ ;
        Ti.API.info("Start updateAllRows : " + count2);
        var section = self.tvSearch.getData(); 
        if(section && section.length > 0) {
            var rows = section[0].getRows();
            if(rows) {
                var i;
                for(i = 0; i < rows.length; i++) {
                    if(rows[i].object_index) {
                        var s = AppUser.getShop(rows[i].object_index);
                        if(s.changed) {
                            var row = s.createTableRow(self);
                            self.tvSearch.updateRow(i, row);
                            s.changed = false;
                            AppUser.updateShop(s);
                        }
                    }
                }
            }
        }
        self.updateTitle();
        Ti.API.info("End updateAllRows : " + count2);
        Spinner.hide();
    };

    function moveNext() {
        winSearch.advertView.moveNext();   
    }
    
    function checkCode() {
        if(Ti.App.Properties.getBool('isUDRunning')) {
            var code = UDModule.getUDCode();
            if(code) {
                self.didHearCode(code);
            }
        }
    }
    setInterval(moveNext, 3000);
    
    setInterval(checkCode, 1000);

	return self;
}

module.exports = ApplicationTabGroup;
