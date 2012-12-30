/***
|Name|FileDropPlugin|
|Source|http://www.TiddlyTools.com/#FileDropPlugin|
|Version|2.1.4|
|Author|BradleyMeck and Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|drag-and-drop files/directories to create tiddlers|
''requires FireFox or another Mozilla-compatible browser.''
!!!!!Usage
<<<
This plugin automatically creates tiddlers from files that are dropped onto an open TiddlyWiki document.  You can drop multiple selected files and/or folders to create many tiddlers at once.  New tiddler titles are created using the filename of each dropped file (i.e., omitting the path).  If a title is already in use, you are prompted to enter a new title for that file.  If you drop a folder, you will be asked if you want to create a simple 'directory list' of files in a single tiddler or create one tiddler for each file in that folder.  

By default, it is assumed that all dropped files contain text.  However, if [[AttachFilePlugin]], [[AttachFilePluginFormatters]] and [[AttachFileMIMETypes]] are installed, then you can drop ''//binary data files//'' as well as text files.  If the MIME type of a dropped file is not "text/plain", then AttachFilePlugin is used to create an 'attachment' tiddler, rather than creating a simple text tiddler.

When creating text tiddlers, you can embed a //link// to the original external file at the top of the new tiddler, in addition to (or instead of) the text content itself.  The format for this link (see Configuration, below) uses embedded ''//replacement markers//'' that allow you to generate a variety of wiki-formatted output, where:
*%0 = filename (without path)
*%1 = local """file://...""" URL
*%2 = local path and filename (OS-native format)
*%3 = relative path (if subdirectory of current document directory)
*%4 = file size
*%5 = file date
*%6 = current date
*%7 = current ~TiddlyWiki username
*\n = newline
By default, the link format uses the filename (%0) and local URL (%1), enclosed within a //hidden section// syntax, like this:
{{{
/%
!link
[[%0|%1]]
!end
%/
}}}
This permits the link to be embedded along with the text content, without changing the appearance of that content when the tiddler is viewed.  To display the link in your tiddler content, use:
{{{
<<tiddler TiddlerName##link>>
}}}
<<<
!!!!!Configuration
<<<
__FileDropPlugin options:__
<<option chkFileDropContent>>Copy file content into tiddlers if smaller than: <<option txtFileDropDataLimit>> bytes
&nbsp; //(note: excess text content will be truncated, oversized binary files will skipped, 0=no limit)//
<<option chkFileDropLink>>Generate external links to files, using this format:{{editor{<html><nowiki><textarea rows="4" onchange="
config.macros.option.propagateOption('txtFileDropLinkFormat','value',this.value.escapeLineBreaks(),'input');
"></textarea></html><<tiddler {{
	var ta=place.lastChild.getElementsByTagName('textarea')[0];
	var v=config.options.txtFileDropLinkFormat.unescapeLineBreaks();
	ta.value=v;
"";}}>>}}}<<option chkFileDropTrimFilename>>Omit file extensions from tiddler titles
<<option chkFileDropDisplay>>Automatically display newly created tiddlers
Tag newly created tiddlers with: <<option txtFileDropTags>>

__FileDropPlugin+AttachFilePlugin options:__ //(binary file data as encoded 'base64' text)//
<<option chkFileDropAttachLocalLink>> attachment includes reference to local path/filename
>Note: if the plugin does not seem to work, enter ''about:config'' in the Firefox address bar, and make sure that {{{signed.applets.codebase_principal_support}}} is set to ''true''
<<<
!!!!!Examples (custom handler functions)
<<<
Adds a single file with confirmation and prompting for title:
{{{
config.macros.fileDrop.addEventListener('application/x-moz-file',
	function(nsiFile) {
		var msg='You have dropped the file:\n'
			+nsiFile.path+'\n'
			+'onto the page, it will be imported as a tiddler. Is that ok?'
		if(confirm(msg)) {
			var newDate = new Date();
			var title = prompt('what would you like to name the tiddler?');
			store.saveTiddler(title,title,loadFile(nsiFile.path),config.options.txtUserName,newDate,[]);
		}
		return true;
	});
}}}
Adds a single file without confirmation, using path/filename as tiddler title:
{{{
config.macros.fileDrop.addEventListener('application/x-moz-file',
	function(nsiFile) {
		var newDate = new Date();
		store.saveTiddler(nsiFile.path,nsiFile.path,loadFile(nsiFile.path),config.options.txtUserName,newDate,[]);
		story.displayTiddler(null,nsiFile.path)
		return true;
	});
}}}
<<<
!!!!!Revisions
<<<
2010.03.06 2.1.4 added event listener for 'dragover' (for FireFox 3.6+)
2009.10.10 2.1.3 fixed IE code error
2009.10.08 2.1.2 fixed chkFileDropContent bypass handling for binary attachments
2009.10.07 2.1.0 added chkFileDropContent and chkFileDropLink/txtFileDropLinkFormat
2009.08.19 2.0.0 fixed event listener registration for FireFox 3.5+.  Also, merged with FileDropPluginConfig, with code cleanup/reduction
2008.08.11 1.5.1 added chkFileDropAttachLocalLink option to allow suppression of local path/file link
2007.xx.xx *.*.* add suspend/resume of notifications to improve performance when multiple files are handled
2007.01.01 0.9.9 extensions for AttachFilePlugin
2006.11.04 0.1.1 initial release by Bradley Meck
<<<
!!!!!Code
***/
//{{{
version.extensions.FileDropPlugin={major:2, minor:1, revision:4, date: new Date(2010,3,6)};

