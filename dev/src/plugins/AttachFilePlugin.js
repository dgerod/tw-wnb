/***
|Name|AttachFilePlugin|
|Source|http://www.TiddlyTools.com/#AttachFilePlugin|
|Documentation|http://www.TiddlyTools.com/#AttachFilePluginInfo|
|Version|4.0.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|AttachFilePluginFormatters, AttachFileMIMETypes|
|Description|Store binary files as base64-encoded tiddlers with fallback links for separate local and/or remote file storage|
Store or link binary files (such as jpg, gif, pdf or even mp3) within your TiddlyWiki document and then use them as images or links from within your tiddler content.
> Important note: As of version 3.6.0, in order to //render// images and other binary attachments created with this plugin, you must also install [[AttachFilePluginFormatters]], which extends the behavior of the TiddlyWiki core formatters for embedded images ({{{[img[tooltip|image]]}}}), linked embedded images ({{{[img[tooltip|image][link]]}}}), and external/"pretty" links ({{{[[label|link]]}}}), so that these formatter will process references to attachment tiddlers as if a normal file reference had been provided. |
!!!!!Documentation
>see [[AttachFilePluginInfo]]
!!!!!Inline interface (live)
>see [[AttachFile]] (shadow tiddler)
><<tiddler AttachFile>>
!!!!!Revisions
<<<
2009.06.04 [4.0.0] changed attachment storage format to use //sections// instead of embedded substring markers.
|please see [[AttachFilePluginInfo]] for additional revision details|
2005.07.20 [1.0.0] Initial Release
<<<
!!!!!Code
***/
// // version
//{{{
version.extensions.AttachFilePlugin= {major: 4, minor: 0, revision: 0, date: new Date(2009,6,4)};

// shadow tiddler
config.shadowTiddlers.AttachFile="<<attach inline>>";

// add 'attach' backstage task (insert before built-in 'importTask')
if (config.tasks) { // for TW2.2b or above
	config.tasks.attachTask = {
		text: "attach",
		tooltip: "Attach a binary file as a tiddler",
		content: "<<attach inline>>"
	}
	config.backstageTasks.splice(config.backstageTasks.indexOf("importTask"),0,"attachTask");
}

