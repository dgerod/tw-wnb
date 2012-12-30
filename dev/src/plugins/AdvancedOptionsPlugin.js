/***
|Name|AdvancedOptionsPlugin|
|Source|http://www.TiddlyTools.com/#AdvancedOptionsPlugin|
|Documentation|http://www.TiddlyTools.com/#AdvancedOptionsPlugin|
|Version|1.2.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.3|
|Type|plugin|
|Description|automatically add plugin-defined options to the [[AdvancedOptions]] shadow tiddler|
!!!!!Usage
<<<
At document startup, this plugin examines each tiddler tagged with <<tag systemConfig>> and looks for a tiddler slice named "Options" whose value refers to a tiddler section (or separate tiddler) that contains an 'advanced options control panel' for configuring that plugin's features and behavior.  For each plugin that contains an "Options" slice, a tabbed entry is automatically created in the [[AdvancedOptions]] shadow tiddler to display that plugin's control panel.

As an optional fallback for backward-compatibility with plugin tiddlers that do not define the "Options" slice, this plugin will also look for a section heading named "Configuration" within those tiddlers, so that older plugins that define this section can automatically have their settings added to the [[AdvancedOptions]] tiddler without requiring the "Options" slice to be added.

This plugin also extends the standard {{{<<option>>}}} macro syntax so you can directly set the internal value of a boolean or text option, without displaying a corresponding checkbox or input field control simply by appending {{{=value}}} syntax to the end of the option ID parameter:
{{{
<<option "txtSomeOption=some text">>
<<option chkSomeOtherOption=true>> OR <<option chkSomeOtherOption=false>>
}}}
Example: {{{<<option chkAnimate=false>>}}}
<<<
!!!!!Configuration
<<<
<<option chkAdvancedOptions>> automatically add plugin-defined options to the [[AdvancedOptions]] shadow tiddler
<<option chkAdvancedOptionsBackstage>> automatically add plugin-defined options to Backstage menu
<<option chkAdvancedOptionsFallback>> use <<option txtAdvancedOptionsFallback>> section as a fallback for plugins that don't define an ~AdvancedOptions slice
//note: these settings only take effect after reloading the document//
<<<
!!!!!Revisions
<<<
2009.07.23 [1.2.0] added support for enhanced {{{<<option id=value>>}}} 'direct assignment' syntax
2008.05.09 [1.1.0] add "options" panel to backstage
2008.04.08 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.AdvancedOptionsPlugin= {major: 1, minor: 2, revision: 0, date: new Date(2009,7,23)};

if (config.options.chkAdvancedOptions===undefined)
	config.options.chkAdvancedOptions=true;
if (config.options.chkAdvancedOptionsBackstage===undefined)
	config.options.chkAdvancedOptionsBackstage=true;
if (config.options.chkAdvancedOptionsFallback===undefined)
	config.options.chkAdvancedOptionsFallback=true;
if (config.options.txtAdvancedOptionsFallback===undefined)
	config.options.txtAdvancedOptionsFallback="Configuration";
if (config.optionsDesc) config.optionsDesc.chkAdvancedOptions=
	"automatically add plugin-defined options to [[AdvancedOptions]]";
//}}}
//{{{
var items=[];
var fmt="[[%0 ]] [[view options for %0]] [[%1]]\n";
var section=config.options.txtAdvancedOptionsFallback;
var plugins=store.getTaggedTiddlers("systemConfig");
for (var p=0; p<plugins.length; p++) {
	var tid=plugins[p].title;
	var settings=store.getTiddlerSlice(tid,"Options");
	if (!settings && config.options.chkAdvancedOptionsFallback && store.getTiddlerText(tid+"##"+section))
		settings="##"+section; // fallback handling for older plugins
	if (settings&&settings.length) {
		if (settings.substr(0,2)=="##") settings=tid+settings;
		items.push(fmt.format([tid,settings]));
	}
}
if (items.length) config.shadowTiddlers.PluginOptions=
	"!![[Plugin-defined options|PluginManager]]\n>@@text-align:left;<<tabs '' \n"+items.join(' ')+">>@@";
if (config.options.chkAdvancedOptions)
	config.shadowTiddlers.AdvancedOptions+="{{smallform{{{wrap{<<tiddler PluginOptions>>}}}}}}";
//}}}
//{{{
// // add "options" backstage task
if (config.tasks && config.options.chkAdvancedOptionsBackstage) { // for TW2.2b3 or above
	config.tasks.options = {
		text: "options",
		tooltip: "manage plugin-defined option settings",
		content: "{{smallform{{{groupbox{{{wrap{<<tiddler PluginOptions>>}}}}}}\n{{groupbox small {<<options>>}}}}}}"
	}
	config.backstageTasks.splice(config.backstageTasks.indexOf("plugins")+1,0,"options");
}
//}}}
//{{{
config.macros.option.AOPsave_handler=config.macros.option.handler;
config.macros.option.handler=function(place,macroName,params,wikifier,paramString,tiddler) {
	var parts=params[0].split('=');
	if (parts.length==1) return this.AOPsave_handler.apply(this,arguments);
	var id=parts[0]; var val=(id.substr(0,3)=='txt')?parts[1]:(parts[1]=='true');
	config.options[id]=val;
}
//}}}