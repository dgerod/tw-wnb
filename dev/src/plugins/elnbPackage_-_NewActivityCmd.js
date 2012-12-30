/***
|Name|NewActivityCmd Plugin|
|Package|tw-elnb|
|Description||
|Version|1.0.0|
|Requires||
|Based on|[[AttachFilePlugin|http://www.TiddlyTools.com/#AttachFilePlugin]]|
|Source||
|Author|dieesrod@[[zyzlab|http://zyzlab.dyndns.org]]|
|License||
|Type|plugin|

!!!!!Revisions
<<<
201101.15 [1.0.0] Initial Release
<<<
!!!!!Code
***/
// // version
//{{{
if( !version.extensions.elnb )   
    version.extensions.elnb = {};
    
version.extensions.elnb.NewCmdPlugin = {major: 1, minor: 0, revision: 0, date: new Date(2011,1,5)};

//}}}
//{{{
config.macros.elnbNewActivity = {

    // ---------------------------------------
    // attributes
    // ---------------------------------------

	label: "new activity",
	tooltip: "Create a new activity",
	linkTooltip: "Activity: ",
    
    tagPrefix: '$',
    tags: "@activity",

	titlePrompt: "",
    tagPrompt: "",
	tiddlerErr: "Please enter name",
	tagErr: "Please enter only 1 tag",
	tiddlerFormat: '<<list filter \"[tag[%0]]\">>\n<<autoRefresh>>\n',

    // ---------------------------------------
    // macro handle
    // ---------------------------------------


	handler:
	function(place,macroName,params) 
    {
		if (params && !params[0])
			{ createTiddlyButton(place,this.label,this.tooltip,this.toggleActivityPanel); return; }
		var id=params.shift();
		this.createActivityPanel(place,id+"_activityPanel",params);
		document.getElementById(id+"_activityPanel").style.position="static";
		document.getElementById(id+"_activityPanel").style.display="block";
	},
    
    // ---------------------------------------
    // interface definition
    // ---------------------------------------

	css:
	".activityPanel { display: none; position:absolute; z-index:10; width:35em; right:105%; top:0em;\
		background-color: #eee; color:#000; font-size: 8pt; line-height:110%;\
		border:1px solid black; border-bottom-width: 3px; border-right-width: 3px;\
		padding: 0.5em; margin:0em; -moz-border-radius:1em;-webkit-border-radius:1em; text-align:left }\
	.activityPanel form { display:inline;border:0;padding:0;margin:0; }\
	.activityPanel select { width:99%;margin:0px;font-size:8pt;line-height:110%;}\
	.activityPanel input  { width:98%;padding:0px;margin:0px;font-size:8pt;line-height:110%}\
	.activityPanel textarea { width:98%;margin:0px;height:2em;font-size:8pt;line-height:110%}\
	.activityPanel table { width:100%;border:0;margin:0;padding:0;color:inherit; }\
	.activityPanel tbody, .activityPanel tr, .activityPanel td { border:0;margin:0;padding:0;color:#000; }\
	.activityPanel .box { border:1px solid black; padding:.3em; margin:.3em 0px; background:#f8f8f8; \
		-moz-border-radius:5px;-webkit-border-radius:5px; }\
	.activityPanel .chk { width:auto;border:0; }\
	.activityPanel .btn { width:auto; }\
	.activityPanel .btn2 { width:49%; }\
	",

	html:
	'<form>\
		Create activity\
		<table style="border:0"><tr style="border:0"><td style="border:0;text-align:right;width:1%;white-space:nowrap">\
			Name&nbsp;\
		</td><td style="border:0" colspan=2>\
			<input type=text name="tiddlertitle" size=15 autocomplete=off value="%title%"\
				onkeyup="if (!this.value.length) { this.value=config.macros.elnbNewActivity.titlePrompt; this.select(); }"\
				onfocus="if (!this.value.length) this.value=config.macros.elnbNewActivity.titlePrompt; this.select()" %disabled%>\
		</td></tr><tr style="border:0"><td style="border:0;text-align:right;width:1%;white-space:nowrap">\
			Tag&nbsp;\
		</td><td style="border:0">\
			<input type=text name="tags" size=15 autocomplete=off value="" onfocus="this.select()">\
		</td><td style="border:0"></td></tr>\
        <tr style="border:0"><td style="border:0"></td>\
            <td style="width:40%;text-align:right;border:0">\
			<input type=button class=btn2 value="add"\
				onclick="config.macros.elnbNewActivity.onClickAdd(this)">\
            </td><td style="width:40%;text-align:left;border:0">\
            <input type=button class=btn2 value="close"\
				onclick="var panel=document.getElementById(\'%id%\'); if (panel) panel.parentNode.removeChild(panel);">\
		</td></tr></table>\
        An activity is composed by a name and a tag. <br>\
        The tag must be only 1 word and it is used to link several tiddlers to the activity. And\
        prefix %tagPrefix% will be automatically added to the tag you input.\
	</form>',

	html_bak:
	'<form>\
		Create activity\
		<table style="border:0"><tr style="border:0"><td style="border:0;text-align:right;width:1%;white-space:nowrap">\
			Name&nbsp;\
		</td><td style="border:0" colspan=2>\
			<input type=text name="tiddlertitle" size=15 autocomplete=off value="%title%"\
				onkeyup="if (!this.value.length) { this.value=config.macros.elnbNewActivity.titlePrompt; this.select(); }"\
				onfocus="if (!this.value.length) this.value=config.macros.elnbNewActivity.titlePrompt; this.select()" %disabled%>\
		</td></tr><tr style="border:0"><td style="border:0;text-align:right;width:1%;white-space:nowrap">\
			Tag&nbsp;\
		</td><td style="border:0">\
			<input type=text name="tags" size=15 autocomplete=off value="" onfocus="this.select()">\
		</td><td style="width:40%;text-align:right;border:0">\
			<input type=button class=btn2 value="add"\
				onclick="config.macros.elnbNewActivity.onClickAdd(this)"><!--\
			--><input type=button class=btn2 value="close"\
				onclick="var panel=document.getElementById(\'%id%\'); if (panel) panel.parentNode.removeChild(panel);">\
		</td></tr></table>\
        An activity is composed by a name and a tag <br>\
        The tag must start by $ and it is used to link several tiddlers to the activity.\
	</form>',
    
    // ---------------------------------------
    // functions
    // ---------------------------------------

	createActivityPanel:
	function(place,panel_id,params) 
    {
		if (!panel_id || !panel_id.length) var panel_id="_attachPanel";
            
		// remove existing panel (if any)
		var panel=document.getElementById(panel_id); if (panel) panel.parentNode.removeChild(panel);
		
        // set styles for this panel
		setStylesheet(this.css,"activityPanel");
		
        // create new panel
		var title=""; if (params && params[0]) title=params.shift();
		
 		panel=createTiddlyElement(place,"span",panel_id,"activityPanel",null);

		var html=this.html.replace(/%id%/g,panel_id);
		html=html.replace(/%title%/g,title);
		html=html.replace(/%disabled%/g,title.length?"disabled":"");
		html=html.replace(/%IEdisabled%/g,config.browser.isIE?"disabled":"");

        html=html.replace(/%tagPrefix%/g,this.tagPrefix);
        
		panel.innerHTML=html;
		if (config.browser.isGecko) { // FF3 FIXUP
			document.getElementById("attachSource").style.display="none";
			document.getElementById("attachFixPanel").style.display="block";
		}
		return panel;
	},

	toggleActivityPanel: 
    function (e) 
    {
		if (!e) var e = window.event;
		var parent=resolveTarget(e).parentNode;
		var panel = document.getElementById("_activityPanel");
		if (panel==undefined || panel.parentNode!=parent)
			panel=config.macros.elnbNewActivity.createActivityPanel(parent,"_activityPanel");
		var isOpen = panel.style.display=="block";
		if(config.options.chkAnimate)
			anim.startAnimating(new Slider(panel,!isOpen,e.shiftKey || e.altKey,"none"));
		else
			panel.style.display = isOpen ? "none" : "block" ;
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
		return(false);
	},

	onClickAdd:	
    function (here) 
    {
		clearMessage();
        
		// get input values
		var form = here.form;
		var when = (new Date()).formatString(config.macros.timeline.dateFormat);
		var title = form.tiddlertitle.value;
		var tags = this.tags;
        var tagName = form.tags.value;
	
		// validate activity title
		if (!title || !title.trim().length || title==this.titlePrompt)
			{ form.tiddlertitle.focus(); alert(this.tiddlerErr); return false; }
		// validate activity tag
		if (!tagName || !tagName.trim().length || tagName==this.tagPrompt)
			{ form.tags.focus(); alert(this.tagErr); return false; }		       
		// create activity tiddler
		return this.createActivityTiddler( title,tagName,tags );
	},
    
	createActivityTiddler: 
    function (title, tagName, tags) 
    {		
		var theText = this.tiddlerFormat.format([ this.tagPrefix +	tagName]);        
        store.saveTiddler( title,title,theText,config.options.txtUserName,new Date(),tags );
		
        var panel=document.getElementById("activityPanel"); 
        if (panel) panel.style.display="none";
		
        if (!noshow) 
        { 
            story.displayTiddler(null,title); 
            story.refreshTiddler(title,null,true); 
        }
        
		displayMessage('New activity "'+title+'"');
		return true;
	}
};
//}}}
//{{{
if (window.mozAskForFilename===undefined) { // also defined by CoreTweaks (for ticket #604)
	window.mozAskForFilename=function(msg,path,file,mustExist) {
		if(!window.Components) return false;
		try {
			netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
			var nsIFilePicker = window.Components.interfaces.nsIFilePicker;
			var picker = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
			picker.init(window, msg, mustExist?nsIFilePicker.modeOpen:nsIFilePicker.modeSave);
			var thispath = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			thispath.initWithPath(path);
			picker.displayDirectory=thispath;
			picker.defaultExtension='';
			picker.defaultString=file;
			picker.appendFilters(nsIFilePicker.filterAll|nsIFilePicker.filterText|nsIFilePicker.filterHTML);
			if (picker.show()!=nsIFilePicker.returnCancel)
				var result=picker.file.persistentDescriptor;
		}
		catch(ex) { displayMessage(ex.toString()); }
		return result;
	}
}
//}}}