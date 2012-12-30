/***
|Name|elnbTagCloudPlugin|
|Description|Present a 'cloud' of tags (or links) using proportional font display|
|Package|TW-eLNB |
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|Based on|http://www.TiddlyTools.com/#TagCloudPlugin|
|Source||
|Version|1.0.0|
|License||
|~CoreVersion||
|Type|plugin|

''@@color:blue;font-size:125%;Hacked to be used with tw-elnb@@''

!Usage
<<<
{{{
<<elnbTagCloud type action:... limit:... tag tag tag ...>>
<<elnbTagCloud type action:... limit:... +TiddlerName>>
<<elnbTagCloud type action:... limit:... -TiddlerName>>
<<elnbTagCloud type action:... limit:... =tagvalue>>
}}}
where:
* //type// is a keyword, one of:
** ''tags'' (default) - displays a cloud of tags, based on frequency of use
** ''links'' - displays a cloud of tiddlers, based on number of links //from// each tiddler
** ''references'' - displays a cloud of tiddlers, based on number of links //to// each tiddler
* ''action:popup'' (default) - clicking a cloud item shows a popup with links to related tiddlers<br>//or//<br> ''action:goto'' - clicking a cloud item immediately opens the tiddler corresponding to that item
* ''limit:N'' (optional) - restricts the cloud display to only show the N most popular tags/links
* ''tag tag tag...'' (or ''title title title'' if ''links''/''references'' is used)<br>shows all tags/links in the document //except// for those listed as macro parameters
* ''+TiddlerName''<br>show only tags/links read from a space-separated, bracketed list stored in a separate tiddler.
* ''-TiddlerName''<br>show all tags/links //except// those read from a space-separated, bracketed list stored in a separate tiddler.
* ''=tagvalue'' (//only if type=''tags''//)<br>shows only tags that are themselves tagged with the indicated tag value (i.e., ~TagglyTagging usage)
//note: for backward-compatibility, you can also use the macro {{{<<tagCloud ...>>}}} in place of {{{<<cloud ...>>}}}//
<<<
!Examples
<<<
//all tags excluding<<tag systemConfig>>, <<tag excludeMissing>> and <<tag script>>//
{{{<<elnbTagCloud systemConfig excludeMissing script>>}}}
{{groupbox{<<elnbTagCloud systemConfig excludeMissing script>>}}}
//top 10 tags excluding<<tag systemConfig>>, <<tag excludeMissing>> and <<tag script>>//
{{{<<elnbTagCloud limit:10 systemConfig excludeMissing script>>}}}
{{groupbox{<<elnbTagCloud limit:10 systemConfig excludeMissing script>>}}}
//tags listed in// [[FavoriteTags]]
{{{<<elnbTagCloud +FavoriteTags>>}}}
{{groupbox{<<elnbTagCloud +FavoriteTags>>}}}
//tags NOT listed in// [[FavoriteTags]]
{{{<<elnbTagCloud -FavoriteTags>>}}}
{{groupbox{<<elnbTagCloud -FavoriteTags>>}}}
//links to tiddlers tagged with 'package'//
{{{<<elnbTagCloud action:goto =package>>}}}
{{groupbox{<<elnbTagCloud action:goto =package>>}}}
//top 20 most referenced tiddlers//
{{{<<elnbTagCloud references limit:20>>}}}
{{groupbox{<<elnbTagCloud references limit:20>>}}}
//top 20 tiddlers that contain the most links//
{{{<<elnbTagCloud links limit:20>>}}}
{{groupbox{<<elnbTagCloud links limit:20>>}}}
<<<
!Revisions
<<<
2009.07.17 [1.7.0] added {{{-TiddlerName}}} parameter to exclude tags that are listed in the indicated tiddler
2009.02.26 [1.6.0] added {{{action:...}}} parameter to apply popup vs. goto action when clicking cloud items
2009.02.05 [1.5.0] added ability to show links or back-links (references) instead of tags and renamed macro to {{{<<cloud>>}}} to reflect more generalized usage.
2008.12.16 [1.4.2] corrected group calculation to prevent 'group=0' error
2008.12.16 [1.4.1] revised tag filtering so excluded tags don't affect calculations
2008.12.15 [1.4.0] added {{{limit:...}}} parameter to restrict the number of tags displayed to the top N most popular
2008.11.15 [1.3.0] added {{{+TiddlerName}}} parameter to include only tags that are listed in the indicated tiddler
2008.09.05 [1.2.0] added '=tagname' parameter to include only tags that are themselves tagged with the specified value (i.e., ~TagglyTagging usage)
2008.07.03 [1.1.0] added 'segments' property to macro object.  Extensive code cleanup
<<<
!Code
***/
//{{{
version.extensions.TagCloudPlugin= {major: 1, minor: 7 , revision: 0, date: new Date(2009,7,17)};
//Originally created by Clint Checketts, contributions by Jonny Leroy and Eric Shulman
//Currently maintained and enhanced by Eric Shulman
//}}}
//{{{
config.macros.elnbTagCloud = {

	tagstip: "%1 tiddlers tagged with '%0'",
	refslabel: " (%0 references)",
	refstip: "%1 tiddlers have links to '%0'",
	linkslabel: " (%0 links)",
	linkstip: "'%0' has links to %1 other tiddlers",
	groups: 9,
    
	init: function() {
    
        config.shadowTiddlers.StyleSheetTagCloud=
			'/*{{{*/\n'
			+'.tagCloud span {line-height: 3.5em; margin:3px;}\n'
			+'.tagCloud1{font-size: 80%;}\n'
			+'.tagCloud2{font-size: 100%;}\n'
			+'.tagCloud3{font-size: 120%;}\n'
			+'.tagCloud4{font-size: 140%;}\n'
			+'.tagCloud5{font-size: 160%;}\n'
			+'.tagCloud6{font-size: 180%;}\n'
			+'.tagCloud7{font-size: 200%;}\n'
			+'.tagCloud8{font-size: 220%;}\n'
			+'.tagCloud9{font-size: 240%;}\n'
			+'/*}}}*/\n';
            
		setStylesheet(store.getTiddlerText('StyleSheetTagCloud'),'tagCloudsStyles');
	},
    
    // get list of links to existing tiddlers and shadows
	getLinks: function(tiddler) { 
    
		if (!tiddler.linksUpdated) tiddler.changed();
		var list=[]; for (var i=0; i<tiddler.links.length; i++) {
			var title=tiddler.links[i];
			if (store.isShadowTiddler(title)||store.tiddlerExists(title))
				list.push(title);
		}
		return list;
	
    },
	handler: function(place,macroName,params) {
    
		// unpack params
		var inc=[]; var ex=[]; var limit=0; var action='popup';
		var links=(params[0]&&params[0].toLowerCase()=='links'); if (links) params.shift();
		var refs=(params[0]&&params[0].toLowerCase()=='references'); if (refs) params.shift();
		if (params[0]&&params[0].substr(0,7).toLowerCase()=='action:')
			action=params.shift().substr(7).toLowerCase();
		if (params[0]&&params[0].substr(0,6).toLowerCase()=='limit:')
			limit=parseInt(params.shift().substr(6));
		while (params.length) {
			if (params[0].substr(0,1)=='+') { // read taglist from tiddler
				inc=inc.concat(store.getTiddlerText(params[0].substr(1),'').readBracketedList());
			} else if (params[0].substr(0,1)=='-') { // exclude taglist from tiddler
				ex=ex.concat(store.getTiddlerText(params[0].substr(1),'').readBracketedList());
			} else if (params[0].substr(0,1)=='=') { // get tag list using tagged tags
				var tagged=store.getTaggedTiddlers(params[0].substr(1));
				for (var t=0; t<tagged.length; t++) inc.push(tagged[t].title);
			} else ex.push(params[0]); // exclude params
			params.shift();
		}
        
		// get all items, include/exclude specific items
		var items=[];
		var list=(links||refs)?store.getTiddlers('title','excludeLists'):store.getTags();
		for (var t=0; t<list.length; t++) {
			var title=(links||refs)?list[t].title:list[t][0];
			if (links)	var count=this.getLinks(list[t]).length;
			else if (refs)	var count=store.getReferringTiddlers(title).length;
			else 		var count=list[t][1];
			if ((!inc.length||inc.contains(title))&&(!ex.length||!ex.contains(title)))
				items.push({ title:title, count:count });
		}
		if(!items.length) return;
        
		// sort by decending count, limit results (optional)
		items=items.sort(function(a,b){return(a.count==b.count)?0:(a.count>b.count?-1:1);});
		while (limit && items.length>limit) items.pop();
        
		// find min/max and group size
		var most=items[0].count;
		var least=items[items.length-1].count;
		var groupSize=(most-least+1)/this.groups;
        
		// sort by title and draw the cloud of items
		items=items.sort(function(a,b){return(a.title==b.title)?0:(a.title>b.title?1:-1);});
		var cloudWrapper = createTiddlyElement(place,'div',null,'tagCloud',null);
        
		for (var t=0; t<items.length; t++) {
			cloudWrapper.appendChild(document.createTextNode(' '));
			var group=Math.ceil((items[t].count-least)/groupSize)||1;
			var className='tagCloudtag tagCloud'+group;
			var tip=refs?this.refstip:links?this.linkstip:this.tagstip;
			tip=tip.format([items[t].title,items[t].count]);
            
            // TAG/LINK/REFERENCES GOTO
			if (action=='goto') 
            { 
				var btn=createTiddlyLink(cloudWrapper,items[t].title,true,className);
				btn.title=tip;
				btn.style.fontWeight='normal';
			} 
            
            // TAG POPUP
            else if (!links&&!refs) 
            { 
				var btn=createTiddlyButton(cloudWrapper,items[t].title,tip,elnbOnClickTag,className);
				btn.setAttribute('tag',items[t].title);
			} 
            
             // LINK/REFERENCES POPUP
            else 
            {
				var btn=createTiddlyButton(cloudWrapper,items[t].title,tip,
					function(ev) { var e=ev||window.event; var cmt=config.macros.cloud;
						var popup = Popup.create(this);
						var title = this.getAttribute('tiddler');
						var count = this.getAttribute('count');
						var refs  = this.getAttribute('refs')=='T';
						var links = this.getAttribute('links')=='T';
						var label = (refs?cmt.refslabel:cmt.linkslabel).format([count]);
						createTiddlyLink(popup,title,true);
						createTiddlyText(popup,label);
						createTiddlyElement(popup,'hr');
                        
						if (refs) {
							popup.setAttribute('tiddler',title);
							config.commands.references.handlePopup(popup,title);
						}
                        
						if (links) {
							var tiddler = store.fetchTiddler(title);
							var links=config.macros.cloud.getLinks(tiddler);
							for(var i=0;i<links.length;i++)
								createTiddlyLink(createTiddlyElement(popup,'li'),
									links[i],true);
						}
                        
						Popup.show();
						e.cancelBubble=true; if(e.stopPropagation) e.stopPropagation();
						return false;
					}, className);
                    
				btn.setAttribute('tiddler',items[t].title);
				btn.setAttribute('count',items[t].count);
				btn.setAttribute('refs',refs?'T':'F');
				btn.setAttribute('links',links?'T':'F');
				btn.title=tip;
			}
		}
	}
};
//}}}