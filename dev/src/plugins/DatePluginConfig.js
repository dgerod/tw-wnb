/***
|Name|DatePluginConfig|
|Source|http://www.TiddlyTools.com/#DatePluginConfig|
|Documentation|http://www.TiddlyTools.com/#DatePluginInfo|
|Version|2.6.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|formats, background colors and other optional settings for DatePlugin|
***/
// // Default popup content display options (can be overridden by cookies)
//{{{
if (config.options.chkDatePopupHideCreated===undefined)
	config.options.chkDatePopupHideCreated=false;
if (config.options.chkDatePopupHideChanged===undefined)
	config.options.chkDatePopupHideChanged=false;
if (config.options.chkDatePopupHideTagged===undefined)
	config.options.chkDatePopupHideTagged=false;
if (config.options.chkDatePopupHideReminders===undefined)
	config.options.chkDatePopupHideReminders=false;
//}}}

// // show Julian date number below regular date
//{{{
if (config.options.chkShowJulianDate===undefined)
	config.options.chkShowJulianDate=false;
//}}}

// // fixed-date annual holidays
//{{{
config.macros.date.holidays=[
	"01/01", // NewYearsDay, 
	"07/04", // US Independence Day
	"07/24"  // Eric's Birthday (hooray!)
];
//}}}

// // weekend map (1=weekend, 0=weekday)
//{{{
config.macros.date.weekend=[ 1,0,0,0,0,0,1 ]; // day index values: sun=0, mon=1, tue=2, wed=3, thu=4, fri=5, sat=6
//}}}

// // date display/link formats
//{{{
config.macros.date.format="YYYY.0MM.0DD"; // default date display format
config.macros.date.linkformat="YYYY.0MM.0DD"; // 'dated tiddler' link format
//}}}

// // When displaying a calendar (see [[CalendarPlugin]]), you can customize the colors/styles that are applied to the calendar dates by modifying the values and/or functions below:
//{{{
// default calendar colors
config.macros.date.weekendbg="#c0c0c0";
config.macros.date.holidaybg="#ffaace";
config.macros.date.createdbg="#bbeeff";
config.macros.date.modifiedsbg="#bbeeff";
config.macros.date.linkedbg="#babb1e";
config.macros.date.remindersbg="#c0ffee";

// apply calendar styles
function setDateStyle(place,link,weekend) {
	// alias variable names for code readability
	var date=link.date;
	var fmt=link.linkformat;
	var linkto=date.formatString(fmt);
	var cmd=config.macros.date;

	if ((weekend!==undefined?weekend:isWeekend(date))&&(cmd.weekendbg!=""))
		{ place.style.background = cmd.weekendbg; }
	if (hasModifieds(date)||hasCreateds(date)||hasTagged(date,fmt))
		{ link.style.fontStyle="normal"; link.style.fontWeight="bold"; }
	if (hasReminders(date))
		{ link.style.textDecoration="underline"; }
	if (isToday(date))
		{ link.style.border="1px solid black"; }
	if (isHoliday(date)&&(cmd.holidaybg!=""))
		{ place.style.background = cmd.holidaybg; }
	if (hasCreateds(date)&&(cmd.createdbg!=""))
		{ place.style.background = cmd.createdbg; }
	if (hasModifieds(date)&&(cmd.modifiedsbg!=""))
		{ place.style.background = cmd.modifiedsbg; }
	if ((hasTagged(date,fmt)||store.tiddlerExists(linkto))&&(cmd.linkedbg!=""))
		{ place.style.background = cmd.linkedbg; }
	if (hasReminders(date)&&(cmd.remindersbg!=""))
		{ place.style.background = cmd.remindersbg; }
	if (isToday(date)&&(cmd.todaybg!=""))
		{ place.style.background = cmd.todaybg; }
	if (config.options.chkShowJulianDate) {
		var m=[0,31,59,90,120,151,181,212,243,273,304,334];
		var d=date.getDate()+m[date.getMonth()];
		var y=date.getFullYear();
		if (date.getMonth()>1 && (y%4==0 && y%100!=0) || y%400==0) d++; // after February in a leap year
		wikify("@@font-size:80%;<br>"+d+"@@",place);
	}
	var t=store.getTiddlerText(linkto,'')
	if (config.options.chkInlineCalendarJournals && t.length) wikify('<br>'+t,place);
}
//}}}