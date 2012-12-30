/***
|Name|elnbCreateTagButton|
|Description|Hacking 'elnbCreateTagButton' function of TW core.|
|Package|TW-eLNB |
|Version|1.0.0|
|Source||
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|License||
|~CoreVersion||
|Type|hack|
***/
//{{{
function elnbCreateTagButton(place,tag,excludeTiddler,title,tooltip)
{
	var btn = createTiddlyButton(place,title||tag,(tooltip||config.views.wikified.tag.tooltip).format([tag]),elnbOnClickTag);
	btn.setAttribute("tag",tag);
	if(excludeTiddler)
		btn.setAttribute("tiddler",excludeTiddler);
	return btn;
}
//}}}