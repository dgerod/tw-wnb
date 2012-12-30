/***
|''Name:''|AutoRefreshPlugin|
|''Version:''|1.0.1 (2007-01-20)|
|''Type:''|plugin|
|''Source:''|http://tiddlywiki.abego-software.de/#AutoRefreshPlugin|
|''Author:''|Udo Borkowski (ub [at] abego-software [dot] de)|
|''Documentation:''|[[AutoRefreshPlugin Documentation|http://tiddlywiki.abego-software.de/#%5B%5BAutoRefreshPlugin%20Documentation%5D%5D]]|
|''Licence:''|[[BSD open source license (abego Software)|http://www.abego-software.de/legal/apl-v10.html]]|
|''~CoreVersion:''|2.1.3|
|''Browser:''|Firefox 1.5.0.9 or better; Internet Explorer 6.0|
A tiddler containing the {{{<<autoRefresh...>>}}} macro is automatically refreshed (re-painted) whenever a tiddler changes.
!Syntax
{{{
<<autoRefresh [observeTiddler: tiddler ...]>>
}}}
|{{{observeTiddler}}}|(optional) when specified the refresh will only happen when one of the tiddlers specified is changed.|
!Source Code
***/
//{{{

if (!window.abego) window.abego = {};

// autoRefresh Macro =============================================================
//
(function() {


var REFRESHER_NAME = "abego_onEveryChange";

var tiddlersToRefresh = {}; // A set holding the names of tiddlers to be refreshed

var onEveryChangeRefresher = function(e,changeList) {
	
	var tiddlerElem = story.findContainingTiddler(e);
	if (!tiddlerElem) return false;

	var title = tiddlerElem.getAttribute("tiddler");
	if (!title) return false;

	// if "observeTiddler" are specified we only refresh if one of the given 
	// tiddlers has changed.
	var observedTiddlers = e.getAttribute("observedTiddlers");
	if (observedTiddlers) {
		var a = observedTiddlers.readBracketedList();
		if (!changeList || !a.containsAny(changeList))
			return;
	}

	// Refresh the tiddler asynchronously. 
	// This way we can avoid repeated refreshes (e.g. when a tiddler is renamed)
	tiddlersToRefresh[title] = true;
	setTimeout(function() {
		// Refresh all tiddlers in tiddlersToRefresh
		for(var title in tiddlersToRefresh)
			story.refreshTiddler(title,null,true);

		// We have refreshed all pending tiddlers. Clear the set.
		tiddlersToRefresh = {};
	}, 0);

	return true;
}

config.refreshers[REFRESHER_NAME] = onEveryChangeRefresher;


config.macros.autoRefresh = {};

config.macros.autoRefresh.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
    params = paramString.parseParams("observeTiddler",null,true,false,true); // allowEval, cascadeDefaults, names allowed

	var e = createTiddlyElement(place,"span");
	e.setAttribute("refresh",REFRESHER_NAME);
	var observedTiddlers = params[0]["observeTiddler"];
	if (observedTiddlers && observedTiddlers.length) {
		var s = "[["+observedTiddlers.join("]] [[")+"]]";
		e.setAttribute("observedTiddlers",s);
	}
};


})();

//}}}