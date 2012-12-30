/***
|Name|Tagging Macro|
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
config.macros.elnbTagging = {
   
   handler :   function(place,macroName,params,wikifier,paramString,tiddler)
   {
    params = paramString.parseParams("anon",null,true,false,false);
    var ul = createTiddlyElement(place,"ul");
    var title = getParam(params,"anon","");
    if(title == "" && tiddler instanceof Tiddler)
        title = tiddler.title;
    var sep = getParam(params,"sep"," ");
    ul.setAttribute("title",this.tooltip.format([title]));
    var tagged = store.getTaggedTiddlers(title);
    var prompt = tagged.length == 0 ? this.labelNotTag : this.label;
    createTiddlyElement(ul,"li",null,"listTitle",prompt.format([title,tagged.length]));

    for(var t=0; t<tagged.length; t++) 
   {
        elnbCreateTiddlyLink(createTiddlyElement(ul,"li"),tagged[t].title,true);
        if(t<tagged.length-1)
            createTiddlyText(ul,sep);
    }
   },
    
    oldHandler : null,
};

config.macros.elnbTagging .oldHandler = config.macros.tagging.handler;
config.macros.tagging.handler = config.macros.elnbTagging .handler;

//}}}
