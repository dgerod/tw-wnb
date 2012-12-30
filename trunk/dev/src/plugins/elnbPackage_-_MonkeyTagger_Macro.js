/***
| Name:|''monkeyTagger''|
| Created by:|SaqImtiaz|
| Location:|http://tw.lewcid.org/|
| Version:|0.9 (08-Apr-2006)|
| Requires:|~TW2.07|

!About:
*an adaptation of TagAdderMacro for monkeyGTD and tagglytagging user, but could be useful to just about anyone!
*{{{<<monkeyTagger Project>>}}} gives a drop down list of all tags, tagged with Project.
*The list allows toggling of tags on the current tiddler.
*logging options for task management.

!Demo:
<<monkeyTagger Status>>

!Installation:
*Copy this tiddler to your TW with the systemConfig tag
*either copy the following to your ViewTemplate:
{{{<div class='tagged' macro='monkeyTagger tagToTrack'></div>}}}
or
*better yet, define your own toolbar class and add as many as you need to create a nice toolbar.
Eg:
{{{<div class='toolbar' >

<span style="padding-right:0.15em;" macro='monkeyTagger Project'></span>
<span style="padding-right:0.15em;" macro='monkeyTagger Status'></span>
<span macro='toolbar -closeTiddler closeOthers +editTiddler permalink references jump'></span>
</div>}}}
 (adjust padding to taste)

!Usage:

''Syntax:''
|>|{{{<<monkeyTagger source:"sourcetag" label:"customlabel" logging:"true/false" anchor:"anchortext"  arrow:"true/false">>}}}|
|label:|quoted text to use as a customlabel|
|arrow:|add arrow to custom label, values are "true" or "false"|
|anchor:|quoted text to specify where to add logging text|
|logging:|enable logging of tags added (for task management), values are "true" or "false"|

the only parameter you ''have'' to pass is the source. When passing only one parameter, you can write either something like:
{{{<<monkeyTagger "Project">>}}} or {{{<<monkeyTagger source:"Project">>}}} for <<monkeyTagger Project>>

All other parameters are optional, and can be written in any order.

''Defaults:''
|label:|default label if not specified = source tag + arrow|
|arrow:|true |
|logging:|false |
|anchor:|none used by default, logging text added to end of tiddler |

''Examples:''
|custom label| {{{<<monkeyTagger source:"Project" label:"customlabel">>}}} |<<monkeyTagger source:"Project" label:"customlabel">>|
|custom label without arrow| {{{<<monkeyTagger source:"Project" label:"customlabel" arrow:"false">>}}} |<<monkeyTagger source:"Project" label:"customlabel" arrow:"false">>|
|logging enabled| {{{<<monkeyTagger source:"Project" logging:"true"}}} |<<monkeyTagger source:"Project" logging:"true">>|
|logging enabled with anchor text|{{{<<monkeyTagger source:"Project" logging:"true" anchor:"anchortext"}}} |<<monkeyTagger source:"Project" logging:"true" anchor:"anchortext">>|

''Tips:''
*Make sure your anchor text doesn't occur more than once in every tiddler, as the first instance will be used.
*I recommend using something like {{{/%StatusLog%/}}} as an invisible anchor.
*Use a tag based template, and add monkeyTagger macro's with logging enabled to the toolbar in just your taskmanagement templates.

!To Do:
*add sorting options if requested.
*''add exclude tag feature''!

!History
*Version 0.9: 
**changed to named parameters to make it more user friendly
**added option to disable/enable dropdown arrow in custom labels
**added logging option with anchor text.

!CODE
***/
//{{{

