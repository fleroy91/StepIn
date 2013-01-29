/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true */
var Win, actIndicator = null;
Win = Ti.UI.createWindow({
    width : '100%',
    height : '100%',
    statusBarHidden : false,
    backgroundImage : "Default.png"
});

actIndicator = Titanium.UI.createActivityIndicator({
    style : Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
    font : {
        fontFamily : 'Helvetica Neue',
        fontSize : 15,
        fontWeight : 'bold'
    },
    color : 'black',
    textAlign : 'center'
});

function SplachSpinner() {'use strict';
    return this;
}

SplachSpinner.show = function() {'use strict';
    Win.add(actIndicator);
    actIndicator.show();
    Win.open();
    Ti.App.Properties.setString('openSpinner', 'opening');
};

SplachSpinner.hide = function() {'use strict';
    actIndicator.hide();
    Win.remove(actIndicator);
    Win.close();
    Win = null;
    actIndicator = null;
    Ti.App.Properties.removeProperty('openSpinner');
};

module.exports = SplachSpinner;
