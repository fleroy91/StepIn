/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true */

function Spinner(){ 'use strict';
    return this;
}

Spinner.add = function(win) { 'use strict';
    var spinner=Ti.UI.createActivityIndicator({
        zIndex : 10,
        style : Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
        font : {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'},
        color : 'white'
        });
    spinner.hide();
    win.spinner = spinner;
};

Spinner.show = function(win) { 'use strict';
    var w = win || Ti.UI.currentWindow;
    if(w && w.spinner) {
        w.setToolbar([w.spinner],{animated:true});
        w.spinner.show();
    }
};

Spinner.hide = function(win) { 'use strict';
    var w = win || Ti.UI.currentWindow;
    if(w && w.spinner) {
        w.spinner.hide();
        w.setToolbar(null,{animated:true});
    }
};

module.exports = Spinner;
