/***
|Name|elnbOnClickTag|
|Description|Hacking 'onClickTag' function of TW core.|
|Package|TW-eLNB |
|Version|1.0.0|
|Source||
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|License||
|~CoreVersion||
|Type|hack|
***/

//{{{
function elnbOnClickTag (ev)
{
	var e = ev || window.event;
	var popup = Popup.create(this);
	addClass(popup,"taggedTiddlerList");
    
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
    
	if(popup && tag) 
    {
		
        var tagged = tag.indexOf("[")==-1 ? store.getTaggedTiddlers(tag) : store.filterTiddlers(tag);
		var sortby = this.getAttribute("sortby");
		
        if(sortby&&sortby.length) 
        {
			store.sortTiddlers(tagged,sortby);
		}
        
		var titles = [];
		var li,r;
		for(r=0;r<tagged.length;r++) 
        {
			if(tagged[r].title != title)
				titles.push(tagged[r].title);
		}
        
		var lingo = config.views.wikified.tag;
        
		if(titles.length > 0) 
        {
			var openAll = createTiddlyButton(createTiddlyElement(popup,"li"),lingo.openAllText.format([tag]),lingo.openAllTooltip,onClickTagOpenAll);
			openAll.setAttribute("tag",tag);
			openAll.setAttribute("sortby",sortby);
			createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
			
            var tiddlerTitle = "";           
 
            for(r=0; r<titles.length; r++) 
            {
                tiddlerTitle = titles[r];
				elnbCreateTiddlyLink(createTiddlyElement(popup,"li"),tiddlerTitle,true);
			}
		} else 
        {
			createTiddlyElement(popup,"li",null,"disabled",lingo.popupNone.format([tag]));
		}    

		createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");

		var renameTagButton = createTiddlyButton(createTiddlyElement(popup,"li"),("Rename tag '"+tag+"'"),null,elnbRenameTag);
		renameTagButton.setAttribute("tag",tag)

		var h = createTiddlyLink(createTiddlyElement(popup,"li"),tag,false);
		createTiddlyText(h,lingo.openTag.format([tag]));

	}
    
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
    
	return false;
}
//}}}