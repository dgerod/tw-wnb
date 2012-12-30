/***
|Name|elnbTags Macro|
|Description||
|Package|TW-eLNB |
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|Based on|http://www.TiddlyTools.com/#TagCloudPlugin|
|Source||
|Version|1.0.0|
|License||
|~CoreVersion||
|Type|Plugin|
***/

//{{{
config.macros.elnbTags = {  
    
    handler : function(place,macroName,params,wikifier,paramString,tiddler)
    {
        params = paramString.parseParams("anon",null,true,false,false);
        
        var ul = createTiddlyElement(place,"ul");
        var title = getParam(params,"anon","");
        if(title && store.tiddlerExists(title))
            tiddler = store.getTiddler(title);
        var sep = getParam(params,"sep"," ");
        var lingo = config.views.wikified.tag;
        var label = null;
        for(var t=0; t<tiddler.tags.length; t++) 
        {
            var tag = store.getTiddler(tiddler.tags[t]);
            if(!tag || !tag.tags.contains("excludeLists"))
            {
                if(!label)
                    label = createTiddlyElement(ul,"li",null,"listTitle",lingo.labelTags.format([tiddler.title]));
                
                //createTagButton(createTiddlyElement(ul,"li"),tiddler.tags[t],tiddler.title);
                elnbCreateTagButton(createTiddlyElement(ul,"li"),tiddler.tags[t],tiddler.title);
                
                if(t<tiddler.tags.length-1)
                    createTiddlyText(ul,sep);
            }
        }
        if(!label)
            createTiddlyElement(ul,"li",null,"listTitle",lingo.labelNoTags.format([tiddler.title]));
    },
    
    oldHandler : null,
};

config.macros.elnbTags.oldHandler = config.macros.tags.handler;
config.macros.tags.handler = config.macros.elnbTags.handler;
//}}}