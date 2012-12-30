/***
|Name|CookieSaverPluginConfig|
|Source|http://www.TiddlyTools.com/#CookieSaverPluginConfig|
|Requires|CookieSaverPlugin|
|Description|custom settings for [[CookieSaverPlugin]]|
!!!!!Portable Cookie Configuration:
***/
// // <<option chkPortableCookies>> allow ~CookieSaver to store //''portable cookies''// in [[CookieJar]] tiddler
// // <<option chkMonitorCookieJar>> monitor ~CookieSaver activity (show messages whenever [[CookieJar]] is updated)
//{{{
// default to these settings:
// config.options.chkPortableCookies=false;	// when FALSE this blocks ALL portable cookies
// config.options.chkMonitorCookieJar=false;
//}}}

// // Individual cookie names can be added to the {{{config.macros.cookieSaver.blockedCookies}}} array to prevent them from being stored in the [[CookieJar]].
//{{{
var bc=config.macros.cookieSaver.blockedCookies;
bc.push("chkBackstage");		// core
bc.push("txtMainTab");			// TiddlyWiki: SideBarTabs
bc.push("txtTOCSortBy");		// TiddlyTools: TableOfContentsPlugin
bc.push("txtCatalogTab");		// TiddlyTools: CatalogTabs
bc.push("txtUploadFilename");		// BidiX: UploadPlugin
bc.push("txtUploadDir");		// BidiX: UploadPlugin
bc.push("pasPassword");			// BidiX: UploadPlugin
bc.push("pasUploadPassword");		// BidiX: UploadPlugin
//}}}
// // You can also define a javascript test function that determines whether or not any particular cookie name should be stored in the [[CookieJar]].  The following function should return FALSE if the portable cookie should be blocked, or TRUE if the cookie should be allowed:
//{{{
config.macros.cookieSaver.allowPortableCookie=function(name) {
	// add tests based on specific cookie names and runtime conditions
	if (name.substr(0,9)=="chkSlider") 	return false;	// NestedSlidersPlugin
	if (name.substr(0,13)=="txtFirstVisit")	return false;	// VisitCounter
	if (name.substr(0,12)=="txtLastVisit")	return false;	// VisitCounter
	if (name.substr(0,13)=="txtVisitCount")	return false;	// VisitCounter
	return true;
}
//}}}