config.macros.fileDrop = {
	customDropHandlers: [],
	addEventListener: function(paramflavor,func,inFront) {
		var obj={}; obj.flavor=paramflavor; obj.handler=func;
		if (!inFront) this.customDropHandlers.push(obj);
		else this.customDropHandlers.shift(obj);
	},
	dragDropHandler: function(evt) {
		netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
		var dragService = Components.classes['@mozilla.org/widget/dragservice;1'].getService(Components.interfaces.nsIDragService);
		var dragSession = dragService.getCurrentSession();
		var transferObject = Components.classes['@mozilla.org/widget/transferable;1'].createInstance();
		transferObject = transferObject.QueryInterface(Components.interfaces.nsITransferable);
		transferObject.addDataFlavor('application/x-moz-file');
		var numItems = dragSession.numDropItems;
		if (numItems>1) {
			clearMessage();
			displayMessage('Reading '+numItems+' files...');
			store.suspendNotifications();
		}
		for (var i = 0; i < numItems; i++) {
			dragSession.getData(transferObject, i);
			var dataObj = {};
			var dropSizeObj = {};
			for(var ind=0; ind<config.macros.fileDrop.customDropHandlers.length; ind++) {
				var item = config.macros.fileDrop.customDropHandlers[ind];
				if(dragSession.isDataFlavorSupported(item.flavor)) {
					transferObject.getTransferData(item.flavor, dataObj, dropSizeObj);
					var droppedFile = dataObj.value.QueryInterface(Components.interfaces.nsIFile);
					var result = item.handler.call(item,droppedFile);
					evt.stopPropagation();
					evt.preventDefault();
					if (result) break;
				}
			}
		}
		if (numItems>1) {
			store.resumeNotifications();
			store.notifyAll();
			displayMessage(numItems+' files have been processed');
		}
	}
}
//}}}
/***
!!!!!window event handlers
***/
//{{{
if(!window.event) {
	window.addEventListener('dragdrop',	// FireFox3.1-
		config.macros.fileDrop.dragDropHandler, true);
	window.addEventListener('drop',		// FireFox3.5+
		config.macros.fileDrop.dragDropHandler, true);
	window.addEventListener('dragover',	// FireFox3.6+
		function(e){e.stopPropagation();e.preventDefault();}, true); 
}
//}}}
/***
!!!!!handler for files, directories and binary attachments (see [[AttachFilePlugin]])
***/
//{{{
var defaults={
	chkFileDropDisplay:		true,
	chkFileDropTrimFilename:	false,
	chkFileDropContent:		true,
	chkFileDropLink:		true,
	txtFileDropLinkFormat:		'/%\\n!link\\n[[%0|%1]]\\n!end\\n%/',
	txtFileDropDataLimit:		'32768',
	chkFileDropAttachLocalLink:	true,
	txtFileDropTags:		''
};
for (var id in defaults) if (config.options[id]===undefined)
	config.options[id]=defaults[id];