config.macros.monkeyTagger= {};
//config.macros.monkeyTagger.dropdownchar = (document.all?"?":"?"); // the fat one is the only one that works in IE
config.macros.monkeyTagger.dropdownchar = "?"; // uncomment previous line and comment this for smaller version in FF
config.macros.monkeyTagger.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
 var nAV = paramString.parseParams('test', null, true);

 if ((nAV[0].arrow)&&(nAV[0].arrow[0])=='false')
    var arrow=': ';
 else
     var arrow=': '+ config.macros.monkeyTagger.dropdownchar;

 if((nAV[0].source)&&(nAV[0].source[0])!='.')
        {var tagToTrack = nAV[0].source[0]}
 else if(params[0]&&(params[0]!='.'))
      {var tagToTrack = params[0]}
 else
       {return false;};
 var monkeylabel = ((nAV[0].label)&&(nAV[0].label[0])!='.')?nAV[0].label[0]+arrow: tagToTrack+arrow;
 var logmode = ((nAV[0].logging)&&(nAV[0].logging[0])!='.')?nAV[0].logging[0]: "false";
 if ((nAV[0].anchor)&&(nAV[0].anchor[0])!='.')
    var anchor = nAV[0].anchor[0];
 var monkeytooltip=tagToTrack + ' :';


     if(tiddler instanceof Tiddler) {
	  	var title = tiddler.title;

                var addcomment = function(tiddler,newTag) {
                    var now = new Date();
                    var timeFormat= 'DD/0MM/YY 0hh:0mm';
                    var formattednow= now.formatString(timeFormat);
                    var txt="\n*''"+tagToTrack+"'' set as ''"+newTag+"'' on "+formattednow;
                    if (anchor && anchor!='.')
                       {var pos=tiddler.text.indexOf(anchor);
                       if (pos!=-1) {pos=pos + anchor.length}
                       else if (pos==-1) {pos=tiddler.text.length}}
                    else if (!anchor){var pos = tiddler.text.length;};

                    tiddler.set(null,tiddler.text.substr(0,pos)+txt+tiddler.text.substr(pos));
                    story.refreshTiddler(tiddler.title,null,true);
                    return false;
                }

                var ontagclick = function(e) {
                    if (!e) var e = window.event;
                    var tag = this.getAttribute("tag");
                    var t=store.getTiddler(title);
                    var thistiddlertags = story.getTiddlerField(title, 'tags').value.readBracketedList();
                    if (!t || !t.tags) return;
                    if (thistiddlertags.find(tag)==null) {
                       story.setTiddlerTag(title,tag,true);
                       if (logmode=="true") {
                          addcomment(t,tag);
                       }
                    }
                    else {
                       story.setTiddlerTag(title,tag,false);
                    }
                    return false;
                };

                var onclick = function(e) {
                    if (!e) var e = window.event;
                    var popup = Popup.create(this);
                    var thistiddler=store.getTiddler(title);

                    var thistiddlertags = story.getTiddlerField(title, 'tags').value.readBracketedList();

                    var taggedarray = new Array();
                    var tagslabel = new Array();

                    var taggedtiddlers = store.getTaggedTiddlers(tagToTrack);
                    for (var t=0; t<taggedtiddlers.length; t++){
                        var taggedtitle= ((taggedtiddlers[t]).title);
                        taggedarray.push(taggedtitle);}

                    for (var t=0; t<taggedarray.length; t++){
                        var temptag = taggedarray[t];
                        if (thistiddlertags.find(temptag)==null) {
                           var temptag='[ ] '+ temptag;
                        }
                        else {
                           var temptag ='[x] '+ temptag;
                        }
                        tagslabel.push(temptag);
                    }

                    if(tagslabel.length == 0)
                       createTiddlyText(createTiddlyElement(popup,"li"),('no '+tagToTrack));
                    for (var t=0; t<tagslabel.length; t++)
                    {
                       var theTag = createTiddlyButton(createTiddlyElement(popup,"li"),tagslabel[t],("toggle '"+ ([taggedarray[t]]))+"'",ontagclick);
                       theTag.setAttribute("tag",taggedarray[t]);
                    }
       Popup.show(popup,false);
       e.cancelBubble = true;
       if (e.stopPropagation) e.stopPropagation();
       return(false);
};
 //createTiddlyButton(place,monkeylabel,monkeylabel,onclick);

var createdropperButton = function(place){
var sp = createTiddlyElement(place,"span",null,"monkeytaggerbutton");
var theDropDownBtn = createTiddlyButton(sp,monkeylabel,monkeytooltip,onclick);
};

createdropperButton(place);
 }
};
setStylesheet(
 ".toolbar .monkeytaggerbutton {margin-right:0em; border:0px solid #fff; padding:0px; padding-right:0px; padding-left:0px;}\n"+
 ".monkeytaggerbutton a.button {padding:2px; padding-left:2px; padding-right:2px;}\n"+
// ".monkeytaggerbutton {font-size:130%;}\n"+
//".monkeytaggerbutton .button {color:#703;}\n"+
 "",

"MonkeyTaggerStyles");

// Find an entry in an array. Returns the array index or null
// @Deprecated: Use indexOf instead
Array.prototype.find = function(item)
{
	var i = this.indexOf(item);
	return i == -1 ? null : i;
};


//}}}