/*global Ti: true, Titanium : true, Tools:true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */

function TV() { 'use strict';
    return this;
}

TV.create = function(options, onReload) { 'use strict';

    function formatDate()
    {
        var date = new Date();
        var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
        datestr+=' '+date.getHours()+':'+date.getMinutes();
        return datestr;
    }

    var border = Ti.UI.createView({
        backgroundColor:"#576c89",
        height:2,
        bottom:0
    });
    
    var tableHeader = Ti.UI.createView({
        backgroundColor:"#f0f0f0",
        width:320,
        height:60
    });
    
    // fake it til ya make it..  create a 2 pixel
    // bottom border
    tableHeader.add(border);
    
    var arrow = Ti.UI.createView({
        backgroundImage:"/images/whiteArrow.png",
        width:23,
        height:60,
        bottom:10,
        left:20
    });
    
    var statusLabel = Ti.UI.createLabel({
        text:"Tirer pour rafraichir",
        left:55,
        width:200,
        bottom:30,
        height:"auto",
        color:"#576c89",
        textAlign:"center",
        font:{fontSize:12,fontWeight:"bold"},
        shadowColor:"#999",
        shadowOffset:{x:0,y:1}
    });
    
    var lastUpdatedLabel = Ti.UI.createLabel({
        text:"Actualisé le "+formatDate(),
        left:55,
        width:200,
        bottom:15,
        height:"auto",
        color:"#576c89",
        textAlign:"center",
        font:{fontSize:10},
        shadowColor:"#999",
        shadowOffset:{x:0,y:1}
    });
    
    var actInd = Titanium.UI.createActivityIndicator({
        left:20,
        bottom:13,
        width:30,
        height:30
    });
    
    tableHeader.add(arrow);
    tableHeader.add(statusLabel);
    tableHeader.add(lastUpdatedLabel);
    tableHeader.add(actInd);
    
    var tableView = Ti.UI.createTableView(options);
    tableView.headerPullView = tableHeader;
    tableView.manageScroll = true;
    
    var pulling = false;
    var reloading = false;
    
    function endReloading()
    {
        if(reloading) {    
            // when you're done, just reset
            Ti.API.info("in endReloading !");
            tableView.setContentInsets({top:0},{animated:true});
            reloading = false;
            lastUpdatedLabel.text = "Actualisé le "+formatDate();
            statusLabel.text = "Tirer pour rafraichir...";
            actInd.hide();
            arrow.show();
        }
    }
    
    tableView.addEventListener('app:endReloading', endReloading);
    
    function beginReloading()
    {
        // just mock out the reload
        onReload(endReloading);
    }
    
    var offset = 0;
    tableView.addEventListener('scroll',function(e)
    {
        if(e.source.manageScroll && ! reloading) {
            var t;
            offset = e.contentOffset.y;
            if (offset <= -65.0 && !pulling)
            {
                t = Ti.UI.create2DMatrix();
                t = t.rotate(-180);
                pulling = true;
                arrow.animate({transform:t,duration:180});
                statusLabel.text = "Lâcher pour rafraichir...";
            }
            else if (pulling && offset > -65.0 && offset < 0)
            {
                pulling = false;
                t = Ti.UI.create2DMatrix();
                arrow.animate({transform:t,duration:180});
                statusLabel.text = "Tirer pour rafraichir...";
            }
        }
    });
    
    tableView.addEventListener('dragEnd',function(e)
    {
        if (e.source.manageScroll && pulling && !reloading && offset <= -65.0)
        {
            reloading = true;
            pulling = false;
            arrow.hide();
            actInd.show();
            statusLabel.text = "Chargement...";
            tableView.setContentInsets({top:60},{animated:true});
            arrow.transform=Ti.UI.create2DMatrix();
            beginReloading();
        }
    });
    
    return tableView;
};

module.exports = TV;