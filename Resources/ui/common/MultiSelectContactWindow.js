// 
//  MultiSelectContactWindow.js
//  StepIn
//  
//  Created by Frederic Leroy on 2012-10-25.
//  Copyright 2012 Frederic Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true, TV : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var Image = require('/etc/AppImage');
var Tools = require('/etc/Tools');

function MultiSelectContactWindow(people, pointsToInvite, pointsIfInviteOk, tabGroup) { 'use strict';
    var self = Ti.UI.createWindow({
        backgroundColor : "#f0f0f0",
        barImage : '/images/topbar.png',
        barColor : 'black'
    });
    
    var points = 0;
    
    function createRow(person) {
        var row = Ti.UI.createTableViewRow({
            height : 75,
            backgroundColor : '#f0f0f0',
            hasCheck : true,
            header : person.header,
            fullName : person.fullName,
            invitation : person.invitation
        });
        
        var img = Ti.UI.createImageView({
            width : 60,
            height : 60,
            borderWidth : 1,
            borderColor : '#9a9a9a',
            left : 8
        });
        row.add(img);
        Image.cacheImage(person.image || person.imageUrl, function(image) {
            img.setImage(Image.squareImage(image, 60));
        });
        
        var lblTitle = Ti.UI.createLabel({
            left : 75,
            top : 8,
            font : {fontSize : 14, fontWeight : 'bold'},
            color : '#2e2e2e',
            text : person.fullName
        });
        row.add(lblTitle);
        
        var lblDetail = Ti.UI.createLabel({
            text : Tools.getEmails(person, 2).join('\n'),
            top : 25,
            left : 75,
            font : {fontSize : 12, fontWeight : 'normal'},
            color : '#9a9a9a'       
        });
        if(person.invitation) {
            row.hasCheck = false;
            lblDetail.color = 'black';
            lblDetail.font = { fontSize : 10};
            var date;
            if(person.invitation.accepted_at) {
                row.backgroundColor = '#a7e59a';
                date = new Date(Date.parse(person.invitation.accepted_at));
                lblDetail.text = "Invitation acceptée le " + Tools.formatDate(date) + ".\n" +
                    "+" + pointsIfInviteOk + " steps gagnés !!!";
            } else {
                row.backgroundColor = '#d9b9c8';
                date = new Date(Date.parse(person.invitation.sent_at));
                lblDetail.text = "Invitation envoyée le " + Tools.formatDate(date) + ".\n" +
                    "En attente de réponse !";
            }
        }
        row.add(lblDetail);
        return row;
    }
        
    var i, data = [], index = [], previousLetter, previousIndex;
    var l;
    for(i = 0; i < people.length; i++) {
        var person = people[i];
        
        var lastName = person.lastName;
        var letter = lastName[0];
        if(i === 0 || previousLetter !== letter) {
            person.header = letter;
            if(index.length > 0) {
                // We need to fill the index with previous letters
                for(l = previousLetter.charCodeAt(0) + 1; l < letter.charCodeAt(0); l ++) {
                    index.push({title:String.fromCharCode(l), index : previousIndex});
                }
            }
            index.push({title:letter, index : i});
            previousIndex = i;
        }
        if(! person.invitation) {
            points += (pointsToInvite + pointsIfInviteOk);
        }
        previousLetter = letter;
        data.push(createRow(person));
    }
    // We complete until Z
    for(l = previousLetter.charCodeAt(0) + 1; l <= "Z".charCodeAt(0); l ++) {
        index.push({title:String.fromCharCode(l), index : previousIndex});
    }
    
    var search = Titanium.UI.createSearchBar();
    var tv = Ti.UI.createTableView({
        allowsSelection : true,
        data : data,
        index : index,
        search : search,
        filterAttribute : 'fullName',
        bottom : 60
    });
    
    var opacView = Ti.UI.createView({
        backgroundColor : 'black',
        opacity : 0.8,
        bottom : 0,
        height : 60,
        zIndex : 1
    });
    self.add(opacView);
    
    var lblDesc = Ti.UI.createLabel({
        text : "Vous êtes sur le point de gagner",
        font : {fontSize : 14, fontWeight : 'bold'},
        color : 'white',
        bottom : 40,
        zIndex : 2
    });
    self.add(lblDesc);
    
    var lblPoints = Image.createPointView(points, 25, 100, null, { bottom : 6, zIndex : 2, shadowOffset : {x:1,y:1}, shadowColor : 'white'});
    self.add(lblPoints);
    
    var btOk = Ti.UI.createButtonBar({
        labels : ["Inviter"],
        backgroundColor : '#d92276',
        color : 'white',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 30
    });
    
    var bb = Ti.UI.createButtonBar({
        labels : ["Tous","Aucun"],
        backgroundColor : 'black',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 30 
    });
    
    function selectRow(row, select) {
        if(! row.invitation) {
            var diff = (select !== row.hasCheck);
            row.hasCheck = select;
            if(diff) {
                points += (select ? 1 : -1) * (pointsToInvite + pointsIfInviteOk);
                lblPoints.setPoints(points);
            }
        }
    }
    
    bb.addEventListener('click', function(e) {
        var select = false;
        if(e.index === 0) {
            select = true;
        }
        var i, sections = tv.getData();
        if(sections && sections.length > 0) {
            var s;
            for(s = 0; s < sections.length; s ++) {
                var rows = sections[s].getRows();
                for(i = 0; rows && i < rows.length; i ++) {
                    selectRow(rows[i], select);
                }
            }
        }
    });
    
    btOk.addEventListener('click', function(e) {
        // We runt through the rows and select only the checked one !
        var selectedPeople = []; 
        var sections = tv.getData();
        if(sections && sections.length > 0) {
            var s;
            for(s = 0; s < sections.length; s ++) {
                var i, rows = sections[s].getRows();
                for(i = 0; rows && i < rows.length; i ++) {
                    if(rows[i].hasCheck && !rows[i].invitation) {
                        selectedPeople.push(people[i]);
                    }
                }
            }
        }
        self.list = selectedPeople;
        self.points = points;
        
        if(selectedPeople.length > 0) {
            var dlg = Ti.UI.createAlertDialog({
                title : "Invitations",
                message : "Vous avez gagné immédiatement " + (selectedPeople.length * pointsToInvite) + " steps !\n" + 
                "Vous pouvez gagner " + (selectedPeople.length * pointsIfInviteOk) + " steps si tous vos amis rejoingnent Step-In !"
            });
            dlg.addEventListener('click', function(e) {
                self.close();
            });
            dlg.show();
        } else {
            alert("Vous n'avez sélectionné aucun contact !");
        }
    });
    
    tv.addEventListener('click', function(e) {
        if(e.rowData) {
            var select = ! e.rowData.hasCheck;
            selectRow(e.rowData, select);
        }
        tv.deselectRow(e.index);
    });
    self.add(tv);
    
    self.addEventListener('focus', function() {
        self.setTitleControl(bb);
        self.setRightNavButton(btOk);
    });
    
    return self;
}

module.exports = MultiSelectContactWindow;