config.macros.attach = {
// // lingo
//{{{
	label: "attach file",
	tooltip: "Attach a file to this document",
	linkTooltip: "Attachment: ",

	typeList: "AttachFileMIMETypes",

	titlePrompt: " enter tiddler title...",
	MIMEPrompt: "<option value=''>select MIME type...</option><option value='editlist'>[edit list...]</option>",
	localPrompt: " enter local path/filename...",
	URLPrompt: " enter remote URL...",

	tiddlerErr: "Please enter a tiddler title",
	sourceErr: "Please enter a source path/filename",
	storageErr: "Please select a storage method: embedded, local or remote",
	MIMEErr: "Unrecognized file format.  Please select a MIME type",
	localErr: "Please enter a local path/filename",
	URLErr: "Please enter a remote URL",
	fileErr: "Invalid path/file or file not found",

	tiddlerFormat: '!usage\n{{{%0}}}\n%0\n!notes\n%1\n!type\n%2\n!file\n%3\n!url\n%4\n!data\n%5\n',

//}}}
// // macro definition
//{{{
	handler:
	function(place,macroName,params) {
		if (params && !params[0])
			{ createTiddlyButton(place,this.label,this.tooltip,this.toggleAttachPanel); return; }
		var id=params.shift();
		this.createAttachPanel(place,id+"_attachPanel",params);
		document.getElementById(id+"_attachPanel").style.position="static";
		document.getElementById(id+"_attachPanel").style.display="block";
	},
//}}}
//{{{
	createAttachPanel:
	function(place,panel_id,params) {
		if (!panel_id || !panel_id.length) var panel_id="_attachPanel";
		// remove existing panel (if any)
		var panel=document.getElementById(panel_id); if (panel) panel.parentNode.removeChild(panel);
		// set styles for this panel
		setStylesheet(this.css,"attachPanel");
		// create new panel
		var title=""; if (params && params[0]) title=params.shift();
		var types=this.MIMEPrompt+this.formatListOptions(store.getTiddlerText(this.typeList)); // get MIME types
		panel=createTiddlyElement(place,"span",panel_id,"attachPanel",null);
		var html=this.html.replace(/%id%/g,panel_id);
		html=html.replace(/%title%/g,title);
		html=html.replace(/%disabled%/g,title.length?"disabled":"");
		html=html.replace(/%IEdisabled%/g,config.browser.isIE?"disabled":"");
		html=html.replace(/%types%/g,types);
		panel.innerHTML=html;
		if (config.browser.isGecko) { // FF3 FIXUP
			document.getElementById("attachSource").style.display="none";
			document.getElementById("attachFixPanel").style.display="block";
		}
		return panel;
	},
//}}}
//{{{
	toggleAttachPanel:
	function (e) {
		if (!e) var e = window.event;
		var parent=resolveTarget(e).parentNode;
		var panel = document.getElementById("_attachPanel");
		if (panel==undefined || panel.parentNode!=parent)
			panel=config.macros.attach.createAttachPanel(parent,"_attachPanel");
		var isOpen = panel.style.display=="block";
		if(config.options.chkAnimate)
			anim.startAnimating(new Slider(panel,!isOpen,e.shiftKey || e.altKey,"none"));
		else
			panel.style.display = isOpen ? "none" : "block" ;
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
		return(false);
	},
//}}}
//{{{
	formatListOptions:
	function(text) {
		if (!text || !text.trim().length) return "";
		// get MIME list content from text
		var parts=text.split("\n----\n");
		var out="";
		for (var p=0; p<parts.length; p++) {
			var lines=parts[p].split("\n");
			var label=lines.shift(); // 1st line=display text
			var value=lines.shift(); // 2nd line=item value
			out +='<option value="%1">%0</option>'.format([label,value]);
		}
		return out;
	},
//}}}
// // interface definition
//{{{
	css:
	".attachPanel { display: none; position:absolute; z-index:10; width:35em; right:105%; top:0em;\
		background-color: #eee; color:#000; font-size: 8pt; line-height:110%;\
		border:1px solid black; border-bottom-width: 3px; border-right-width: 3px;\
		padding: 0.5em; margin:0em; -moz-border-radius:1em;-webkit-border-radius:1em; text-align:left }\
	.attachPanel form { display:inline;border:0;padding:0;margin:0; }\
	.attachPanel select { width:99%;margin:0px;font-size:8pt;line-height:110%;}\
	.attachPanel input  { width:98%;padding:0px;margin:0px;font-size:8pt;line-height:110%}\
	.attachPanel textarea { width:98%;margin:0px;height:2em;font-size:8pt;line-height:110%}\
	.attachPanel table { width:100%;border:0;margin:0;padding:0;color:inherit; }\
	.attachPanel tbody, .attachPanel tr, .attachPanel td { border:0;margin:0;padding:0;color:#000; }\
	.attachPanel .box { border:1px solid black; padding:.3em; margin:.3em 0px; background:#f8f8f8; \
		-moz-border-radius:5px;-webkit-border-radius:5px; }\
	.attachPanel .chk { width:auto;border:0; }\
	.attachPanel .btn { width:auto; }\
	.attachPanel .btn2 { width:49%; }\
	",
//}}}
//{{{
	html:
	'<form>\
		attach from source file\
		<input type="file" id="attachSource" name="source" size="56"\
			onChange="config.macros.attach.onChangeSource(this)">\
		<div id="attachFixPanel" style="display:none"><!-- FF3 FIXUP -->\
			<input type="text" id="attachFixSource" style="width:90%"\
				title="Enter a path/file to attach"\
				onChange="config.macros.attach.onChangeSource(this);">\
			<input type="button" style="width:7%" value="..."\
				title="Enter a path/file to attach"\
				onClick="config.macros.attach.askForFilename(document.getElementById(\'attachFixSource\'));">\
		</div><!--end FF3 FIXUP-->\
		<div class="box">\
		<table style="border:0"><tr style="border:0"><td style="border:0;text-align:right;width:1%;white-space:nowrap">\
			embed data <input type=checkbox class=chk name="useData" %IEdisabled% \
				onclick="if (!this.form.MIMEType.value.length)\
					this.form.MIMEType.selectedIndex=this.checked?1:0; ">&nbsp;\
		</td><td style="border:0">\
			<select size=1 name="MIMEType" \
				onchange="this.title=this.value; if (this.value==\'editlist\')\
					{ this.selectedIndex=this.form.useData.checked?1:0; story.displayTiddler(null,config.macros.attach.typeList,2); return; }">\
				<option value=""></option>\
				%types%\
			</select>\
		</td></tr><tr style="border:0"><td style="border:0;text-align:right;width:1%;white-space:nowrap">\
			local link <input type=checkbox class=chk name="useLocal"\
				onclick="this.form.local.value=this.form.local.defaultValue=this.checked?config.macros.attach.localPrompt:\'\';">&nbsp;\
		</td><td style="border:0">\
			<input type=text name="local" size=15 autocomplete=off value=""\
				onchange="this.form.useLocal.checked=this.value.length" \
				onkeyup="this.form.useLocal.checked=this.value.length" \
				onfocus="if (!this.value.length) this.value=config.macros.attach.localPrompt; this.select()">\
		</td></tr><tr style="border:0"><td style="border:0;text-align:right;width:1%;white-space:nowrap">\
			remote link <input type=checkbox class=chk name="useURL"\
				onclick="this.form.URL.value=this.form.URL.defaultValue=this.checked?config.macros.attach.URLPrompt:\'\';\">&nbsp;\
		</td><td style="border:0">\
			<input type=text name="URL" size=15 autocomplete=off value=""\
				onfocus="if (!this.value.length) this.value=config.macros.attach.URLPrompt; this.select()"\
				onchange="this.form.useURL.checked=this.value.length;"\
				onkeyup="this.form.useURL.checked=this.value.length;">\
		</td></tr></table>\
		</div>\
		<table style="border:0"><tr style="border:0"><td style="border:0;text-align:right;vertical-align:top;width:1%;white-space:nowrap">\
			notes&nbsp;\
		</td><td style="border:0" colspan=2>\
			<textarea name="notes" style="width:98%;height:3.5em;margin-bottom:2px"></textarea>\
		</td><tr style="border:0"><td style="border:0;text-align:right;width:1%;white-space:nowrap">\
			attach as&nbsp;\
		</td><td style="border:0" colspan=2>\
			<input type=text name="tiddlertitle" size=15 autocomplete=off value="%title%"\
				onkeyup="if (!this.value.length) { this.value=config.macros.attach.titlePrompt; this.select(); }"\
				onfocus="if (!this.value.length) this.value=config.macros.attach.titlePrompt; this.select()" %disabled%>\
		</td></tr></tr><tr style="border:0"><td style="border:0;text-align:right;width:1%;white-space:nowrap">\
			add tags&nbsp;\
		</td><td style="border:0">\
			<input type=text name="tags" size=15 autocomplete=off value="" onfocus="this.select()">\
		</td><td style="width:40%;text-align:right;border:0">\
			<input type=button class=btn2 value="attach"\
				onclick="config.macros.attach.onClickAttach(this)"><!--\
			--><input type=button class=btn2 value="close"\
				onclick="var panel=document.getElementById(\'%id%\'); if (panel) panel.parentNode.removeChild(panel);">\
		</td></tr></table>\
	</form>',
//}}}
// // control processing
//{{{
	onChangeSource:
	function(here) {
		var form=here.form;
		var list=form.MIMEType;
		var theFilename  = here.value;
		var theExtension = theFilename.substr(theFilename.lastIndexOf('.')).toLowerCase();
		// if theFilename is in current document folder, remove path prefix and use relative reference
		var h=document.location.href; folder=getLocalPath(decodeURIComponent(h.substr(0,h.lastIndexOf("/")+1)));
		if (theFilename.substr(0,folder.length)==folder) theFilename='./'+theFilename.substr(folder.length);
		else theFilename='file:///'+theFilename; // otherwise, use absolute reference
		theFilename=theFilename.replace(/\\/g,"/"); // fixup: change \ to /
		form.useLocal.checked = true;
		form.local.value = theFilename;
		form.useData.checked = !form.useData.disabled;
		list.selectedIndex=1;
		for (var i=0; i<list.options.length; i++) // find matching MIME type
			if (list.options[i].value.indexOf(theExtension)!=-1) { list.selectedIndex = i; break; }
		if (!form.tiddlertitle.disabled)
			form.tiddlertitle.value=theFilename.substr(theFilename.lastIndexOf('/')+1); // get tiddlername from filename
	},
//}}}
//{{{
	onClickAttach:
	function (here) {
		clearMessage();
		// get input values
		var form=here.form;
		var src=form.source; if (config.browser.isGecko) src=document.getElementById("attachFixSource");
		src=src.value!=src.defaultValue?src.value:"";
		var when=(new Date()).formatString(config.macros.timeline.dateFormat);
		var title=form.tiddlertitle.value;
		var local = form.local.value!=form.local.defaultValue?form.local.value:"";
		var url = form.URL.value!=form.URL.defaultValue?form.URL.value:"";
		var notes = form.notes.value;
		var tags = "@attachment excludeMissing "+form.tags.value;
		var useData=form.useData.checked;
		var useLocal=form.useLocal.checked;
		var useURL=form.useURL.checked;
		var mimetype = form.MIMEType.value.length?form.MIMEType.options[form.MIMEType.selectedIndex].text:"";
		// validate checkboxes and get filename
		if (useData) {
			if (src.length) { if (!theLocation) var theLocation=src; }
			else { alert(this.sourceErr); src.focus(); return false; }
		}
		if (useLocal) {
			if (local.length) { if (!theLocation) var theLocation = local; }
			else { alert(this.localErr); form.local.focus(); return false; }
		}
		if (useURL) {
			if (url.length) { if (!theLocation) var theLocation = url; }
			else { alert(this.URLErr); form.URL.focus(); return false; }
		}
		if (!(useData||useLocal||useURL))
			{ form.useData.focus(); alert(this.storageErr); return false; }
		if (!theLocation)
			{ src.focus(); alert(this.sourceErr); return false; }
		if (!title || !title.trim().length || title==this.titlePrompt)
			{ form.tiddlertitle.focus(); alert(this.tiddlerErr); return false; }
		// if not already selected, determine MIME type based on filename extension (if any)
		if (useData && !mimetype.length && theLocation.lastIndexOf('.')!=-1) {
			var theExt = theLocation.substr(theLocation.lastIndexOf('.')).toLowerCase();
			var theList=form.MIMEType;
			for (var i=0; i<theList.options.length; i++)
				if (theList.options[i].value.indexOf(theExt)!=-1)
					{ var mimetype=theList.options[i].text; theList.selectedIndex=i; break; }
		}
		// attach the file
		return this.createAttachmentTiddler(src, when, notes, tags, title,
			useData, useLocal, useURL, local, url, mimetype);
	},
	getMIMEType:
	function(src,def) {
		var ext = src.substr(src.lastIndexOf('.')).toLowerCase();
		var list=store.getTiddlerText(this.typeList);
		if (!list || !list.trim().length) return def;
		// get MIME list content from tiddler
		var parts=list.split("\n----\n");
		for (var p=0; p<parts.length; p++) {
			var lines=parts[p].split("\n");
			var mime=lines.shift(); // 1st line=MIME type
			var match=lines.shift(); // 2nd line=matching extensions
			if (match.indexOf(ext)!=-1) return mime;
		}
		return def;
	},
	createAttachmentTiddler:
	function (src, when, notes, tags, title, useData, useLocal, useURL, local, url, mimetype, noshow) {
		if (useData) { // encode the data
			if (!mimetype.length) {
				alert(this.MIMEErr);
				form.MIMEType.selectedIndex=1; form.MIMEType.focus();
				return false;
			}
			var d = this.readFile(src); if (!d) { return false; }
			displayMessage('encoding '+src);
			var encoded = this.encodeBase64(d);
			displayMessage('file size='+d.length+' bytes, encoded size='+encoded.length+' bytes');
		}
		var usage=(mimetype.substr(0,5)=="image"?'[img[%0]]':'[[%0|%0]]').format([title]);
		var theText=this.tiddlerFormat.format([
			usage, notes.length?notes:'//none//', mimetype,
			useLocal?local.replace(/\\/g,'/'):'', useURL?url:'',
			useData?('data:'+mimetype+';base64,'+encoded):'' ]);
		store.saveTiddler(title,title,theText,config.options.txtUserName,new Date(),tags);
		var panel=document.getElementById("attachPanel"); if (panel) panel.style.display="none";
		if (!noshow) { story.displayTiddler(null,title); story.refreshTiddler(title,null,true); }
		displayMessage('attached "'+title+'"');
		return true;
	},
//}}}
// // base64 conversion
//{{{
	encodeBase64:
	function (d) {
		if (!d) return null;
		// encode as base64
		var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var out="";
		var chr1,chr2,chr3="";
		var enc1,enc2,enc3,enc4="";
		for (var count=0,i=0; i<d.length; ) {
			chr1=d.charCodeAt(i++);
			chr2=d.charCodeAt(i++);
			chr3=d.charCodeAt(i++);
			enc1=chr1 >> 2;
			enc2=((chr1 & 3) << 4) | (chr2 >> 4);
			enc3=((chr2 & 15) << 2) | (chr3 >> 6);
			enc4=chr3 & 63;
			if (isNaN(chr2)) enc3=enc4=64;
			else if (isNaN(chr3)) enc4=64;
			out+=keyStr.charAt(enc1)+keyStr.charAt(enc2)+keyStr.charAt(enc3)+keyStr.charAt(enc4);
			chr1=chr2=chr3=enc1=enc2=enc3=enc4="";
		}
		return out;
	},
	decodeBase64: function(input) {
		var out="";
		var chr1,chr2,chr3;
		var enc1,enc2,enc3,enc4;
		var i = 0;
		// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
		input=input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		do {
			enc1=keyStr.indexOf(input.charAt(i++));
			enc2=keyStr.indexOf(input.charAt(i++));
			enc3=keyStr.indexOf(input.charAt(i++));
			enc4=keyStr.indexOf(input.charAt(i++));
			chr1=(enc1 << 2) | (enc2 >> 4);
			chr2=((enc2 & 15) << 4) | (enc3 >> 2);
			chr3=((enc3 & 3) << 6) | enc4;
			out=out+String.fromCharCode(chr1);
			if (enc3!=64) out=out+String.fromCharCode(chr2);
			if (enc4!=64) out=out+String.fromCharCode(chr3);
		} while (i<input.length);
		return out;
	},
//}}}
// // I/O functions
//{{{
	readFile: // read local BINARY file data
	function(filePath) {
		if(!window.Components) { return null; }
		try { netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); }
		catch(e) { alert("access denied: "+filePath); return null; }
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		try { file.initWithPath(filePath); } catch(e) { alert("cannot read file - invalid path: "+filePath); return null; }
		if (!file.exists()) { alert("cannot read file - not found: "+filePath); return null; }
		var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		inputStream.init(file, 0x01, 00004, null);
		var bInputStream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
		bInputStream.setInputStream(inputStream);
		return(bInputStream.readBytes(inputStream.available()));
	},
//}}}
//{{{
	writeFile:
	function(filepath,data) {
		// TBD: decode base64 and write BINARY data to specified local path/filename
		return(false);
	},
//}}}
//{{{
	askForFilename: // for FF3 fixup
	function(target) {
		var msg=config.messages.selectFile;
		if (target && target.title) msg=target.title; // use target field tooltip (if any) as dialog prompt text
		// get local path for current document
		var path=getLocalPath(document.location.href);
		var p=path.lastIndexOf("/"); if (p==-1) p=path.lastIndexOf("\\"); // Unix or Windows
		if (p!=-1) path=path.substr(0,p+1); // remove filename, leave trailing slash
		var file=""
		var result=window.mozAskForFilename(msg,path,file,true); // FF3 FIXUP ONLY
		if (target && result.length) // set target field and trigger handling
			{ target.value=result; target.onchange(); }
		return result; 
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