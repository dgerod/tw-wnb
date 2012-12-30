/***
<<tiddler CookieManager>>
***/
/***
!!![[Portable cookies:|CookieSaverPlugin]] {{fine{<<option chkPortableCookies>>enable <<option chkMonitorCookieJar>>monitor}}}
^^This section is ''//__automatically maintained__//'' by [[CookieSaverPlugin]].  To block specific cookies, see [[CookieSaverPluginConfig]].^^
***/
//{{{
if (config.options.txtUserName=="escdie" && config.options.chkPortableCookies) {
	config.options["chkPortableCookies"]=false;
	config.options["txtBackupOptionsFormat"]="%N_-_%Y-%M_BAK.html";
	config.options["txtToDoPanel"]="Now";
	config.options["txtMoreTab"]="Shadowed";
	config.options["chkPreviewText"]=true;
	config.options["chkShowRightSidebar"]=true;
	config.options["chkShowLeftSidebar"]=true;
	config.options["chkUseYourSearch"]=true;
	config.options["chkInsertTabs"]=true;
	config.options["txtFontSize"]="100";
	config.options["chkSaveStory"]=true;
	config.options["chkStoryAllowAdd"]=true;
	config.options["chkStoryFold"]=false;
	config.options["chkStoryClose"]=true;
	config.options["chkStoryTop"]=false;
	config.options["txtSavedStory"]="[[UnsavedTiddlers]] [[Dashboard]]";
	config.options["chkAutoSave"]=true;
	config.options["chkFileDropContent"]=false;
	config.options["txtFileDropTags"]="archive";
	config.options["txtMessageLogDateFormat"]="YYYY-0MM-0DD 0hh:0mm:0ss";
	config.options["chkMessageLog"]=false;
	config.options["chkAdvancedOptions"]=true;
	config.options["chkAdvancedOptionsBackstage"]=true;
	config.options["chkCookieJarAddToAdvancedOptions"]=false;
	config.options["txtTemporaryTag"]="%temp";
	config.options["txtAdvancedOptionsFallback"]="Configuration";
	config.options["chkDatePopupHideReminders"]=false;
	config.options["chkHTMLHideLinebreaks"]=false;
	config.options["chkAnimate"]=false;
	config.options["txtJournaPanel"]="TimeLog";
	config.options["chkMonitorCookieJar"]=true;
	config.options["txtMainPanel"]="Main";
}

if (config.options.txtUserName=="admin" && config.options.chkPortableCookies) {
	config.options["chkPortableCookies"]=true;
	config.options["txtBackupOptionsFormat"]="%N_-_%Y-%M_BAK.html";
	config.options["txtToDoPanel"]="Next";
	config.options["txtMoreTab"]="Shadowed";
	config.options["chkPreviewText"]=true;
	config.options["chkShowRightSidebar"]=true;
	config.options["chkShowLeftSidebar"]=true;
	config.options["chkUseYourSearch"]=true;
	config.options["chkInsertTabs"]=true;
	config.options["txtFontSize"]="100";
	config.options["chkSaveStory"]=true;
	config.options["chkStoryAllowAdd"]=true;
	config.options["chkStoryFold"]=false;
	config.options["chkStoryClose"]=true;
	config.options["chkStoryTop"]=false;
	config.options["txtSavedStory"]="[[UnsavedTiddlers]] [[Dashboard]]";
	config.options["chkAutoSave"]=true;
	config.options["chkFileDropContent"]=false;
	config.options["txtFileDropTags"]="archive";
	config.options["txtMessageLogDateFormat"]="YYYY-0MM-0DD 0hh:0mm:0ss";
	config.options["chkMessageLog"]=false;
	config.options["chkAdvancedOptions"]=true;
	config.options["chkAdvancedOptionsBackstage"]=true;
	config.options["chkCookieJarAddToAdvancedOptions"]=false;
	config.options["txtTemporaryTag"]="temp";
	config.options["txtAdvancedOptionsFallback"]="Configuration";
}
//}}}
// // /% end portable cookies %/
