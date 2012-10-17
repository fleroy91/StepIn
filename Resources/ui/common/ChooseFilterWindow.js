// 
//  ChooseFilterWindow.js
//  StepIn
//  
//  Created by Fr√©d√©ric Leroy on 2012-10-04.
//  Copyright 2012 Fr√©d√©ric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

function ChooseFilterWindow(tags) { 'use strict';
    
    var allTags = tags;
    var self = Ti.UI.createWindow({
        barColor : 'black'
    });
    
    var tv = Ti.UI.createTableView({
        style : Ti.UI.iPhone.TableViewStyle.GROUPED,
        headerTitle : 'Types des boutiques'  
    });
    
    var i, rows = [];
    for(i = 0; i < allTags.length; i++) {
        var tag = allTags[i];
        
        var row = Ti.UI.createTableViewRow({
            className : 'filterRow',
            title : tag.tag,
            index : i,
            hasCheck : tag.value
        });
        rows.push(row);
    }
    tv.setData(rows);
    
    tv.addEventListener('click', function(e)
    {
        // event data
        var index = e.index;
        var section = e.section;
        
        // set current check
        allTags[index].value = ! allTags[index].value;
        section.rows[index].hasCheck = allTags[index].value;
    });    
    self.add(tv);
    
    var okButton = Ti.UI.createButton({
        title : 'Valider'
    });
    
    self.setRightNavButton(okButton);
    okButton.addEventListener('click', function(e) {
        self.tags = allTags;
        self.close({animated:true});         
    });
    
    return self;
}

module.exports = ChooseFilterWindow;
