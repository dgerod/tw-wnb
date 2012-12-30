/***
|Name|AttachFilePluginFormatters|
|Source|http://www.TiddlyTools.com/#AttachFilePluginFormatters|
|Version|4.0.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1.3|
|Type|plugin|
|Description|run-time library for displaying attachment tiddlers|
Runtime processing for //rendering// attachment tiddlers created by [[AttachFilePlugin]].   Attachment tiddlers are tagged with<<tag @attachment>>and contain binary file content (e.g., jpg, gif, pdf, mp3, etc.) that has been stored directly as base64 text-encoded data or can be loaded from external files stored on a local filesystem or remote web server.  Note: after creating new attachment tiddlers, you can remove [[AttachFilePlugin]], as long as you retain //this// tiddler (so that images can be rendered later on).
!!!!!Formatters
<<<
This plugin extends the behavior of the following TiddlyWiki core "wikify()" formatters:
* embedded images: {{{[img[tooltip|image]]}}}
* linked embedded images: {{{[img[tooltip|image][link]]}}}
* external/"pretty" links: {{{[[label|link]]}}}
''Please refer to AttachFilePlugin (source: http://www.TiddlyTools.com/#AttachFilePlugin) for additional information.''
<<<
!!!!!Revisions
<<<
2009.10.10 [4.0.1] in fileExists(), check for IE to avoid hanging Chrome during startup
2009.06.04 [4.0.0] changed attachment storage format to use //sections// instead of embedded substring markers.
2008.01.08 [*.*.*] plugin size reduction: documentation moved to ...Info
2007.12.04 [*.*.*] update for TW2.3.0: replaced deprecated core functions, regexps, and macros
2007.10.29 [3.7.0] more code reduction: removed upload handling from AttachFilePlugin (saves ~7K!)
2007.10.28 [3.6.0] removed duplicate formatter code from AttachFilePlugin (saves ~10K!) and updated documentation accordingly.  This plugin ([[AttachFilePluginFormatters]]) is now //''required''// in order to display attached images/binary files within tiddler content.
2006.05.20 [3.4.0] through 2007.03.01 [3.5.3] sync with AttachFilePlugin
2006.05.13 [3.2.0] created from AttachFilePlugin v3.2.0
<<<
!!!!!Code
***/
// // version
//{{{
version.extensions.AttachFilePluginFormatters= {major: 4, minor: 0, revision: 1, date: new Date(2009,10,10)};
//}}}

//{{{
if (config.macros.attach==undefined) config.macros.attach= { };
//}}}
//{{{
if (config.macros.attach.isAttachment==undefined) config.macros.attach.isAttachment=function (title) {
	var tiddler = store.getTiddler(title);
	if (tiddler==undefined || tiddler.tags==undefined) return false;
	return (tiddler.tags.indexOf("@attachment")!=-1);
}
//}}}

//{{{
// test for local file existence - returns true/false without visible error display
if (config.macros.attach.fileExists==undefined) config.macros.attach.fileExists=function(f) {
	if(window.Components) { // MOZ
		try { netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); }
		catch(e) { return false; } // security access denied
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		try { file.initWithPath(f); }
		catch(e) { return false; } // invalid directory
		return file.exists();
	}
	else if (config.browser.isIE) { // IE
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		return fso.FileExists(f);
	}
	else return true; // other browsers: assume file exists
}
//}}}

