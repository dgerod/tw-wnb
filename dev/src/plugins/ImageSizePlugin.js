/***
|Name|ImageSizePlugin|
|Source|http://www.TiddlyTools.com/#ImageSizePlugin|
|Version|1.2.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|adds support for resizing images|
This plugin adds optional syntax to scale an image to a specified width and height and/or interactively resize the image with the mouse.
!!!!!Usage
<<<
The extended image syntax is:
{{{
[img(w+,h+)[...][...]]
}}}
where ''(w,h)'' indicates the desired width and height (in CSS units, e.g., px, em, cm, in, or %). Use ''auto'' (or a blank value) for either dimension to scale that dimension proportionally (i.e., maintain the aspect ratio). You can also calculate a CSS value 'on-the-fly' by using a //javascript expression// enclosed between """{{""" and """}}""". Appending a plus sign (+) to a dimension enables interactive resizing in that dimension (by dragging the mouse inside the image). Use ~SHIFT-click to show the full-sized (un-scaled) image. Use ~CTRL-click to restore the starting size (either scaled or full-sized).
<<<
!!!!!Examples
<<<
{{{
[img(100px+,75px+)[images/meow2.jpg]]
}}}
[img(100px+,75px+)[images/meow2.jpg]]
{{{
[<img(34%+,+)[images/meow.gif]]
[<img(21% ,+)[images/meow.gif]]
[<img(13%+, )[images/meow.gif]]
[<img( 8%+, )[images/meow.gif]]
[<img( 5% , )[images/meow.gif]]
[<img( 3% , )[images/meow.gif]]
[<img( 2% , )[images/meow.gif]]
[img(  1%+,+)[images/meow.gif]]
}}}
[<img(34%+,+)[images/meow.gif]]
[<img(21% ,+)[images/meow.gif]]
[<img(13%+, )[images/meow.gif]]
[<img( 8%+, )[images/meow.gif]]
[<img( 5% , )[images/meow.gif]]
[<img( 3% , )[images/meow.gif]]
[<img( 2% , )[images/meow.gif]]
[img(  1%+,+)[images/meow.gif]]
{{tagClear{
}}}
<<<
!!!!!Revisions
<<<
2009.02.24 [1.2.1] cleanup width/height regexp, use '+' suffix for resizing
2009.02.22 [1.2.0] added stretchable images
2008.01.19 [1.1.0] added evaluated width/height values
2008.01.18 [1.0.1] regexp for "(width,height)" now passes all CSS values to browser for validation
2008.01.17 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.ImageSizePlugin= {major: 1, minor: 2, revision: 1, date: new Date(2009,2,24)};
//}}}
//{{{
var f=config.formatters[config.formatters.findByField("name","image")];
f.match="\\[[<>]?[Ii][Mm][Gg](?:\\([^,]*,[^\\)]*\\))?\\[";
f.lookaheadRegExp=/\[([<]?)(>?)[Ii][Mm][Gg](?:\(([^,]*),([^\)]*)\))?\[(?:([^\|\]]+)\|)?([^\[\]\|]+)\](?:\[([^\]]*)\])?\]/mg;
f.handler=function(w) {
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
		var floatLeft=lookaheadMatch[1];
		var floatRight=lookaheadMatch[2];
		var width=lookaheadMatch[3];
		var height=lookaheadMatch[4];
		var tooltip=lookaheadMatch[5];
		var src=lookaheadMatch[6];
		var link=lookaheadMatch[7];

		// Simple bracketted link
		var e = w.output;
		if(link) { // LINKED IMAGE
			if (config.formatterHelpers.isExternalLink(link)) {
				if (config.macros.attach && config.macros.attach.isAttachment(link)) {
					// see [[AttachFilePluginFormatters]]
					e = createExternalLink(w.output,link);
					e.href=config.macros.attach.getAttachment(link);
					e.title = config.macros.attach.linkTooltip + link;
				} else
					e = createExternalLink(w.output,link);
			} else 
				e = createTiddlyLink(w.output,link,false,null,w.isStatic);
			addClass(e,"imageLink");
		}

		var img = createTiddlyElement(e,"img");
		if(floatLeft) img.align="left"; else if(floatRight) img.align="right";
		if(width||height) {
			var x=width.trim(); var y=height.trim();
			var stretchW=(x.substr(x.length-1,1)=='+'); if (stretchW) x=x.substr(0,x.length-1);
			var stretchH=(y.substr(y.length-1,1)=='+'); if (stretchH) y=y.substr(0,y.length-1);
			if (x.substr(0,2)=="{{")
				{ try{x=eval(x.substr(2,x.length-4))} catch(e){displayMessage(e.description||e.toString())} }
			if (y.substr(0,2)=="{{")
				{ try{y=eval(y.substr(2,y.length-4))} catch(e){displayMessage(e.description||e.toString())} }
			img.style.width=x.trim(); img.style.height=y.trim();
			config.formatterHelpers.addStretchHandlers(img,stretchW,stretchH);
		}
		if(tooltip) img.title = tooltip;

		// GET IMAGE SOURCE
		if (config.macros.attach && config.macros.attach.isAttachment(src))
			src=config.macros.attach.getAttachment(src); // see [[AttachFilePluginFormatters]]
		else if (config.formatterHelpers.resolvePath) { // see [[ImagePathPlugin]]
			if (config.browser.isIE || config.browser.isSafari) {
				img.onerror=(function(){
					this.src=config.formatterHelpers.resolvePath(this.src,false);
					return false;
				});
			} else
				src=config.formatterHelpers.resolvePath(src,true);
		}
		img.src=src;
		w.nextMatch = this.lookaheadRegExp.lastIndex;
	}
}

config.formatterHelpers.addStretchHandlers=function(e,stretchW,stretchH) {
	e.title=((stretchW||stretchH)?'DRAG=stretch/shrink, ':'')
		+'SHIFT-CLICK=show full size, CTRL-CLICK=restore initial size';
	e.statusMsg='width=%0, height=%1';
	e.style.cursor='move';
	e.originalW=e.style.width;
	e.originalH=e.style.height;
	e.minW=Math.max(e.offsetWidth/20,10);
	e.minH=Math.max(e.offsetHeight/20,10);
	e.stretchW=stretchW;
	e.stretchH=stretchH;
	e.onmousedown=function(ev) { var ev=ev||window.event;
		this.sizing=true;
		this.startX=!config.browser.isIE?ev.pageX:(ev.clientX+findScrollX());
		this.startY=!config.browser.isIE?ev.pageY:(ev.clientY+findScrollY());
		this.startW=this.offsetWidth;
		this.startH=this.offsetHeight;
		return false;
	};
	e.onmousemove=function(ev) { var ev=ev||window.event;
		if (this.sizing) {
			var s=this.style;
			var currX=!config.browser.isIE?ev.pageX:(ev.clientX+findScrollX());
			var currY=!config.browser.isIE?ev.pageY:(ev.clientY+findScrollY());
			var newW=(currX-this.offsetLeft)/(this.startX-this.offsetLeft)*this.startW;
			var newH=(currY-this.offsetTop )/(this.startY-this.offsetTop )*this.startH;
			if (this.stretchW) s.width =Math.floor(Math.max(newW,this.minW))+'px';
			if (this.stretchH) s.height=Math.floor(Math.max(newH,this.minH))+'px';
			clearMessage(); displayMessage(this.statusMsg.format([s.width,s.height]));
		}
		return false;
	};
	e.onmouseup=function(ev) { var ev=ev||window.event;
		if (ev.shiftKey) { this.style.width=this.style.height=''; }
		if (ev.ctrlKey)  { this.style.width=this.originalW; this.style.height=this.originalH; }
		this.sizing=false;
		clearMessage();
		return false;
	};
	e.onmouseout=function(ev) { var ev=ev||window.event;
		this.sizing=false;
		clearMessage();
		return false;
	};
}
//}}}