// 
//  FormWindow.js
//  StepInShopApp
//  
//  Created by Frédéric Leroy on 2012-09-23.
//  Copyright 2012 Frédéric Leroy. All rights reserved.
// 
/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
// Parameters :
// - options : graphical options (like top, height, etc...)
// - object : the object to create or update - we will call save, create, getFormPhotoFields, getFormFields, getField[id], setField[id], validate
// - CRUD : create | update | read 
// object.getPhotoFields will return the list of photo fields (ordered)
// object.getFormFields will return the list of fields to manage (ordered)
// object.getFormFieldOption[id] will return :
// - title (in the label) (if null, NO label)
// - hint
// - [keyboardType]
// - [pickerOptions] : [array of values] --> if picker options, then the text field is not enabled

// WARNING : To be inserted in a scrollable view
var _currentPicker = null;
function FormWindow(win_options, crud, object, tabG, extra) { 'use strict';

    var update = (crud === 'update');
    var create = (crud === 'create');
    var read = (crud === 'read');
    
    var tabGroup = tabG;
    
    var FormView = require("ui/common/FormView"),
        contentView = null;
        
    var win = Ti.UI.createWindow(win_options);
    win.backgroundImage = null;
    win.backgroundColor = 'white';
    win.navBarHidden = false;
    win.currentObject = object;
    win.barImage = '/images/topbar-stepin.png';
    win.barColor = 'black';
    
    var enclosingView = Ti.UI.createView({
        height : Ti.UI.FILL,
        width : Ti.UI.FILL,
        backgroundColor : 'white'
    });
 
    // Tools functions
    win.removePicker = function() {
        if(_currentPicker) {
            win.remove(_currentPicker);
            _currentPicker = null;
        }
    };
    
    win.hideKeyboard = function(e) {
        if (! e.source.picker) {
            win.removePicker();
        }
        contentView.blurTfs();
    };

    win.addPicker = function(e) {
        win.hideKeyboard(e);
        var tf = e.source;
        
        var pcurrentHeight = 280;
        var pdestHeight = 216;
        var ratio = pdestHeight / pcurrentHeight;
        var transformPicker = Titanium.UI.create2DMatrix().scale(ratio);
         
        var pv = Ti.UI.createView({
            height : pdestHeight,
            top : 200,
            backgroundColor : 'gray'
        });
        var picker = Titanium.UI.createPicker({
            selectionIndicator : true,
            top : -25,
            transform:transformPicker
        });
        var poptions = tf.pickerOptions;
        var pdata = [], j = 0, 
            ilen = poptions.length;
        var selectedIndex = null;
        for( j = 0; j < ilen; j++) {
            var t = poptions[j];
            var prow = Ti.UI.createPickerRow({
                title : t
            });
            if (t === tf.value) {
                selectedIndex = j;
            }
            pdata.push(prow);
        }
        picker.add(pdata);
        
        if (selectedIndex) {
            picker.setSelectedRow(0, selectedIndex);
        } else {
            tf.setValue(poptions[0]);
        }
        picker.tf = tf;
        tf.picker = picker;

        picker.addEventListener('change', function(e) {
            e.source.tf.setValue(e.selectedValue[0]);
        });
        pv.add(picker); 
        _currentPicker = pv;
        win.add(pv);
    };
        
    win.closeAfter = function(newObj) {
        win.object = newObj;
        if(win.nav) {
            win.nav.close(win, {animated:true});
        } else {
            win.close({animated:true});
        }
        setTimeout(function(e) {
            if (newObj) {
                newObj.doActionsAfterCrud(tabGroup);
            }
        }, 250);
    };
    
    win.addEventListener('open', function(e) {
        contentView = new FormView(win, crud, win.currentObject, tabG, extra);
        win.add(contentView);
        win.tv = contentView;
    });
    
    if(read) {
        tabGroup.createTitle(win, object.getTitle());
    }
    
    return win;
}

module.exports = FormWindow;