/***
|Name|SaveAsPlugin|
|Source|http://www.TiddlyTools.com/#SaveAsPlugin|
|Documentation|http://www.TiddlyTools.com/#SaveAsPluginInfo|
|Version|2.2.1|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides||
|Description|Save current document to a different path/filename|
This plugin automatically adds a 'save as' command to the TiddlyWiki 'backstage' menu that allows you to quickly create an exact copy of the current TiddlyWiki document.  The plugin also defines a macro that you can use to place a "save as..." command link into your sidebar/mainmenu/any tiddler (or wherever you like).
>//Note: This plugin now supersedes [[NewDocumentPlugin]], which has been retired and is no longer being distributed.  In addition, the HTML+CSS "snapshot" functionality previous provided by that plugin has been moved to a separate plugin.  Please see [[SnapshotPlugin]] for additional information.//
!!!!!Documentation
<<<
see [[SaveAsPluginInfo]]
<<<
!!!!!Revisions
<<<
2008.09.06 [2.2.1] corrected handling of autoopen attribute so it only applies when "open" param is specified
| Please see [[SaveAsPluginInfo]] for additional revision details |
2006.02.03 [1.0.0] Created.
<<<
!!!!!Code
***/
//{{{
version.extensions.SaveAsPlugin= {major: 2, minor: 2, revision: 1, date: new Date(2008,9,6)};

