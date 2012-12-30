/***
|Name|elnbAllTags Macro|
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
config.macros.elnbAllTags = {
   handler: function(place,macroName,params)
   {
	var tags = store.getTags(params[0]);
	var ul = createTiddlyElement(place,"ul");
	if(tags.length == 0)
		createTiddlyElement(ul,"li",null,"listTitle",this.noTags);
	
        for(var t=0; t<tags.length; t++) 
        {
		var title = tags[t][0];
		var info = getTiddlyLinkInfo(title);
		var li = createTiddlyElement(ul,"li");
		var btn = createTiddlyButton(li,title + " (" + tags[t][1] + ")",this.tooltip.format([title]),elnbOnClickTag,info.classes);
		btn.setAttribute("tag",title);
		btn.setAttribute("refresh","link");
		btn.setAttribute("tiddlyLink",title);
		if(params[1]) 
                {
			btn.setAttribute("sortby",params[1]);
		}
	}
   },  
      
   oldHandler : null,  
};  

config.macros.elnbAllTags.oldHandler = config.macros.allTags.handler;  
config.macros.allTags.handler = config.macros.elnbAllTags.handler;  
//}}}