//{{{
if (config.macros.attach.getAttachment==undefined) config.macros.attach.getAttachment=function(title) {

	// extract embedded data, local and remote links (if any)
	var text=store.getTiddlerText(title,'');
	var embedded=store.getTiddlerText(title+'##data','').trim();
	var locallink=store.getTiddlerText(title+'##file','').trim();
	var remotelink=store.getTiddlerText(title+'##url','').trim();

	// backward-compatibility for older attachments (pre 4.0.0)
	var startmarker="---BEGIN_DATA---\n";
	var endmarker="\n---END_DATA---";
	var pos=0; var endpos=0;
	if ((pos=text.indexOf(startmarker))!=-1 && (endpos=text.indexOf(endmarker))!=-1)
		embedded="data:"+(text.substring(pos+startmarker.length,endpos)).replace(/\n/g,'');
	if ((pos=text.indexOf("/%LOCAL_LINK%/"))!=-1)
		locallink=text.substring(text.indexOf("|",pos)+1,text.indexOf("]]",pos));
	if ((pos=text.indexOf("/%REMOTE_LINK%/"))!=-1)
		remotelink=text.substring(text.indexOf("|",pos)+1,text.indexOf("]]",pos));

	// if there is a data: URI defined (not supported by IE)
	if (embedded.length && !config.browser.isIE) return embedded;

	// document is being served remotely... use remote URL (if any)  (avoids security alert)
	if (remotelink.length && document.location.protocol!="file:")
		return remotelink;  

	// local link only... return link without checking file existence (avoids security alert)
	if (locallink.length && !remotelink.length) 
		return locallink; 

	// local link, check for file exist... use local link if found
	if (locallink.length) { 
		locallink=locallink.replace(/^\.[\/\\]/,''); // strip leading './' or '.\' (if any)
		if (this.fileExists(getLocalPath(locallink))) return locallink;
		// maybe local link is relative... add path from current document and try again
		var pathPrefix=document.location.href;  // get current document path and trim off filename
		var slashpos=pathPrefix.lastIndexOf("/"); if (slashpos==-1) slashpos=pathPrefix.lastIndexOf("\\"); 
		if (slashpos!=-1 && slashpos!=pathPrefix.length-1) pathPrefix=pathPrefix.substr(0,slashpos+1);
		if (this.fileExists(getLocalPath(pathPrefix+locallink))) return locallink;
	}

	// no embedded data, no local (or not found), fallback to remote URL (if any)
	if (remotelink.length) return remotelink;

	// attachment URL doesn't resolve, just return input as is
	return title;
}
//}}}
//{{{
if (config.macros.attach.init_formatters==undefined) config.macros.attach.init_formatters=function() {
	if (this.initialized) return;

	// find the formatter for "image" and replace the handler
	for (var i=0; i<config.formatters.length && config.formatters[i].name!="image"; i++);
	if (i<config.formatters.length)	config.formatters[i].handler=function(w) {
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) // Simple bracketted link
			{
			var e = w.output;
			if(lookaheadMatch[5])
				{
				var link = lookaheadMatch[5];
				// ELS -------------
				var external=config.formatterHelpers.isExternalLink(link);
				if (external)
					{
					if (config.macros.attach.isAttachment(link))
						{
						e = createExternalLink(w.output,link);
						e.href=config.macros.attach.getAttachment(link);
						e.title = config.macros.attach.linkTooltip + link;
						}
					else
						e = createExternalLink(w.output,link);
					}
				else 
					e = createTiddlyLink(w.output,link,false,null,w.isStatic);
				// ELS -------------
				addClass(e,"imageLink");
				}
			var img = createTiddlyElement(e,"img");
			if(lookaheadMatch[1])
				img.align = "left";
			else if(lookaheadMatch[2])
				img.align = "right";
			if(lookaheadMatch[3])
				img.title = lookaheadMatch[3];
			img.src = lookaheadMatch[4];
			// ELS -------------
			if (config.macros.attach.isAttachment(lookaheadMatch[4]))
				img.src=config.macros.attach.getAttachment(lookaheadMatch[4]);
			// ELS -------------
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
//}}}
//{{{
	// find the formatter for "prettyLink" and replace the handler
	for (var i=0; i<config.formatters.length && config.formatters[i].name!="prettyLink"; i++);
	if (i<config.formatters.length)	{
		config.formatters[i].handler=function(w) {
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
				var e;
				var text = lookaheadMatch[1];
				if(lookaheadMatch[3]) {
					// Pretty bracketted link
					var link = lookaheadMatch[3];
					if (config.macros.attach.isAttachment(link)) {
						e = createExternalLink(w.output,link);
						e.href=config.macros.attach.getAttachment(link);
						e.title=config.macros.attach.linkTooltip+link;
					}
					else e = (!lookaheadMatch[2] && config.formatterHelpers.isExternalLink(link))
						? createExternalLink(w.output,link)
						: createTiddlyLink(w.output,link,false,null,w.isStatic);
				} else {
					e = createTiddlyLink(w.output,text,false,null,w.isStatic);
				}
				createTiddlyText(e,text);
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	} // if "prettyLink" formatter found
	this.initialized=true;
}
//}}}
//{{{
config.macros.attach.init_formatters(); // load time init
//}}}
//{{{
if (TiddlyWiki.prototype.coreGetRecursiveTiddlerText==undefined) {
	TiddlyWiki.prototype.coreGetRecursiveTiddlerText = TiddlyWiki.prototype.getRecursiveTiddlerText;
	TiddlyWiki.prototype.getRecursiveTiddlerText = function(title,defaultText,depth) {
		return config.macros.attach.isAttachment(title)?
			config.macros.attach.getAttachment(title):this.coreGetRecursiveTiddlerText.apply(this,arguments);
	}
}
//}}}