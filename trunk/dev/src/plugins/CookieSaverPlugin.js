/***
|Name|CookieSaverPlugin|
|Source|http://www.TiddlyTools.com/#CookieSaverPlugin|
|Version|1.1.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|automatically save TiddlyWiki cookie options to [[CookieJar]] tiddler for portable settings|
!!!!!Usage
<<<
Whenever TiddlyWiki option settings are changed, a browser-based cookie value is added, removed, or changed.  Each time this occurs, the CookieSaverPlugin generates an equivalent ''portable cookie'': a single line of javascript code that assigns a stored value directly to the specific TiddlyWiki internal config.options.* variable corresponding to the browser cookie with the same name.

The portable cookies are automatically written into a tiddler named [[CookieJar]] that is tagged with<<tag systemConfig>>so that their values will be applied as soon as the document is saved and reloaded.  You can change or delete an individual portable cookie by editing the contents of the [[CookieJar]] and removing the appropriate line of javascript from the tiddler source code.  Note: editing the portable cookie definitions does not alter the values of any corresponding browser cookies, nor does it update the internal value that is in use within the current TiddlyWiki document session.  Changes made directly to the [[CookieJar]] are only applied after saving and reloading the document.  In any case, whenever a browser cookie value is updated, any modifications you made to the equivalent portable cookie are immediately rewritten to reflect the current browser cookie value.

Browser cookies are, obviously, stored with your browser... and are kept separate from the document itself.  In contrast, because your portable cookies are stored in a [[CookieJar]] within the document, they remain part of that document.

When the document is copied and shared with others, each copy includes the [[CookieJar]] containing //your// stored portable cookies.  Fortunately, CookieSaverPlugin can generate and maintain several separate sets of portable cookies in the same [[CookieJar]] tiddler, where each set is associated with a different TiddlyWiki username.  As long as other readers have not chosen the same username, your portable cookie values will not be automatically applied when they are reading the document.  Rather, as they interact with the document, a new set of portable cookies, associated with //their// username, will be automatically added to the [[CookieJar]].

In addition to tracking and applying separate portable cookies for each user, CookieSaverPlugin can also be configured so that sensitive data (such as internal URLs, email addresses, login IDs and passwords, etc.) will never be inadvertently stored in the [[CookieJar]].  To achieve this, you can selectively prevent specific cookienames from being used as portable cookies by placing a special javascript function definition in a tiddler named [[CookieSaverPluginConfig]], tagged with 'systemConfig':
{{{
config.macros.cookieSaver.allowPortableCookie=function(name){
	if ( ... some test using 'name' ...) return false;
	if ( ... another test with 'name' ...) return true;
	etc.
	return true;  // default=allow
}
}}}
The allowPortableCookie() function offers a flexible method for plugin developers and other technically skilled document authors to implement their own custom-defined, application-specific cookie data protection by applying sophisticated logic for deciding which cookies should be allowed or blocked based on variety of different conditions.  The basic operation of this function is to accept a cookie name as text input, apply some tests based on that cookie name (combined with any other useful criteria), and then return //true// if saving the portable cookie should be permitted, or //false// if the cookie should be excluded from the [[CookieJar]].

Unfortunately, although the technical expertise needed to write this test function is relatively minor, the level of programming ability that is needed can nonetheless be beyond the skills that many people possess.  To help address this, CookieSaverPlugin also supports an alternative syntax that allows you to define a simple array of cookie names that is used by the plugin to automatically block the indicated names from being included as portable cookies in the [[CookieJar]].  The array definition syntax looks like this:
{{{
// define a complete set of blocked cookie names
config.macros.cookieSaver.blockedCookies=['cookie','cookie','cookie',etc...];
}}}
or
{{{
// add individual cookies names to the current set of blocked cookies
config.macros.cookieSaver.blockedCookies.push('cookie');
config.macros.cookieSaver.blockedCookies.push('cookie');
etc...
}}}
Note: the allowPortableCookie() function and the blockedCookies[] array are only used to limit the creation of portable cookies within the [[CookieJar]], and are //not// applied when creating normal browser cookies.  Thus, regardless of whether or not a given portable cookie has been excluded or permitted, all the usual TiddlyWiki settings and internal state data can still be saved as secure, private, local browser cookies that are never made visible to others, even when the document is shared.
<<<
!!!!!Configuration
<<<
<<option chkPortableCookies>> allow ~CookieSaver to store //''portable cookies''// in [[CookieJar]] tiddler
<<option chkMonitorCookieJar>> monitor ~CookieSaver activity (show messages whenever [[CookieJar]] is updated)
<<option chkCookieJarAddToAdvancedOptions>> display [[CookieJar]] in [[AdvancedOptions]]
^^//note: changing this setting does not take effect until you reload the document//^^
<<<
!!!!!Revisions
<<<
2009.08.05 [1.1.0] changed CookieJar output format to support odd symbols in option names (e.g. '@')
2008.09.11 [1.0.2] automatically add portable cookies header to existing CookieJar (if any).  Also, added chkMonitorCookieJar option to display CookieJar activity messages
2008.09.10 [1.0.1] documentation, code cleanup, improvements in 'allowPortableCookie()' function handling
2008.09.09 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.CookieSaverPlugin= {major: 1, minor: 1, revision: 0, date: new Date(2009,8,5)};

config.macros.cookieSaver = {
	target:
		config.options.txtCookieJar||"CookieJar",
	init: function() {
		if (config.options.chkPortableCookies===undefined)
			config.options.chkPortableCookies=false;
		if (config.options.txtCookieJar===undefined)
			config.options.txtCookieJar=this.target;
		if (config.options.chkCookieJarAddToAdvancedOptions===undefined)
			config.options.chkCookieJarAddToAdvancedOptions=true;
		if (config.options.chkCookieJarAddToAdvancedOptions)
			config.shadowTiddlers.AdvancedOptions+="\n!!%0\n><<tiddler [[%0]]>>".format([this.target]);
		if (config.options.chkMonitorCookieJar===undefined)
			config.options.chkMonitorCookieJar=false;

		// add empty Portable Cookies section to shadow CookieJar
		var h="/***\n<<tiddler CookieManager>>\n***/\n";
		var t=(config.shadowTiddlers[this.target]||"").replace(new RegExp(h.replace(/\*/g,'\\*'),''),'')
		config.shadowTiddlers[this.target]=this.header+this.footer+t;

		// add empty Portable Cookies section to real CookieJar (if one exists)
		if (store.tiddlerExists(this.target) && !readOnly) {
			var tid=this.get(this.target);
			var t=tid.text;
			if (t.indexOf(this.header)==-1){
				t=this.header+this.footer+t.replace(new RegExp(h.replace(/\*/g,'\\*'),''),'');
				var who=config.options.chkForceMinorUpdate?tid.modifier:config.options.txtUserName;
				var when=config.options.chkForceMinorUpdate?tid.modified:new Date();
				store.saveTiddler(tid.title,tid.title,t,who,when,tid.tags,tid.fields);
				displayMessage("CookieSaver: added 'Portable Cookies' section to CookieJar");
			}
		}

		// add "cookies" backstage task
		if (config.tasks && !config.tasks.cookies) { // for TW2.2b3 or above
			config.tasks.cookies = {
				text: "cookies",
				tooltip: "manage cookie-based option settings",
				content: "{{groupbox{<<tiddler CookieManager>><<tiddler [[%0]]>>}}}".format([this.target])
			}
			config.backstageTasks.push("cookies");
		}
	},
	header:
		 "/***\n<<tiddler CookieManager>>\n***/\n"
		+"/***\n"
		+"!!![[Portable cookies:|CookieSaverPlugin]] "
		+"{{fine{<<option chkPortableCookies>>enable <<option chkMonitorCookieJar>>monitor}}}\n"
		+"^^This section is ''//__automatically maintained__//'' by [[CookieSaverPlugin]].  "
		+"To block specific cookies, see [[CookieSaverPluginConfig]].^^\n"
		+"***/\n",
	startUser:
		 "//{{{\n"
		+"if (config.options.txtUserName==\"%0\" && config.options.chkPortableCookies) {",
	endUser:
		"\n}\n//}}}\n",
	footer:
		"// // /% end portable cookies %/\n",
	get: function(tid) { // create or retrieve tiddler
		if (story.isDirty(tid)) return null; // tiddler is being hand-edited... leave it alone.
		var text=config.shadowTiddlers[this.target];
		var who=config.options.txtUserName;
		var when=new Date();
		var tags=['systemConfig'];
		return store.getTiddler(tid)||store.saveTiddler(tid,tid,text,who,when,tags,{});
	},
	format: function(name) {
		if (name.substr(0,3)=='chk')
			return '\tconfig.options["'+name+'"]='+(config.options[name]?'true;':'false;');
		return '\tconfig.options["'+name+'"]="'+config.options[name]+'";';
	},
	blockedCookies: [],
	allowPortableCookie: function(name) {
		return true;
	},
	set: function(name) {
		if (!name||!name.trim().length) return;
		if (name=='txtUserName' || this.blockedCookies.contains(name) || !this.allowPortableCookie(name)) {
			if (config.options.chkMonitorCookieJar && !startingUp)
				displayMessage("CookieJar: blocked '"+name+"'");
			return false; // don't save excluded cookies
		}
		var tid=this.get(this.target);
		if (!tid) return false; // if no tiddler... do nothing
		var t=tid.text;
		if (t.indexOf(this.header)==-1) {  // re-add Portable Cookies section if it was deleted by hand edit
			var h="/***\n<<tiddler CookieManager>>\n***/\n";
			t=this.header+this.footer+t.replace(new RegExp(h.replace(/\*/g,'\\*'),''),'');
		}
		var who=config.options.txtUserName;
		var when=new Date();
		var startmark=this.startUser.format([who]);
		var endmark=this.endUser;
		var startpos=t.indexOf(startmark);
		if (startpos==-1) { // insert new user (just before footer)
			if (config.options.chkMonitorCookieJar && !startingUp)
				displayMessage("CookieJar: added new user '"+who+"'");
			var addpos=t.indexOf(this.footer); if (addpos==-1) addpos=t.length;
			t=t.substr(0,addpos)+startmark+endmark+t.substr(addpos);
			startpos=addpos;
		}
		startpos+=startmark.length;
		var endpos=t.indexOf(endmark,startpos);
		var pre=t.substr(0,startpos);
		var lines=t.substring(startpos,endpos).split('\n');
		var post=t.substr(endpos);
		var code=this.format(name);
		var match='\tconfig.options["'+name+'"]=';
		var found=false; var changed=false;
		for (var i=0; i<lines.length; i++) { // find and replace existing setting
			if (lines[i].substr(0,match.length)==match) {
				found=true;
				if (changed=lines[i]!=code) lines[i]=code; // replace value
				if (config.options.chkMonitorCookieJar && !startingUp && changed)
					displayMessage("CookieJar: "+code);
			}
		}
		if (!found && code.length) { // OR, add new setting
			lines[lines.length]=code;
			if (config.options.chkMonitorCookieJar && !startingUp)
				displayMessage("CookieJar: "+code);
		}
		if (found && !changed) return; // don't alter tiddler unless necessary
		t=pre+lines.join('\n')+post;
		var who=config.options.chkForceMinorUpdate?tid.modifier:config.options.txtUserName;
		var when=config.options.chkForceMinorUpdate?tid.modified:new Date();
		store.saveTiddler(this.target,this.target,t,who,when,tid.tags,tid.fields);
		story.refreshTiddler(this.target,null,true);
	},
	remove: function(name) {
		if (!name||!name.trim().length) return;
		var who=config.options.txtUserName;
		var when=new Date();
		var tid=store.getTiddler(this.target);
		if (!tid) return false; // if no tiddler... do nothing
		var t=tid.text;
		var who=config.options.txtUserName
		var startmark=this.startUser.format([who]);
		var endmark=this.endUser;
		var startpos=t.indexOf(startmark);
		if (startpos==-1) return false; // no such user... do nothing
		startpos+=startmark.length;
		var endpos=t.indexOf(endmark,startpos);
		var pre=t.substr(0,startpos);
		var lines=t.substring(startpos,endpos).split('\n');
		var post=t.substr(endpos);
		var match='\tconfig.options["'+name+'"]';
		var found=false; var changed=false;
		for (var i=0; i<lines.length; i++) { // find and remove setting
			if (lines[i].substr(0,match.length)==match) {
				lines.splice(i,1);
				changed=true;
				if (config.options.chkMonitorCookieJar && !startingUp)
					displayMessage("CookieJar: deleted '"+name+"'");
				break;
			}
		}
		if (!changed) return; // not found... do nothing
		t=pre+lines.join('\n')+post;
		if (lines.length==1) { // no cookies left, remove user
			t=pre.substr(0,pre.length-startmark.length)+post.substr(endmark.length);
			if (config.options.chkMonitorCookieJar && !startingUp)
				displayMessage("CookieJar: removed user '"+who+"'");
		}
		var who=config.options.chkForceMinorUpdate?tid.modifier:config.options.txtUserName;
		var when=config.options.chkForceMinorUpdate?tid.modified:new Date();
		store.saveTiddler(this.target,this.target,t,who,when,tid.tags,tid.fields);
		story.refreshTiddler(this.target,null,true);
	}
}
//}}}
//{{{
// Hijack saveOptionCookie() to add CookieSaver processing
config.macros.cookieSaver.saveOptionCookie=saveOptionCookie;
window.saveOptionCookie=function(name)
{
	config.macros.cookieSaver.saveOptionCookie.apply(this,arguments);
	if (!readOnly && (config.options.chkPortableCookies || name=="chkPortableCookies"))
		config.macros.cookieSaver.set(name);
}
// if removeCookie() function is not defined by TW core, define it here.
if (window.removeCookie===undefined) {
	window.removeCookie=function(name) {
		document.cookie = name+'=; expires=Thu, 01-Jan-1970 00:00:01 UTC; path=/;'; 
	}
}
// ... and then hijack it to also remove any corresponding PortableCookie
config.macros.cookieSaver.removeCookie=removeCookie;
window.removeCookie=function(name)
{
	if (config.options.chkPortableCookies && !readOnly)
		config.macros.cookieSaver.remove(name);
	config.macros.cookieSaver.removeCookie.apply(this,arguments);
}
//}}}