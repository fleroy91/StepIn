// 
//  ShopPresentsWindow.js
//  StepInShopApp
//  
//  Created by Fr√©d√©ric Leroy on 2012-09-25.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require("/etc/Image");

function ShopPresentsWindow(args) {'use strict';
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();
        
    var tabGroup = args.tabGroup;

	var self = Ti.UI.createWindow({ 
	    title : 'Les cadeaux !', 
	    backgroundColor : '#f0f0f0'
    });
    
    var sheader = Ti.UI.createView({
        height : 40,
        top : 0,
        backgroundColor : '#d92276'
    });
    var lbl = Ti.UI.createLabel({
        text : "Echangez vos points contre ces cadeaux :",
        top : 2,
        left : 2,
        color : 'white',
        font : {fontSize : '15', fontWeight : 'normal'},
        textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
        height : 40
    });
    sheader.add(lbl);
    self.add(sheader);

    var tv = Ti.UI.createTableView({
        scrollable : true,
        allowsSelection : false,
        top : 40,
        separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.NONE
    });
    
    function createPresentView(present) {
        var isEnabled = (user.getTotalPoints() >= present.points);
        var v = Ti.UI.createView({
            width : '50%',
            height : 170
        });
        
        var img = Image.createImageView('read', present.getPhotoUrl(0), null, { borderWidth : 0,height : 100, width : 100});
        img.top = 2;
        v.add(img);
        
        var lbl1 = Ti.UI.createLabel({
            text : present.title,
            top : 105,
            height : 15,
            color : 'blue',
            font : {fontSize : 11, fontWeight : 'bold'}
        });
        v.add(lbl1);
        
        var lbl2 = Ti.UI.createLabel({
            text : present.points + ' points',
            top : 120,
            height : 15,
            color : 'gray',
            font : {fontSize : 12}
        });
        v.add(lbl2);
        
        var bt = Ti.UI.createButtonBar({
            labels : [{title:(isEnabled ? 'Convertir' : 'Pas assez de points'), enabled : isEnabled}],
            top : 140,
            backgroundColor:'#336699',
            style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
            height:25,
            present : present,
            width : '80%'
        });
        v.add(bt);
        v.bt = bt;
        bt.addEventListener('click', function(e) {
            var dlg = Ti.UI.createAlertDialog({
                title : "Conversion",
                message : "Voulez-vous convertir vos points en ce cadeau ?",
                buttonNames : ['Confirmer', 'Annuler'] 
            });
            dlg.addEventListener('click', function(e) {
                if (e.index === 0) {
                    // We just create a new reward with negative points
                    var Reward = require("/model/Reward"),
                        rew = new Reward();
                    rew.setUser(user);
                    rew.setNbPoints(-1 * present.points);
                    user.setTotalPoints(user.getTotalPoints() - present.points);
                    rew.setActionKind(present.title);
                    rew.create( function(e) {
                        alert("Votre bon cadeau vous sera envoyé par email dans un délai de 15 jours maximum !");
                        self.close();
                    });
                }
            });
            dlg.show();
        });
        return v;
    }
    
    function createRow(presents, index1, index2) {
        var row = Ti.UI.createTableViewRow({
            className : 'presentRow',
            backgroundColor : 'white'
        });
        
        var p1 = presents[index1];
        p1.index = index1;
        var v1 = createPresentView(p1);
        v1.left = 0;
        row.add(v1);
        row.bt1 = v1.bt;
        row.p1 = p1;
        
        if(index2 < presents.length) {
            var p2 = presents[index2];
            p2.index = index2;
            var v2 = createPresentView(p2);
            v2.right = 0;
            row.add(v2);
            row.p2 = p2;
            row.bt2 = v2.bt;
        }
        return row;
    }
    var i, data = [];
    self.setPresents = function(presents) {
        for(i = 0; i < presents.length; i+=2) {
            data.push(createRow(presents, i, i+1));
        }
        tv.setData(data);
    };
    
    self.addEventListener('focus', function(e) {
        var user = AppUser.getCurrentUser();
        var points = user.getTotalPoints();
        for(i = 0; i < data.length; i++) {
            var bt1 = data[i].bt1,
                bt2 = data[i].bt1,
                p1 = data[i].p1,
                p2 = data[i].p2;
            if(p1 && bt1) {
                bt1.setTitle(p1.points <= points ? 'Convertir' : 'Pas assez de points');
                bt1.enabled = p1.points <= points;
            }
            if(p2 && bt2) {
                bt2.setTitle(p2.points <= points ? 'Convertir' : 'Pas assez de points');
                bt2.enabled = p2.points <= points;
            }
        }
    });
    
    self.add(tv);
    
	return self;
}

module.exports = ShopPresentsWindow ;