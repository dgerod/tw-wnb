/***
|Name|FontSizePlugin|
|Created by|SaqImtiaz|
|Location|http://tw.lewcid.org/#FontSizePlugin|
|Version|1.0|
|Requires|~TW2.x|
!Description:
Resize tiddler text on the fly. The text size is remembered between sessions by use of a cookie.
You can customize the maximum and minimum allowed sizes.
(only affects tiddler content text, not any other text)

Also, you can load a TW file with a font-size specified in the url.
Eg: http://tw.lewcid.org/#font:110

!Demo:
Try using the font-size buttons in the sidebar, or in the MainMenu above.

!Installation:
Copy the contents of this tiddler to your TW, tag with systemConfig, save and reload your TW.
Then put {{{<<fontSize "font-size:">>}}} in your SideBarOptions tiddler, or anywhere else that you might like.

!Usage
{{{<<fontSize>>}}} results in <<fontSize>>
{{{<<fontSize font-size: >>}}} results in <<fontSize font-size:>>

!Customizing:
The buttons and prefix text are wrapped in a span with class fontResizer, for easy css styling.
To change the default font-size, and the maximum and minimum font-size allowed, edit the config.fontSize.settings section of the code below.

!Notes:
This plugin assumes that the initial font-size is 100% and then increases or decreases the size by 10%. This stepsize of 10% can also be customized.

!History:
*27-07-06, version 1.0 : prevented double clicks from triggering editing of containing tiddler.
*25-07-06,  version 0.9

!Code
***/

//{{{
config.fontSize={};

//configuration settings
config.fontSize.settings =
{
            defaultSize : 100,  // all sizes in %
            maxSize : 200,
            minSize : 40,
            stepSize : 10
};

//startup code
var fontSettings = config.fontSize.settings;

if (!config.options.txtFontSize)
            {config.options.txtFontSize = fontSettings.defaultSize;
            saveOptionCookie("txtFontSize");}
setStylesheet(".tiddler .viewer {font-size:"+config.options.txtFontSize+"%;}\n","fontResizerStyles");
setStylesheet("#contentWrapper .fontResizer .button {display:inline;font-size:105%; font-weight:bold; margin:0 1px; padding: 0 3px; text-align:center !important;}\n .fontResizer {margin:0 0.5em;}","fontResizerButtonStyles");

//macro
config.macros.fontSize={};
config.macros.fontSize.handler = function (place,macroName,params,wikifier,paramString,tiddler)
{

               var sp = createTiddlyElement(place,"span",null,"fontResizer");
               sp.ondblclick=this.onDblClick;
               if (params[0])
                           createTiddlyText(sp,params[0]);
               createTiddlyButton(sp,"+","increase font-size",this.incFont);
               createTiddlyButton(sp,"=","reset font-size",this.resetFont);
               createTiddlyButton(sp,"–","decrease font-size",this.decFont);
}

config.macros.fontSize.onDblClick = function (e)
{
             if (!e) var e = window.event;
             e.cancelBubble = true;
             if (e.stopPropagation) e.stopPropagation();
             return false;
}

config.macros.fontSize.setFont = function ()
{
               saveOptionCookie("txtFontSize");
               setStylesheet(".tiddler .viewer {font-size:"+config.options.txtFontSize+"%;}\n","fontResizerStyles");
}

config.macros.fontSize.incFont=function()
{
               if (config.options.txtFontSize < fontSettings.maxSize)
                  config.options.txtFontSize = (config.options.txtFontSize*1)+fontSettings.stepSize;
               config.macros.fontSize.setFont();
}

config.macros.fontSize.decFont=function()
{

               if (config.options.txtFontSize > fontSettings.minSize)
                  config.options.txtFontSize = (config.options.txtFontSize*1) - fontSettings.stepSize;
               config.macros.fontSize.setFont();
}

config.macros.fontSize.resetFont=function()
{

               config.options.txtFontSize=fontSettings.defaultSize;
               config.macros.fontSize.setFont();
}

config.paramifiers.font =
{
               onstart: function(v)
                  {
                   config.options.txtFontSize = v;
                   config.macros.fontSize.setFont();
                  }
};
//}}}