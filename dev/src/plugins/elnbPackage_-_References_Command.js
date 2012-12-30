/***
|Name|References Command|
|Description||
|Package|TW-eLNB |
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|Based on|TW References Command|
|Source||
|Version|1.0.0|
|License||
|~CoreVersion||
|Type|Hack|
***/

//{{{
config.commands.elnbReferences = {
   
   handlePopup :  function(popup,title)
   {  
	var references = store.getReferringTiddlers(title);
	var c = false;

	for(var r=0; r<references.length; r++) 
        {
		if(references[r].title != title && !references[r].isTagged("excludeLists")) 
                {
			elnbCreateTiddlyLink(createTiddlyElement(popup,"li"),references[r].title,true);
			c = true;
		}
	}
	if(!c)
		createTiddlyElement(popup,"li",null,"disabled",this.popupNone);
    },
    
    oldHandlePopup  : null,
};

config.commands.elnbReferences .oldHandlePopup  = config.commands.references.handlePopup ;
config.commands.references.handlePopup = config.commands.elnbReferences .handlePopup ;

//}}}