config.macros.fileDrop.addEventListener('application/x-moz-file',function(nsiFile) {
	var co=config.options; // abbrev
	var header='Index of %0\n^^(as of %1)^^\n|!filename| !size | !modified |\n';
	var item='|[[%0|%1]]| %2|%3|\n';
	var footer='Total of %0 bytes in %1 files\n';
	var now=new Date();
	var files=[nsiFile];
	if (nsiFile.isDirectory()) {
		var folder=nsiFile.directoryEntries;
		var files=[];
		while (folder.hasMoreElements()) {
			var f=folder.getNext().QueryInterface(Components.interfaces.nsILocalFile);
			if (f instanceof Components.interfaces.nsILocalFile && !f.isDirectory()) files.push(f);
		}
		var msg=nsiFile.path.replace(/\\/g,'/')+'\n\n';
		msg+='contains '+files.length+' files... ';
		msg+='select OK to attach all files or CANCEL to create a list...';
		if (!confirm(msg)) { // create a list in a tiddler
			var title=nsiFile.leafName; // tiddler name is last directory name in path
			while (title && title.length && store.tiddlerExists(title)) {
				if (confirm(config.messages.overwriteWarning.format([title]))) break;
				title=prompt('Enter a new tiddler title',nsiFile.path.replace(/\\/g,'/'));
			}
			if (!title || !title.length) return true; // cancelled
			var text=header.format([nsiFile.path.replace(/\\/g,'/'),now.toLocaleString()]);
			var total=0;
			for (var i=0; i<files.length; i++) { var f=files[i];
				var name=f.leafName;
				if (co.chkFileDropTrimFilename)
					{ var p=name.split('.'); if (p.length>1) p.pop(); name=p.join('.'); }
				var path='file:///'+f.path.replace(/\\/g,'/');
				var size=f.fileSize; total+=size;
				var when=new Date(f.lastModifiedTime).formatString('YYYY.0MM.0DD 0hh:0mm:0ss');
				text+=item.format([name,path,size,when]);
			}
			text+=footer.format([total,files.length]);
			var newtags=co.txtFileDropTags?co.txtFileDropTags.readBracketedList():[];
			store.saveTiddler(null,title,text,co.txtUserName,now,newtags);
			if (co.chkFileDropDisplay) story.displayTiddler(null,title);
			return true;
		}
	}
	if (files.length>1) store.suspendNotifications();
	for (i=0; i<files.length; i++) {
		var file=files[i];
		if (file.isDirectory()) continue; // skip over nested directories
		var type='text/plain';
		var title=file.leafName; // tiddler name is file name
		if (co.chkFileDropTrimFilename)
			{ var p=title.split('.'); if (p.length>1) p.pop(); title=p.join('.'); }
		var name=file.leafName;
		var path=file.path;
		var url='file:///'+path.replace(/\\/g,'/');
		var size=file.fileSize;
		var when=new Date(file.lastModifiedTime);
		var now=new Date();
		var who=config.options.txtUserName;
		var h=document.location.href;
		var cwd=getLocalPath(decodeURIComponent(h.substr(0,h.lastIndexOf('/')+1)));
		var relpath=path.startsWith(cwd)?'./'+path.substr(cwd.length):path;
		while (title && title.length && store.tiddlerExists(title)) {
			if (confirm(config.messages.overwriteWarning.format([title]))) break;
			title=prompt('Enter a new tiddler title',path.replace(/\\/g,'/'));
		}
		if (!title || !title.length) continue; // cancelled
		if (config.macros.attach) {
			type=config.macros.attach.getMIMEType(name,'');
			if (!type.length)
				type=prompt('Unknown file type.  Enter a MIME type','text/plain');
			if (!type||!type.length) continue; // cancelled
		}
		var newtags=co.txtFileDropTags?co.txtFileDropTags.readBracketedList():[];
		if (type=='text/plain' || !co.chkFileDropContent) {
			var txt=''; var fmt=co.txtFileDropLinkFormat.unescapeLineBreaks();
			if (co.chkFileDropLink) txt+=fmt.format([name,url,path,relpath,size,when,now,who]);
			if (co.chkFileDropContent) {
				var out=loadFile(path); var lim=co.txtFileDropDataLimit;
				txt+=co.txtFileDropDataLimit?out.substr(0,lim):out;
				if (size>lim) txt+='\n----\nfilesize ('+size+')'
					+' is larger than FileDrop limit ('+lim+')...\n'
					+'additional content has been omitted';
			}
			store.saveTiddler(null,title,txt,co.txtUserName,now,newtags);
		} else {
			var embed=co.chkFileDropContent
				&& (!co.txtFileDropDataLimit||size<co.txtFileDropDataLimit);
			newtags.push('@attachment'); newtags.push('excludeMissing');

                        // Copy file to storage

                       storagePath = "D:\\USERS\\escdie\\OMRON\\dwm\\logbook\\tw-elb_dropfile\\data";
                       storageDir = "data";
                       displayMessage( storagePath );
                       
                       filePath = path;
                       displayMessage( filePath );                        

                       /* --- copy file to storage folder --- */

                       // Get a component for the file to copy
                       var aFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                       if( !aFile ) return false;
                       
                       // Get a component for the directory to copy to
                       var aDir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                       if( !aDir ) return false;

                       // Next, assign URLs to the file components
                       aFile.initWithPath( filePath );
                       aDir.initWithPath( storagePath );

                       // Finally, copy the file, without renaming it
                       aFile.copyTo( aDir,null );
                       displayMessage(  aFile.leafName );

                       path = storageDir + "\\" + aFile.leafName;
                       relpath = path;

                        // Call AttachFile Plugin
			config.macros.attach.createAttachmentTiddler( path,
				now.formatString(config.macros.timeline.dateFormat),
				'attached by FileDropPlugin', newtags, title,
				embed, co.chkFileDropAttachLocalLink, false,
				relpath, '', type,!co.chkFileDropDisplay );
		}
		if (co.chkFileDropDisplay) story.displayTiddler(null,title);
	}
	if (files.length>1) { store.resumeNotifications(); store.notifyAll(); }
	return true;
})
//}}}