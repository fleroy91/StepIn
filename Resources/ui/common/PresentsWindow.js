// 
//  ShopPresentsWindow.js
//  StepInShopApp
//  
//  Created by Fr√©d√©ric Leroy on 2012-09-25.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, Geo : true, Image : true, Spinner : true, Tools : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
Ti.include("/etc/image.js");

function ShopPresentsWindow(mainWin) {'use strict';
    var AppUser = require("model/AppUser"),
        user = AppUser.getCurrentUser();

	var self = Ti.UI.createWindow({ 
	    title : 'Les cadeaux !', 
	    backgroundColor : 'white'
    });
    
    var tv = Ti.UI.createTableView({
        scrollable : true,
        allowsSelection : false,
        separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.NONE
    });
    
    // TODO : we need to get back the presents from the cloud
    var presents = [ 
        { title : "Cappucino chez Starbuck", points : 1000, image : 'images/background.png' },
        { title : "Chèque cadeau Amazon de 10€", points : 2000, image : 'images/background.png' },
        { title : "Chèque cadeau Fnac de 10€", points : 2500, image : 'images/background.png' },
        { title : "Chèque cadeau Amazon de 20€", points : 5000, image : 'images/background.png' },
        { title : "Chèque cadeau Amazon de 30€", points : 8000, image : 'images/background.png' },
        { title : "10 places de Ciné Gaumont", points : 8000, image : 'images/background.png' },
        { title : "Tour du monde 5000€", points : 200000, image : 'images/background.png' }
    ]; 
    
    function createPresentView(present) {
        var isEnabled = (mainWin.total_points >= present.points);
        var v = Ti.UI.createView({
            width : '50%',
            height : 170
        });
        
        var img = Image.createImageView('read', present.image, null, { borderWidth : 0,height : 100, width : 100});
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
        bt.addEventListener('click', function(e) {
            var dlg = Ti.UI.createAlertDialog({
                title : "Conversion",
                message : "Voulez-vous convertir vos points en ce cadeau ?\nCette opération est irréversible.",
                buttonNames : ['Confirmer', 'Annuler'] 
            });
            dlg.addEventListener('click', function(e) {
                if (e.index === 0) {
                    // We just create a new reward with negative points
                    var Reward = require("/model/Reward"),
                        rew = new Reward();
                    rew.setUser(user);
                    rew.setNbPoints(-1 * present.points);
                    self.total_points -= present.points;
                    rew.setActionKind(present.title);
                    rew.create(function(newRew) {
                        if(newRew) {
                            var rewrow = newRew.createTableRow();
                            self.rewardsTv.appendRow(rewrow);
                            mainWin.updateTitle(self.total_points);
                            alert("Votre bon cadeau vous sera envoyé par email dans un délai de 15 jours maximum !");
                            self.close();
                        }
                    });
                }
            });
            dlg.show();
        });
        return v;
    }
    
    function createRow(index1, index2) {
        var row = Ti.UI.createTableViewRow({
            backgroundColor : 'white'
        });
        
        var p1 = presents[index1];
        p1.index = index1;
        var v1 = createPresentView(p1);
        v1.left = 0;
        row.add(v1);
        
        if(index2 < presents.length) {
            var p2 = presents[index2];
            p2.index = index2;
            var v2 = createPresentView(p2);
            v2.right = 0;
            row.add(v2);
        }
        return row;
    }
    
    var i, data = [];
    for(i = 0; i < presents.length; i+=2) {
        data.push(createRow(i, i+1));
    }
    tv.setData(data);
    
    self.add(tv);
    
	return self;
}

module.exports = ShopPresentsWindow ;