/***
|Description:|Configuration of TW-eLNB package|

!Plugins
!!!BackupOptions plugin
***/
//{{{
config.options["txtBackupFolder"] = "backups";
config.options["txtBackupOptionsFormat"]="%N_-_%Y-%M_BAK.html";  
//}}}
/***
!!!DisableWikiLinks plugin
***/
//{{{
config.options["chkDisableWikiLinks"] = true;
//}}}
/***
!!!HTMLFormatting plugin
***/
//{{{
config.options["chkHTMLHideLinebreaks"] = true;
//}}}
/***
!!!SaveCookie plugin
***/
//{{{
config.options["chkPortableCookies"]  = false;
config.options["chkMonitorCookieJar"] = true;  
//}}}
/***
!TW-eLNB package

!!!General
***/
//{{{
config.options.elnbTW = { timeLog: true, pomodoro: false  };
//}}}
/***
!!!TiddlersBar plugin
***/
//{{{
/*config.options["txtSelectedTiddlerTabButton"] = null;*/
//}}}
/***
!!!CategoryTemplate plugin
***/

