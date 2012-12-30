/***
|Name|elnbTimeline Macro|
|Description||
|Package|TW-eLNB |
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|Based on| |
|Source||
|Version|1.0.0|
|License||
|~CoreVersion||
|Type|Hack|
***/

//{{{
config.macros.elnbTimeline = {

handler : function(place,macroName,params)
{
	var field = params[0] || "modified";
	var tiddlers = store.reverseLookup("tags","excludeLists",false,field);
	var lastDay = "";
	var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
	var dateFormat = params[2] || this.dateFormat;
	
        for(var t=tiddlers.length-1; t>=last; t--) 
        {
		var tiddler = tiddlers[t];
		var theDay = tiddler[field].convertToLocalYYYYMMDDHHMM().substr(0,8);
		if(theDay != lastDay) {
			var ul = document.createElement("ul");
			addClass(ul,"timeline");
			place.appendChild(ul);
			createTiddlyElement(ul,"li",null,"listTitle",tiddler[field].formatString(dateFormat));
			lastDay = theDay;
		}
		createTiddlyElement(ul,"li",null,"listLink").appendChild(elnbCreateTiddlyLink(place,tiddler.title,true));
	}
},    

oldHandler : null,    
};    

config.macros.elnbTimeline.oldHandler = config.macros.timeline.handler;    
config.macros.timeline.handler = config.macros.elnbTimeline.handler;    
//}}}