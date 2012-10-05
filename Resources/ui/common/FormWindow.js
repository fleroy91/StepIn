// 
//  ShopFormWindow.js
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
var _timer = null;
function ShopFormWindow(win_options, crud, object, tabG, extra) { 'use strict';

    var update = (crud === 'update');
    var create = (crud === 'create');
    var read = (crud === 'read');
    
    var tabGroup = tabG;
    
    var ShopFormView = require("ui/common/FormView"),
        contentView = null;
        
    var win = Ti.UI.createWindow(win_options);
    win.backgroundImage = null;
    win.backgroundColor = 'white';
    win.navBarHidden = false;
    win.currentObject = object;
    win.barImage = '/images/bg_gradient.png';
    
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
        
    function getObject(tab, object, incr) {
        var ret = null;
        var section = tab.tv.getData();
        if(section && section.length > 0) {
            var rows = section[0].getRows();
            var index = tabGroup.getIndex(tab.tv, object);
            if(index >= 0 && index + incr >= 0 && index + incr < rows.length) {
                ret = rows[index + incr].object;
            }
        }
        return ret;
    }
    
    win.nextObject = null;
    win.prevObject = null;
    
    win.closeAfter = function(newObj) {
        win.close({animated:true});
        setTimeout(function(e) {
            if (newObj) {
                newObj.doActionsAfterCrud(tabGroup);
            }
        }, 250);
    };
    
    var bNextPrev = Ti.UI.createButtonBar({
        labels : [ 
            {image : '/images/up.png', enabled : (!!win.prevObject)},
            {image : "/images/down.png", enabled : (!!win.nextObject)}
        ],
        backgroundColor : '#ba307c',
        style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
        height : 25
    });
    
    win.computeNextPrevObjects = function() {
        win.setRightNavButton(null);
        if(tabGroup.activeTab && tabGroup.activeTab.tv) {
            win.nextObject = getObject(tabGroup.activeTab, win.currentObject, +1);
            win.prevObject = getObject(tabGroup.activeTab, win.currentObject, -1);
            
            bNextPrev.setLabels([ 
                {image : '/images/up.png', enabled : (!!win.prevObject)}, 
                {image : "/images/down.png", enabled : (!!win.nextObject)}
            ]);
            
            if(win.nextObject || win.prevObject) {
                win.setRightNavButton(bNextPrev);
            }
        }
    };
    
    win.goToObject = function(newObject, incr) {
        if(newObject) {
            var newContent = new ShopFormView(win, crud, newObject, tabG, extra);
            newContent.visible = false;
            var rect = contentView.getRect();
            contentView.height = rect.height;
            contentView.width = rect.width;
            // We create a white view
            var whiteView = Ti.UI.createView({
                height : rect.height,
                width : rect.width,
                left : rect.x,
                top : rect.y,
                backgroundColor : 'white',
                opacity : 0,
                zIndex : 10
            });
            
            enclosingView.add(newContent);
            enclosingView.add(whiteView);
            whiteView.animate({opacity:1, duration : 125}, function(e) {
                newContent.visible = true;
                contentView.visible = false;
                whiteView.animate({opacity:0, duration : 125}, function(e) {
                    enclosingView.remove(whiteView);
                    contentView = newContent;
                    win.tv = contentView;
                    win.currentObject = newObject;
                    // For the timer
                    win.tv.currentObject = newObject;
                    win.computeNextPrevObjects();
                });
            });
        }
    };

    bNextPrev.addEventListener('click', function(e) {
        if(e.index === 0) {
            win.goToObject(win.prevObject, -1);    
        } else if (e.index === 1) {
            win.goToObject(win.nextObject, +1);
        }
    });
    
    // WARNING : this function should be called only for articles
    win.updateView = function(article) {
        // We need to run through all the elements and update them
        if (article && read && contentView) {
            // We compute the new view and we'll copy all items in the current view
            var newContent = new ShopFormView(win, crud, article, tabG, extra);
            newContent.visible = false;
            enclosingView.add(newContent);
            // We wait a little bit before animation
            setTimeout(function(e) {
                newContent.visible = true;                
            }, 250);
            enclosingView.animate({view:newContent,transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT},
                function() {
                    tabGroup.displayMessage();
                    enclosingView.remove(contentView);
                    win.currentObject = article;
                    contentView = newContent;
                    win.tv = newContent;
                    // For the timer
                    win.tv.currentObject = article;
                    Ti.API.info("Timer is running ? : " + (!!_timer));
                     if(_timer) {
                        clearInterval(_timer);
                        _timer = null;
                    }
                    _timer = setInterval(contentView.runTimer, 1000);
            });
        }
    };
    
    win.computeNextPrevObjects();
    contentView = new ShopFormView(win, crud, win.currentObject, tabG, extra);
    enclosingView.add(contentView);
    win.add(enclosingView);
    
    win.tv = contentView;
    
    if(_timer) {
        clearInterval(_timer);
        _timer = null;
    }
    
    win.addEventListener('open', function(e) {
        _timer = setInterval(contentView.runTimer, 1000);
    });
    
    win.addEventListener('close', function(e) {
        clearInterval(_timer);
        _timer = null;    
    });

    function closeWindow(e) {
        //IOS fires with source tabGroup. Android with source tab
        tabG.removeEventListener('focus', closeWindow);
        win.close({animated:false});
    }
    
    tabG.addEventListener('focus', closeWindow);
    
    return win;
}

module.exports = ShopFormWindow;