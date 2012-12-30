/***
|Name|elnbCreateTiddlyLink|
|Description|Hacking 'CreateTiddlyLink' function of TW core.|
|Package|TW-eLNB |
|Version|1.0.0|
|Source||
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|License||
|~CoreVersion||
|Type|hack|
***/

//{{{
function elnbCreateTiddlyLink(place,title,includeText,className,isStatic,linkedFromTiddler,noToggle)
{
	var text = includeText ? title : null;
	var i = getTiddlyLinkInfo(title,className);
    
    if(isStatic)
    {
        var btn = createExternalLink(place,store.getTiddlerText("SiteUrl",null) + "#" + title);
        btn.className += ' ' + className;
    }
    else
    {
        //if (text != null) 
        {
            var tiddler = [];
            var subject = undefined;
        
            tiddler = store.getTiddler( text );
            subject = store.getValue(tiddler,'subject')
            
            //if( subject == undefined && subject == "" )
            if( subject == undefined )
                text = title;
            else 
                text = subject;
        }
        
        var btn = createTiddlyButton(place,text,i.subTitle,onClickTiddlerLink,i.classes);        
    }
	
	btn.setAttribute("refresh","link");
	btn.setAttribute("tiddlyLink",title);
    
	if(noToggle)
		btn.setAttribute("noToggle","true");
        
	if(linkedFromTiddler) 
    {
		var fields = linkedFromTiddler.getInheritedFields();
		if(fields)
			btn.setAttribute("tiddlyFields",fields);
	}
    
	return btn;
}
//}}}