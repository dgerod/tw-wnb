/***
|Name|MessageLogPlugin|
|Source|http://www.TiddlyTools.com/#MessageLogPlugin|
|Documentation|http://www.TiddlyTools.com/#MessageLogPlugin|
|Version|1.0.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.4|
|Type|plugin|
|Description|automatically log TW messages to a [[MessageLog]] tiddler|
This plugin uses a tiddler to store the text/link for each message that is displayed during a TiddlyWiki session.
!!!!!Documentation
<<<
By default, messages displayed by TiddlyWiki are not retained once they are dismissed from the display.  This plugin automatically appends each message to a //shadow// tiddler, [[MessageLog]], to provide a short-term, per-session record of messages without altering any 'real' tiddlers in your document.

You can view the [[MessageLog]] tiddler at any time to review the previous messages and, if you convert the shadow tiddler to a 'real' tiddler (by editing it), then any subsequent messages will be added to both that real tiddler and the automatic shadow log.  This real tiddler will, of course, be saved with the rest of your TW document when you save the file, allowing you to keep a persistent, inter-session log rather than a short-term, per-session log.
<<<
!!!!!Configuration
<<<
<<option chkMessageLog>> enable automatic logging of messages in: {{editor{<<option txtMessageLogName>>}}}
Date format (for log entries): {{editor{<<option txtMessageLogDateFormat>>}}}
<<<
!!!!!Revisions
<<<
2008.12.24 [1.0.2] hijack getMessageDiv() to add 'view log' command to message box
2008.12.23 [1.0.1] defined ResetMessageLogCommand section and embedded command in default shadow message log.  Also, prevent refresh of log display if tiddler is currently being edited.
2008.12.23 [1.0.0] initial release
<<<
!!!!!MessageLogControls
<<option chkMessageLog>> enable logging | <html><a href='javascript:;' title='Delete message log tiddler AND clear automatic shadow log' onclick='var log=config.options.txtMessageLogName; if (!confirm(this.title+"?")) return false; config.shadowTiddlers[log]="\<\<tiddler [[MessageLogPlugin##MessageLogControls]]\>\>\n"; store.removeTiddler(log); story.refreshTiddler(log,null,true);'>clear message log</a></html>
!!!!!Code
***/
//{{{
version.extensions.MessageLogPlugin= {major: 1, minor: 0, revision: 2, date: new Date(2008,12,24)};

// SETTINGS
if (config.options.chkMessageLog===undefined)
	config.options.chkMessageLog=true;
if (config.options.txtMessageLogName===undefined)
	config.options.txtMessageLogName='MessageLog';
if (config.options.txtMessageLogDateFormat===undefined)
	config.options.txtMessageLogDateFormat='YYYY.0MM.0DD 0hh:0mm:0ss';

// SHADOW LOG
config.shadowTiddlers[config.options.txtMessageLogName]=
	'<<tiddler [[MessageLogPlugin##MessageLogControls]]>>\n'

if (window.displayMessage_MessageLogHijack===undefined) { // only once
	window.displayMessage_MessageLogHijack=window.displayMessage;
	window.displayMessage=function(text,linkText) {
		this.displayMessage_MessageLogHijack.apply(this,arguments);
		if (!config.options.chkMessageLog) return;
		var log=config.options.txtMessageLogName;
		var fmt='>%0 '+(linkText?'[[%1|%2]]':'%1');
		var now=new Date().formatString(config.options.txtMessageLogDateFormat);
		var cmd='<<tiddler [[MessageLogPlugin##MessageLogControls]]>>\n';
		var out=store.getTiddlerText(log,cmd)+fmt.format([now,text,linkText])+'\n';
		config.shadowTiddlers[log]=out; // update shadow log
		var tid=store.getTiddler(log); if (tid) { // update real tiddler log, if present
			var who=config.options.chkForceMinorUpdate?tid.modifier:config.options.txtUserName;
			var when=config.options.chkForceMinorUpdate?tid.modified:new Date();
			store.saveTiddler(log,log,out,who,when,tid.tags,tid.fields);
		}
		if (!story.isDirty(log)) story.refreshTiddler(log,null,true); // only if log is not being edited
	}
}

if (window.getMessageDiv_MessageLogHijack===undefined) { // only once
	window.getMessageDiv_MessageLogHijack=window.getMessageDiv;
	window.getMessageDiv=function() { // add 'view log' command to message box
		var msgArea=document.getElementById("messageArea"); if(!msgArea) return null;
		var addLogBtn=!msgArea.hasChildNodes();
		var r=this.getMessageDiv_MessageLogHijack.apply(this,arguments);
		if(addLogBtn) {
			createTiddlyText(msgArea.firstChild,'|');
			createTiddlyButton(msgArea.firstChild,'log','view '+config.options.txtMessageLogName,
				function(ev) { story.displayTiddler(null,config.options.txtMessageLogName); });
		}
		return r;
	}
}
//}}}