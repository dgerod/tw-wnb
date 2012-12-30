/***
|Name|elnbList Macro|
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
config.macros.elnbList = {
   
   handler :  function(place,macroName,params)
   {  
        var type = params[0] || "all";
        var list = document.createElement("ul");
        place.appendChild(list);
     
        if(this[type].prompt)
            createTiddlyElement(list,"li",null,"listTitle",this[type].prompt);
        
        var results;	
        if(this[type].handler)
            results = this[type].handler(params);
        
        for(var t = 0; t < results.length; t++) 
        {
            var li = document.createElement("li");
            list.appendChild(li);
            
            //createTiddlyLink(li,typeof results[t] == "string" ? results[t] : results[t].title,true);	
            elnbCreateTiddlyLink(li,typeof results[t] == "string" ? results[t] : results[t].title,true);	
        }
    },
    
    oldHandler : null,
};

config.macros.elnbList.oldHandler = config.macros.list.handler;
config.macros.list.handler = config.macros.elnbList.handler;

//}}}
