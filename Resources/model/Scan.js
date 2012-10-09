/*global Ti: true, Titanium : true */
/*jslint nomen: true, evil: false, vars: true, plusplus : true */
var CloudObject = require("model/CloudObject");

function Scan(json) {'use strict';
    CloudObject.call(this);
    
    // -------------------------------------------------------
    // Methods overloaded
    // -------------------------------------------------------
    this.getCloudType = function() {
        return "Scan";    
    };
    this.getEntriesUrl = function() {
        return "/collections/506eec600f660214ae00013a/entries";    
    };
    this.getFormFields = function(read) {
        var data = []; 
        return data;  
    };
    // -------------------------------------------------------
    // My methods
    // -------------------------------------------------------
    this.doActionsAfterCrud = function(tabGroup) {
    };
    
    this.createReadView = function(header, footer) {
        var internBorder = 2;
        var internHeight = 80;
        var labelHeight = Math.round((internHeight - (4 * internBorder)) / 4);
        
        var tv = Ti.UI.createTableView({
            height : 'auto',
            scrollable : true,
            allowsSelection : false,
            footerView : footer,
            headerView : header,
            style : Titanium.UI.iPhone.TableViewStyle.GROUPED
        });
        
        // The description of the article
        var rowSelf = Ti.UI.createTableViewRow({
            height : internHeight,
            object : this
        });
        
        var labelName = Ti.UI.createLabel({
            font : {fontSize: 14, fontWeight : 'bold'},
            color:'#576996',
            text : this.title,
            left : internBorder,
            top : internBorder,
            height : labelHeight
        });
        rowSelf.add(labelName);
    
        var labelDetails = Ti.UI.createLabel({
            color : '#222',
            font : { fontSize : 12, fontWeight : 'normal'},
            text : this.desc,
            height : labelHeight,
            left : labelName.left,
            top : labelName.top + labelName.height + internBorder
        }); 
        rowSelf.add(labelDetails);
        
        var pt = Image.createPointView(this.points, 60, 60);
        pt.right = internBorder;
        rowSelf.add(pt);
        
        tv.setData([rowSelf]);
        
        return tv;
    };

    this.init(json);

    return this;
}

Scan.prototype = CloudObject.prototype;
Scan.prototype.constructor = Scan;

module.exports = Scan;
