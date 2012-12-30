/***
|Name|SaveAndReloadMacro|
|Created by|SaqImtiaz|
|Location|http://tw.lewcid.org/#SaveAndReloadMacro|
|Version|1.0|
|Requires|~TW2.x|
!Description:
Provides a button to save and reload TW. Useful if you are testing code and dont have AutoSave enabled.

!Demo:
{{{<<saveAndReload>>}}}<<saveAndReload>>

!Installation:
Copy the contents of this tiddler to your TW, tag with systemConfig, save and reload your TW.

!History:
*24-07-06: ver 1.0

!Code
***/
//{{{
config.macros.saveAndReload={};
config.macros.saveAndReload.handler= function(place,macroName,params,wikifier,paramString,tiddler)
{
        var label = params[0]||"Save & Reload";
        var tooltip = params[1]||"Save & reload";
        createTiddlyButton(place,label,tooltip,this.onclick);
}
config.macros.saveAndReload.onclick= function()
{
       saveChanges();
       window.location.reload( false );
}
//}}}