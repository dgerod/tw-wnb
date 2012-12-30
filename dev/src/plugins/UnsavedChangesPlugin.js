/***
|Name|UnsavedChangesPlugin|
|Source|http://www.TiddlyTools.com/#UnsavedChangesPlugin|
|Version|3.3.3|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|show droplist of tiddlers that have changed since the last time the document was saved|
Display a list of tiddlers that have been changed since the last time the document was saved.  The list includes all new/modified tiddlers as well as those changed with "minor edits" enabled and any tiddlers that you import during the session, regardless of their modification date.
!!!!!Usage
<<<
{{{
<<unsavedChanges panel>> or <<unsavedChanges>>
}}}
{{indent{
the ''panel'' keyword displays a 'control panel' interface containing a droplist of unsaved tiddlers and a 'goto' button, along with a command link to 'save changes'.  Depending upon what other plugins are installed, several additional elements will also be displayed: When [[NestedSlidersPlugin]] is installed, the entire control panel is contained within a ''SLIDER''.  When [[LoadTiddlersPlugin]] is installed, a ''REVERT'' button is added.  When [[SaveAsPlugin]] is installed, a ''SAVE AS'' link is added.  When [[UploadPlugin]] is installed, an ''UPLOAD'' (or ''save to web'') link is added.  When [[TrashPlugin]] is installed and there are tiddlers tagged with<<tag Trash>>, an ''EMPTY TRASH'' link is added.
}}}
{{{
<<unsavedChanges list separator>>
}}}
{{indent{
the ''list'' keyword displays a simple space-separated list of unsaved tiddlers without any other command links.  You can specify an optional ''separator'' value that can be used in place of the default space character.  For example, you can specify {{{"<br>"}}} as the separator in order to display each link, one per line.
}}}
{{{
<<unsavedChanges command label tip>>
}}}
{{indent{
the ''command'' keyword displays a single 'command link' that, when clicked, displays a ~TiddlyWiki popup containing the list of unsaved tiddlers, the 'save changes' command and, depending upon what other plugins are installed, additional commands for 'save as', 'upload', and 'empty trash' (similar to the panel display described above).

You can specify optional ''label'' and ''tip'' parameters in the macro to customize the command link text and tooltip.  The default label for the command link is: "There %1 %0 unsaved tiddler%2...", where:
* %0 is automatically replaced with the number of unsaved changes
* %1 is either "is" (if changes=1) or "are" (if changes>1)
* %2 is either blank (if changes=1) or "s" (if changes>1)
resulting in the text: //"There is 1 unsaved tiddler...", "There are 2 unsaved tiddlers...", etc.//
}}}
<<<
!!!!!Examples
<<<
^^//note: the following examples will not display any output unless you have already created/modified tiddlers in the current document.//^^
{{{<<unsavedChanges>>}}}
<<unsavedChanges>>
----
{{{<<unsavedChanges command>>}}}
<<unsavedChanges command>>
----
{{{<<unsavedChanges list>>}}}
<<unsavedChanges list>>
----
{{{<<unsavedChanges list "<br>">>}}}
<<unsavedChanges list "<br>">>
<<<
!!!!!Revisions
<<<
2009.03.02 [3.3.3] fix handling for titles that contain HTML special chars (lt,gt,quot,amp)
2008.09.02 [3.3.2] cleanup popup list output generation and added timestamps/sizes to popup display
2008.08.23 [3.3.1] added optional custom 'label' and 'tip' params to 'command' mode and defined default values for mode, label, tip, and separator as object properties for I18N/L10N-readiness.
2008.08.21 [3.3.0] complete re-write of rendering and refresh processing to support multiple instances and automatic self-refresh (no longer depends upon core refresh notifications)
2008.08.21 [3.2.0] added 'command' option for link+popup as alternative to 'control panel' interface
2008.04.22 [3.1.2] use SaveAsPlugin instead of obsolete NewDocumentPlugin to add "save as" link
2007.12.22 [3.1.1] hijack removeTiddler() instead of low-level deleteTiddler() to correct tracking and refresh handling issues.  in saveTiddler(), check for 'tiddler rename' (title!=newtitle) and adjust list accordingly.
2007.12.21 [3.1.0] added support for {{{<<unsavedChanges list separator>>}}} usage to unsaved tiddlers as a simple list of links, embedded in tiddler content (e.g., [[MainMenu]])
2007.12.20 [3.0.0] rewrite to track ALL changed tiddlers, including imports and minor edits, regardless of saved modification dates.  Also, rewrote display logic to directly refresh macro output instead of triggering a page refresh.  The entire process is MUCH more efficient now.
2007.08.02 [2.0.0] converted from inline script
2007.01.01 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.UnsavedChangesPlugin= {major: 3, minor: 3, revision: 3, date: new Date(2009,3,2)};

config.macros.unsavedChanges = {
	changed: [], // list of currently unsaved tiddler titles
	defMode: "panel",
	defSep: " ",
	defLabel: "There %1 %0 unsaved tiddler%2...",
	defTip: "view a list of unsaved tiddler changes",
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var wrapper=createTiddlyElement(place,"span",null,"unsavedChanges");
		wrapper.setAttribute("mode",params[0]||this.defMode);
		wrapper.setAttribute("sep",params[1]||this.defSep); // for 'list' mode
		wrapper.setAttribute("label",params[1]||this.defLabel); // for 'command' mode
		wrapper.setAttribute("tip",params[2]||this.defTip); // for 'command' mode
		this.render(wrapper);
	},
	render: function(wrapper) {
		removeChildren(wrapper); // make sure its empty
		if (!this.changed.length) return; // no changes = no output
		switch (wrapper.getAttribute("mode")) {
			case "command": this.command(wrapper); break;
			case "list": this.list(wrapper); break;
			case "panel": default: this.panel(wrapper); break;
		}
	},
	refresh: function() {
		var wrappers=document.getElementsByTagName("span");
		for (var w=0; w<wrappers.length; w++)
			if (hasClass(wrappers[w],"unsavedChanges"))
				this.render(wrappers[w]);
	},
	list: function(place) { // show simple list of unsaved tiddlers
		wikify("[["+this.changed.join("]]"+place.getAttribute("sep")+"[[")+"]]",place);
	},
	command: function(place) { // show command link with popup list
		var c=this.changed.length;
		var txt=place.getAttribute("label").format([c,c==1?'is':'are',c==1?'':'s']);
		var tip=place.getAttribute("tip");
		var action=function(ev) { if (!ev) var ev=window.event;
			var p=Popup.create(this); if (!p) return false;
			var d=createTiddlyElement(p,"div");
			d.style.whiteSpace="normal"; d.style.width="auto"; d.style.padding="2px";
			// gather pretty links for changed tiddlers
			var list=[]; var item=" &nbsp;[[%1 - %0 (%2 bytes)|%0]]&nbsp; ";
			for (var i=config.macros.unsavedChanges.changed.length-1; i>=0; i--) {
				var tid=store.getTiddler(config.macros.unsavedChanges.changed[i]);
				if (!tid) continue;
				var when=tid.modified.formatString('YYYY.0MM.0DD 0hh:0mm:0ss');
				list.push(item.format([tid.title,when,tid.text.length]));
			}
			wikify("@@white-space:nowrap;"+list.join("<br>")+"@@",d);
			if (!readOnly) {
				var t="\n----\n";
				t+="@@white-space:nowrap;display:block;text-align:center; &nbsp;";
				t+="<<saveChanges>>";
				t+=config.macros.saveAs?" | <<saveAs>>":"";
				t+=config.macros.upload?" | <<upload>>":"";
				t+=(config.macros.emptyTrash&&store.getTaggedTiddlers("Trash").length)?" | <<emptyTrash>>":"";
				t+="&nbsp; @@";
				wikify(t,d);
			}
			Popup.show();
			ev.cancelBubble=true; if(ev.stopPropagation)ev.stopPropagation();
			return(false);
		}
		createTiddlyButton(place,txt,tip,action,"button");
	},
	panel: function(place) { // show composite droplist+buttons+commands
		// gather changed tiddlers (in reverse order by date - most recent first)
		var tids=[]; for (var i=this.changed.length-1; i>=0; i--)
			{ var t=store.getTiddler(this.changed[i]); if (t) tids.push(t); }
		tids.sort(function(a,b){return a.modified<b.modified?-1:(a.modified==b.modified?0:1);});
		// generate droplist items
 		var list=[]; var item='<option value="%0">%1 - %0 (%2 bytes)</option>';
		for (var i=tids.length-1; i>=0; i--) {
			var when=tids[i].modified.formatString('YYYY.0MM.0DD 0hh:0mm:0ss');
			list.push(item.format([tids[i].title.htmlEncode(),when,tids[i].text.length]));
		}
		// display droplist, buttons, and command links
		var out=''; var c=this.changed.length;
		var NSP=config.formatters.findByField("name","nestedSliders");
		var summary=this.defLabel.format([c,c==1?'is':'are',c==1?'':'s'])
		out+=NSP?'+++(unsaved)['+summary+'|'+this.defTip+']...':(summary+"\n");
		out+='<html><form style="display:inline"><!--\
			--><select size="1" name="list" \
				title="select a tiddler to view" \
				onchange="var v=this.value; if (v.length) story.displayTiddler(null,v);"><!--\
			-->'+list.join('')+'<!--\
			--></select><!--\
			--><input type="button" value="goto" onclick="this.form.list.onchange();">';
		if (config.macros.loadTiddlers)  {
			out+='<input type="button" value="revert" \
				title="import the last saved version of this tiddler" \
				onclick="var v=this.form.list.value; if (!v.length) return; \
					var t=\'<\'+\'<loadTiddlers [[tiddler:\'+v+\']] \'; \
					t+=document.location.href; \
					t+=\' confirm force noreport>\'+\'>\'; \
					var e=document.getElementById(\'executeRevert\'); \
					if (e) e.parentNode.removeChild(e); \
					e=document.createElement(\'span\'); \
					e.id=\'executeRevert\'; \
					wikify(t,e);">';
		}
		out+='</form></html>';
		if (!readOnly) {
			out+='\n{{small nowrap{';
			out+="<<saveChanges>>";
			out+=config.macros.saveAs?" | <<saveAs>>":"";
			out+=config.macros.upload?" | <<upload>>":"";
			out+=(config.macros.emptyTrash&&store.getTaggedTiddlers("Trash").length)?" | <<emptyTrash>>":"";
			out+='}}}';
		}
		out+=NSP?'===':'';
		wikify(out,place);
	}
};

// hijack store.saveTiddler() to track changes to tiddlers
if (store.showUnsaved_saveTiddler==undefined) {
	store.showUnsaved_saveTiddler=store.saveTiddler;
	store.saveTiddler=function(title,newtitle) {
		if (title!=newtitle) {
			var i=config.macros.unsavedChanges.changed.indexOf(title);
			if (i!=-1) config.macros.unsavedChanges.changed.splice(i,1); // remove old from list
                        displayMessage( "'"+title+"' changes to '"+newtitle+"'"); 
		} 
                displayMessage("Unsaved '"+newtitle+"'"); 
		var i=config.macros.unsavedChanges.changed.indexOf(newtitle);
		if (i!=-1) config.macros.unsavedChanges.changed.splice(i,1); // remove new title from list
		config.macros.unsavedChanges.changed.push(newtitle); // add new title to END of list
		var t=this.showUnsaved_saveTiddler.apply(this,arguments);
		if (!this.notificationLevel) config.macros.unsavedChanges.refresh();
		return t;
	}
}

// hijack store.removeTiddler() to track changes to tiddlers
if (store.showUnsaved_removeTiddler==undefined) {
	store.showUnsaved_removeTiddler=store.removeTiddler;
	store.removeTiddler=function(title) {
		var i=config.macros.unsavedChanges.changed.indexOf(title);
		if (i!=-1) config.macros.unsavedChanges.changed.splice(i,1); // remove from list
		this.showUnsaved_removeTiddler.apply(this,arguments);
		if (!this.notificationLevel) config.macros.unsavedChanges.refresh();
	}
}

// hijack store.setDirty() function to reset change list after file save
// note: do NOT hijack the prototype function.  This hijack should only be applied to
// the main 'store' instance only (i.e., don't refresh when loading temporary store
// as part of ImportTiddlers processing)
if (store.showUnsaved_setDirty==undefined) {
	store.showUnsaved_setDirty=store.setDirty;
	store.setDirty = function(flag) {
		var refresh=this.isDirty() && !flag; // 'dirty' to 'clean', force a refresh...
		this.showUnsaved_setDirty.apply(this,arguments); // but change the flag first.
		if (refresh) {
			config.macros.unsavedChanges.changed=[]; // clear changed list
			config.macros.unsavedChanges.refresh();
		}
	}
}
//}}}