//
//  MorePointsWindow.js
//  StepIn
//
//  Created by Frederic Leroy on 2012-10-09.
//  Copyright 2012 Frederic Leroy. All rights reserved.
//
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/AppImage");
var Tools = require("/etc/Tools");

function MorePointsWindow(tabGroup, options) {'use strict';

    var self = Ti.UI.createWindow({
        barColor : 'black',
        barImage : '/images/topbar-stepin.png'
    });
    var popup = (options && options.popup);
    var pointsToInvite = 10;
    var pointsIfInviteOk = 150;

    var AppUser = require("model/AppUser"), user = AppUser.getCurrentUser();

    var t = null;
    if (popup) {
        t = Ti.UI.create2DMatrix({
            scale : 0
        });
        options.transform = t;
    } else {
        self.setBackgroundColor('#f0f0f0');
    }

    var view = Ti.UI.createView(options);

    function displayNoteAppStore() {
        var now = new Date().getTime();
        var alertDialog = Titanium.UI.createAlertDialog({
            title : 'NOTEZ NOUS',
            message : "Vous aimez cette application.\nNotez là et gagnez 250 steps",
            buttonNames : ['Ne plus me demander', 'Me le rappeler plus tard', 'Noter'],
            cancel : 0
        });
        alertDialog.addEventListener('click', function(evt) {
            switch (evt.index) {
                case 2:
                    Ti.App.Properties.setString('RemindToRate', Number.MAX_VALUE);
                    // NOTE: replace this with your own iTunes link; also, this WON'T WORK IN THE SIMULATOR!
                    if (Ti.Android) {
                        Ti.Platform.openURL('URL TO YOUR APP IN THE GOOGLE MARKETPLACE');
                    } else {
                        Ti.Platform.openURL('URL TO YOUR APP IN THE ITUNES STORE');
                    }
                    // TODO : Give rewards when he come backs even if we don't know that it works
                    break;
                case 1:
                    // "Remind Me Later"? Ok, we'll remind them tomorrow when they launch the app.
                    Ti.App.Properties.setString('RemindToRate', now + (1000 * 60 * 60 * 24));
                    break;
                case 0:
                    Ti.App.Properties.setString('RemindToRate', Number.MAX_VALUE);
                    break;
            }
        });
        Ti.App.fireEvent('EndActivityIndicator');
        alertDialog.show();
    }

    var FB_Listener = null;
    var niceClose;

    function comparePerson(a, b) {
        var ret = Tools.strcmp(a.lastName, b.lastName);
        if (ret === 0) {
            ret = Tools.strcmp(a.firstName, b.firstName);
        }
        return ret;
    }

    function inviteAndGiveReward(list, action_kind, points) {
        if (list && list.length > 0) {
            var AppUser = require("model/AppUser"), user = AppUser.getCurrentUser();
            var Reward = require("model/Reward"), Invitation = require("model/AppInvitation"), rew = new Reward({
                action_kind : action_kind,
                nb_points : points
            });
            rew.setUser(user);

            var i;
            for ( i = 0; i < list.length; i++) {
                var person = list[i];
                var inv = new Invitation({
                    emails : Tools.getEmails(person),
                    facebook_id : person.facebook_id,
                    sent_at : new Date()
                });
                inv.setInviter(user);
                inv.create(AppUser.addInvitation);
            }
            tabGroup.addNewReward(rew);
        }
    }

    function checkLogin(func) {
        if (user.isDummy()) {
            var lblLoginAction = Ti.UI.createLabel({
                text : 'Vous devez avoir un compte pour collecter vos points :',
                font : {
                    fontSize : 19,
                    fontWeight : 'bold'
                },
                top : 0,
                height : 50,
                right : 15,
                left : 15
            });

            // We need to be logged
            var LoginWindow = require("ui/common/LoginWindow"), swin = new LoginWindow(tabGroup, lblLoginAction);

            swin.addEventListener('close', function(e) {
                user = AppUser.getCurrentUser();
                if (! user.isDummy()) {
                    user.retrieveInvitations(func);
                } else {
                    alert("Action impossible si vous n'avez pas de compte !");
                    Ti.App.fireEvent('EndActivityIndicator');
                }
            });

            self.containingTab.open(swin, {
                animated : true
            });
        } else if (func) {
            func();
        }
    }

    function runFBContactQuery() {
        Ti.API.info("FB token = " + Ti.Facebook.getAccessToken());
        Ti.Facebook.requestWithGraphPath('me/friends', {
            fields : 'id,name,last_name,gender,first_name,picture'
        }, 'GET', function(e) {
            if (e.success && e.result) {
                Ti.API.info("FB Result = " + e.result);
                var FBResult = JSON.parse(e.result);
                var people = FBResult.data;

                // We need to translate people in persons !
                var i, persons = [];
                for ( i = 0; i < people.length; i++) {
                    var person = Ti.Contacts.createPerson({
                        firstName : people[i].first_name,
                        lastName : people[i].last_name
                    });
                    if (people[i].email) {
                        person.email = {
                            work : [people[i].email]
                        };
                    }
                    person.imageUrl = (people[i].picture && people[i].picture.data && people[i].picture.data.url);
                    person.facebook_id = people[i].id;
                    person.invitation = user.findInvitation(person);
                    persons.push(person);
                }

                // We need to sort them by last_name
                persons.sort(comparePerson);

                var MultiSelectContactWindow = require("ui/common/MultiSelectContactWindow"), swin = new MultiSelectContactWindow(persons, pointsToInvite, pointsIfInviteOk, tabGroup);
                swin.addEventListener('close', function(e) {
                    if (e.source.list) {
                        var selectedPeople = e.source.list;
                        inviteAndGiveReward(selectedPeople, 'Facebook contacts invitation', (selectedPeople.length * pointsToInvite));
                    }
                });
                niceClose(function() {
                    self.containingTab.open(swin, {
                        animated : true
                    });
                });

                Ti.App.fireEvent('EndActivityIndicator');
            } else {
                alert("Connexion à Facebook impossible. Reessayez plus tard !");
                Ti.App.fireEvent('EndActivityIndicator');
            }
        });
    }

    FB_Listener = function(e) {
        Ti.Facebook.removeEventListener('login', FB_Listener);
        if (e.success) {
            runFBContactQuery();
        } else {
            Ti.App.fireEvent('EndActivityIndicator');
            alert("Connexion à Facebook impossible. Reessayez plus tard !");
        }
    };

    function inviteFBFriends() {
        if (Ti.Facebook.loggedIn) {
            runFBContactQuery();
        } else {
            Ti.Facebook.addEventListener('login', FB_Listener);
            Ti.Facebook.authorize();
        }
    }

    function sub_invitePhoneFriends() {
        var performAddressBookFunction = function() {
            var people = Ti.Contacts.getAllPeople();
            var peopleWithEmails = [];
            var i;
            for ( i = 0; i < people.length; i++) {
                var person = people[i];
                if (Tools.hasEmail(person)) {
                    person.invitation = user.findInvitation(person);
                    peopleWithEmails.push(person);
                }
            }
            // We need to sort them by last_name
            peopleWithEmails.sort(comparePerson);

            var MultiSelectContactWindow = require("ui/common/MultiSelectContactWindow"), swin = new MultiSelectContactWindow(peopleWithEmails, pointsToInvite, pointsIfInviteOk, tabGroup);
            swin.addEventListener('close', function(e) {
                if (e.source.list) {
                    var selectedPeople = e.source.list;
                    inviteAndGiveReward(selectedPeople, 'Phone contacts invitation', (selectedPeople.length * pointsToInvite));
                }
            });
            niceClose(function() {
                self.containingTab.open(swin, {
                    animated : true
                });
                Ti.App.fireEvent('EndActivityIndicator');
            });
        };
        var addressBookDisallowed = function() {
            // TODO : I don't know what to do if the user refuse to access the phone address book !
        };
        if (Ti.Contacts.contactsAuthorization === Ti.Contacts.AUTHORIZATION_AUTHORIZED) {
            performAddressBookFunction();
        } else if (Ti.Contacts.contactsAuthorization === Ti.Contacts.AUTHORIZATION_UNKNOWN) {
            Ti.Contacts.requestAuthorization(function(e) {
                if (e.success) {
                    performAddressBookFunction();
                } else {
                    addressBookDisallowed();
                }
            });
        } else {
            addressBookDisallowed();
        }
    }

    function invitePhoneFriends() {
        checkLogin(sub_invitePhoneFriends);
    }

    function shareTwitter() {
        Ti.App.fireEvent('EndActivityIndicator');
        alert("Not Implemented !");
    }

    function followTwitter() {
        Ti.App.fireEvent('EndActivityIndicator');
        alert("Not Implemented !");
    }

    function likeFacebook() {
        Ti.App.fireEvent('EndActivityIndicator');
        alert("Not Implemented !");
    }

    function readCatalog(params) {
        // we need to open the shop window + the catalog of the shop
        var shop = params && params.shop;
        tabGroup.openShop(shop);
    }

    // FIXME : check if actions are already done by the user !!!! (check rewards)
    var actionsInvite = [{
        title : 'Invitez vos amis Facebook',
        detail : "+10 steps par invitation\n+150 steps par invitation acceptée",
        image : '/images/FB.png',
        points : 150,
        action : inviteFBFriends
    }, {
        title : 'Invitez vos contacts',
        detail : "+10 steps par invitation\n+150 steps par invitation acceptée",
        image : '/images/apple.png',
        points : 150,
        action : invitePhoneFriends
    }, {
        title : 'Partagez sur Twitter',
        detail : "+150 steps pour le premier tweet posté avec la mention #Step-In",
        image : '/images/twitter.png',
        points : 150,
        action : shareTwitter
    }, {
        title : 'Likez sur Facebook',
        detail : "+150 steps pour un like Facebook sur Step-In",
        image : '/images/like.png',
        points : 150,
        action : likeFacebook
    }];

    var i;

    var actionsOthers = [{
        title : "Notez nous sur l'App Store",
        detail : "+250 steps si vous nous notez sur l'AppStore",
        image : '/images/rate.png',
        points : 250,
        action : displayNoteAppStore
    }, {
        title : 'Suivez-nous sur Twitter',
        detail : "+150 steps si vous suivez Step-In sur Twitter",
        image : '/images/follow.png',
        points : 150,
        action : followTwitter
    }];

    var boxHeight = 90;
    var rowHeight = 120;

    function createBox(options) {
        var box = Ti.UI.createView({
            backgroundColor : 'white',
            width : 70,
            height : boxHeight
        });

        var img = Ti.UI.createImageView({
            borderWidth : 0,
            top : 3,
            width : 65,
            height : 65
        });
        box.add(img);

        if (Tools.startsWith(options.image, "http")) {
            Image.loadImage(options.image, function(image) {
                img.setImage(Image.squareImage(image, 65));
            });
        } else {
            img.setImage(options.image);
        }

        function _clickBox(options) {
            return function(e) {
                if (options.detail) {
                    var MorePointsDetailWindow = require("/ui/common/MorePointsDetailWindow"), swin = new MorePointsDetailWindow(tabGroup, options);

                    tabGroup.openWindow(self.containingTab, swin, {
                        animated : true
                    });
                } else {
                    options.action(options.params);
                }
            };
        }


        box.addEventListener('click', _clickBox(options));

        return box;
    }

    function createBigRow(title, actions, points) {
        var row = Ti.UI.createView({
            height : rowHeight,
            width : Ti.UI.FILL
        });

        var internView = Ti.UI.createView({
            left : 5,
            top : 0,
            right : 5,
            bottom : 0,
            borderColor : 'gray',
            borderWidth : 1,
            backgroundColor : 'white',
            shadow : {
                shadowOffset : {
                    x : 2,
                    y : 2
                },
                shadowRadius : 3
            }
        });
        row.add(internView);

        var lblTitle = Ti.UI.createLabel({
            text : title,
            top : 7,
            left : 10,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            font : {
                fontSize : 15,
                fontWeight : 'bold'
            },
            color : Ti.App.PinkColor
        });
        internView.add(lblTitle);

        var views = Ti.UI.createView({
            left : 5,
            height : boxHeight,
            top : 30,
            width : Ti.UI.FILL
        });

        var nleft = 2;
        for ( i = 0; i < actions.length; i++) {
            var box = createBox(actions[i]);
            box.left = nleft;
            views.add(box);
            nleft += box.width + 5;
        }
        internView.add(views);

        var vPoints = Image.createPointView(points, 30, 70, null, {
            ratio : 0.9
        });
        vPoints.right = 10;
        vPoints.top = 0;
        internView.add(vPoints);

        return row;
    }

    var ntop = 2;
    var row1 = createBigRow("Invitez ! Partagez !", actionsInvite, 150);
    row1.top = ntop;
    view.add(row1);
    ntop += 2 * (row1.height + 2);
    var row3 = createBigRow("Gagnez plus de steps !", actionsOthers, 150);
    row3.top = ntop;
    view.add(row3);

    niceClose = function(func) {
        if (popup) {
            var t = Ti.UI.create2DMatrix({
                scale : 0
            });
            var a = Ti.UI.createAnimation({
                transform : t,
                duration : 500
            });
            a.addEventListener('complete', function(e) {
                self.close();
                if (func) {
                    func();
                }
            });
            view.animate(a);
        } else {
            tabGroup.setActiveTab(tabGroup.indexTabMorePoints);
            if (func) {
                func();
            }
        }
    };

    if (popup) {
        var t2 = Ti.UI.create2DMatrix({
            scale : 1
        });
        var a = Ti.UI.createAnimation({
            transform : t2,
            duration : 500
        });
        a.addEventListener('complete', function() {
            tabGroup.setActiveTab(tabGroup.indexTabMorePoints);
            self.close({
                animated : false
            });
        });
        self.addEventListener('open', function() {
            view.animate(a);
        });
    }
    self.add(view);

    var added = false;
    function updateMiddleRow() {
        if (!added) {
            added = true;
            var actionsCatalog = [];
            var shops = AppUser.getAllShops();
            for ( i = 0; shops && i < shops.length; i++) {
                var shop = shops[i];
                if (shop.catalogs && shop.catalogs.length > 0) {
                    var action = {
                        title : shop.getTitle(),
                        image : shop.getPhotoUrl(0),
                        points : shop.getCatalogPoints(),
                        params : {
                            shop : shop
                        },
                        action : readCatalog
                    };
                    actionsCatalog.push(action);
                    /*
                     var j;
                     for(j = 0; j < shop.catalogs.length; j ++) {
                     var catalog = shop.catalogs[j];
                     var action = {
                     title : catalog.name,
                     image : catalog.getPhotoUrl(0),
                     points : shop.getCatalogPoints(),
                     params : {shop:shop, catalogIndex:j},
                     action : readCatalog
                     };
                     actionsCatalog.push(action);
                     }
                     */
                }
            }

            var row2 = createBigRow("Parcourez des catalogues !", actionsCatalog, 150);
            row2.top = row1.top + row1.height + 2;
            view.add(row2);
        }
    }


    self.addEventListener('open', function() {
        updateMiddleRow();
    });

    return self;
}

module.exports = MorePointsWindow; 