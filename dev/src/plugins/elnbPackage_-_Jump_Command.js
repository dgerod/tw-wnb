/***
|Name|Jump Command|
|Description||
|Package|TW-eLNB |
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|Based on|TW Jump Command|
|Source||
|Version|1.0.0|
|License||
|~CoreVersion||
|Type|Hack|
***/

//{{{
config.commands.elnbJump = {
   
   handlePopup :  function(popup,title)
   {  
        story.forEachTiddler(function(title,element) {
                 elnbCreateTiddlyLink(createTiddlyElement(popup,"li"),title,true,null,false,null,true);
        });
    },
    
    oldHandlePopup  : null,
};

config.commands.elnbJump.oldHandlePopup  = config.commands.jump.handlePopup ;
config.commands.jump.handlePopup = config.commands.elnbJump.handlePopup ;

//}}}