config.macros.saveAs = {
	label: "save as...",
	labelparam: "label:",
	prompt: "Save current document to a different path/file",
	promptparam: "prompt:",
	filePrompt: "Please select or enter a target path/filename",
	defaultFilename: "new.html",
	quietparam: "quiet",
	openparam: "open",
	askParam: "ask",
	askMsg: "Enter a tag filter (use * for all tiddlers, 'none' for blank document)",
	emptyParam: "none",
	confirmMsg: "Found %0 tiddlers matching\n\n'%1'\n\nPress OK to proceed",
	okmsg: "%0 tiddlers written to %1",
	failmsg: "An error occurred while creating %1",
	filter: "",
	handler: function(place,macroName,params) {
		if (params[0] && params[0].substr(0,this.labelparam.length)==this.labelparam)
			var label=params.shift().substr(this.labelparam.length)
		if (params[0] && params[0].substr(0,this.promptparam.length)==this.promptparam)
			var prompt=params.shift().substr(this.promptparam.length)
		var btn=createTiddlyButton(place,label||this.label,prompt||this.prompt,
			function(){config.macros.saveAs.go(
				this.getAttribute('filter'),
				this.getAttribute('quiet')=="true",
				this.getAttribute('autoopen')=="true")}
		);
		var quiet=(params[0] && params[0]==this.quietparam); if (quiet) params.shift();
		var autoopen=(params[0] && params[0]==this.openparam); if (autoopen) params.shift();
		btn.setAttribute("quiet",quiet?"true":"false");
		btn.setAttribute("autoopen",autoopen?"true":"false");
		btn.setAttribute("filter",params.join(" "));
	},
	go: function(filter,quiet,autoopen) {
		var cm=config.messages; // abbreviation
		var cms=config.macros.saveAs; // abbreviation
		if (window.location.protocol!="file:") // make sure we are local
			{ displayMessage(cm.notFileUrlError); return; }
		var currPath=getLocalPath(window.location.href);
		var original=loadFile(currPath);
		if (!original) // if current file not loaded
			{ displayMessage(cm.cantSaveError); return; }
		if (!locateStoreArea(original)) // make sure it is a valid TW document
			{ displayMessage(cm.invalidFileError.format([currPath])); return; }
		// get tidders, assemble revised document and write target
		var tids=cms.selectTiddlers(filter);
		if (tids===false) return; // cancelled by user
		if (cms.filter!=cms.emptyParam && cms.filter.length && !quiet)
			if (!confirm(cms.confirmMsg.format([tids.length,cms.filter]))) return;
		var target=cms.getTarget();
		if (!target) return; // cancelled by user
		var revised=cms.assemble(original,tids);
		var link="file:///"+target.replace(/\\/g,'/');
		var ok=saveFile(target,revised);
		clearMessage();
		displayMessage((ok?cms.okmsg:cms.failmsg).format([tids.length,target]),link);
		if (ok && autoopen) { var w=window.open(link); w.focus(); }
	},
	selectTiddlers: function(filter) {
		var cms=config.macros.saveAs; // abbreviation
		cms.filter=filter||"";
		if (filter==cms.emptyParam) return [];
		if (!filter||!filter.length) return store.getTiddlers("title");
		// get filtered tiddlers
		if (filter==config.macros.saveAs.askParam) {
			filter=prompt(config.macros.saveAs.askMsg,"");
			if (!filter) return false;  // cancelled by user
			cms.filter=filter=="*"?"":filter;
			if (filter=="*") return store.getTiddlers("title");
		}
		return store.filterTiddlers("[tag["+filter+"]]");
	},
	assemble: function(original,tids) {
		var divs=[]; for (var i=0; i<tids.length; i++)
			divs.push(store.getSaver().externalizeTiddler(store,tids[i]));
		var divs=divs.join("\n");
		var posDiv = locateStoreArea(original);
		var revised = original.substr(0,posDiv[0]+startSaveArea.length)+"\n"
			+convertUnicodeToUTF8(divs)+"\n"+original.substr(posDiv[1]);
		var newSiteTitle = convertUnicodeToUTF8(getPageTitle()).htmlEncode();
		revised = revised.replaceChunk("<title"+">","</title"+">"," " + newSiteTitle + " ");
		revised = updateLanguageAttribute(revised);
		// reset all MARKUP blocks
		revised = updateMarkupBlock(revised,"PRE-HEAD");
		revised = updateMarkupBlock(revised,"POST-HEAD");
		revised = updateMarkupBlock(revised,"PRE-BODY");
		revised = updateMarkupBlock(revised,"POST-SCRIPT");
		return revised;
	},
	getTarget: function() {
		var cms=config.macros.saveAs; // abbreviation
		// get new target path/filename
		var newPath=getLocalPath(window.location.href);
		var slashpos=newPath.lastIndexOf("/"); if (slashpos==-1) slashpos=newPath.lastIndexOf("\\"); 
		if (slashpos!=-1) newPath=newPath.substr(0,slashpos+1); // trim filename
		var target=cms.askForFilename(cms.filePrompt,newPath,cms.defaultFilename);
		if (!target) return; // cancelled by user
		// if specified file does not include a path, assemble fully qualified path and filename
		var slashpos=target.lastIndexOf("/"); if (slashpos==-1) slashpos=target.lastIndexOf("\\");
		if (slashpos==-1) target=target+cms.defaultFilename;
		return target;
	},
	askForFilename: function(msg,path,file) {
		if(window.Components) { // moz
			try {
				netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
				var nsIFilePicker = window.Components.interfaces.nsIFilePicker;
				var picker = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
				picker.init(window, msg, nsIFilePicker.modeSave);
				var thispath = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
				thispath.initWithPath(path);
				picker.displayDirectory=thispath;
				picker.defaultExtension='html';
				picker.defaultString=file;
				picker.appendFilters(nsIFilePicker.filterAll|nsIFilePicker.filterText|nsIFilePicker.filterHTML);
				if (picker.show()!=nsIFilePicker.returnCancel) var result=picker.file.persistentDescriptor;
			}
			catch(e) { alert('error during local file access: '+e.toString()) }
		}
		else { // IE
			try { // XP/Vista only
				var s = new ActiveXObject('UserAccounts.CommonDialog');
				s.Filter='All files|*.*|Text files|*.txt|HTML files|*.htm;*.html|';
				s.FilterIndex=3; // default to HTML files;
				s.InitialDir=path;
				s.FileName=file;
				if (s.showOpen()) var result=s.FileName;
			}
			catch(e) { var result=prompt(msg,path+file); } // fallback for non-XP IE
		}
		return result;
	}
};
//}}}
//{{{
// automatically add saveAs to backstage
config.tasks.saveAs = {
	text: "saveAs",
	tooltip: config.macros.saveAs.prompt,
	action: function(){ clearMessage(); config.macros.saveAs.go(); }
}
config.backstageTasks.splice(config.backstageTasks.indexOf("save")+1,0,"saveAs");
//}}}