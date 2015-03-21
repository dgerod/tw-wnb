/***
|''Name:''|IntelliTaggerPlugin|
|''Version:''|1.0.2 (2007-07-25)|
|''Type:''|plugin|
|''Source:''|http://tiddlywiki.abego-software.de/#IntelliTaggerPlugin|
|''Author:''|Udo Borkowski (ub [at] abego-software [dot] de)|
|''Documentation:''|[[IntelliTaggerPlugin Documentation]]|
|''~SourceCode:''|[[IntelliTaggerPlugin SourceCode]]|
|''Licence:''|[[BSD open source license (abego Software)]]|
|''~CoreVersion:''|2.0.8|
|''Browser:''|Firefox 1.5.0.2 or better|
***/
/***
!Version History
* 1.0.2 (2007-07-25): 
** Feature: "Return" key may be used to accept first tag suggestion (beside "Alt-1")
** Bugfix: Keyboard shortcuts (Alt+3 etc.) shifted
* 1.0.1 (2007-05-18): Improvement: Speedup when using TiddlyWikis with many tags
* 1.0.0 (2006-04-26): Initial release

***/
// /%
if(!version.extensions.IntelliTaggerPlugin){if(!window.abego){window.abego={};}if(!abego.internal){abego.internal={};}abego.alertAndThrow=function(s){alert(s);throw s;};if(version.major<2){abego.alertAndThrow("Use TiddlyWiki 2.0.8 or better to run the IntelliTagger Plugin.");}version.extensions.IntelliTaggerPlugin={major:1,minor:0,revision:2,date:new Date(2007,6,25),type:"plugin",source:"http://tiddlywiki.abego-software.de/#IntelliTaggerPlugin",documentation:"[[IntelliTaggerPlugin Documentation]]",sourcecode:"[[IntelliTaggerPlugin SourceCode]]",author:"Udo Borkowski (ub [at] abego-software [dot] de)",licence:"[[BSD open source license (abego Software)]]",tiddlywiki:"Version 2.0.8 or better",browser:"Firefox 1.5.0.2 or better"};abego.createEllipsis=function(_2){var e=createTiddlyElement(_2,"span");e.innerHTML="&hellip;";};abego.isPopupOpen=function(_4){return _4&&_4.parentNode==document.body;};abego.openAsPopup=function(_5){if(_5.parentNode!=document.body){document.body.appendChild(_5);}};abego.closePopup=function(_6){if(abego.isPopupOpen(_6)){document.body.removeChild(_6);}};abego.getWindowRect=function(){return {left:findScrollX(),top:findScrollY(),height:findWindowHeight(),width:findWindowWidth()};};abego.moveElement=function(_7,_8,_9){_7.style.left=_8+"px";_7.style.top=_9+"px";};abego.centerOnWindow=function(_a){if(_a.style.position!="absolute"){throw "abego.centerOnWindow: element must have absolute position";}var _b=abego.getWindowRect();abego.moveElement(_a,_b.left+(_b.width-_a.offsetWidth)/2,_b.top+(_b.height-_a.offsetHeight)/2);};abego.isDescendantOrSelf=function(_c,e){while(e){if(_c==e){return true;}e=e.parentNode;}return false;};abego.toSet=function(_e){var _f={};for(var i=0;i<_e.length;i++){_f[_e[i]]=true;}return _f;};abego.filterStrings=function(_11,_12,_13){var _14=[];for(var i=0;i<_11.length&&(_13===undefined||_14.length<_13);i++){var s=_11[i];if(s.match(_12)){_14.push(s);}}return _14;};abego.arraysAreEqual=function(a,b){if(!a){return !b;}if(!b){return false;}var n=a.length;if(n!=b.length){return false;}for(var i=0;i<n;i++){if(a[i]!=b[i]){return false;}}return true;};abego.moveBelowAndClip=function(_1b,_1c){if(!_1c){return;}var _1d=findPosX(_1c);var _1e=findPosY(_1c);var _1f=_1c.offsetHeight;var _20=_1d;var _21=_1e+_1f;var _22=findWindowWidth();if(_22<_1b.offsetWidth){_1b.style.width=(_22-100)+"px";}var _23=_1b.offsetWidth;if(_20+_23>_22){_20=_22-_23-30;}if(_20<0){_20=0;}_1b.style.left=_20+"px";_1b.style.top=_21+"px";_1b.style.display="block";};abego.compareStrings=function(a,b){return (a==b)?0:(a<b)?-1:1;};abego.sortIgnoreCase=function(arr){var _27=[];var n=arr.length;for(var i=0;i<n;i++){var s=arr[i];_27.push([s.toString().toLowerCase(),s]);}_27.sort(function(a,b){return (a[0]==b[0])?0:(a[0]<b[0])?-1:1;});for(i=0;i<n;i++){arr[i]=_27[i][1];}};abego.getTiddlerField=function(_2d,_2e,_2f){var _30=document.getElementById(_2d.idPrefix+_2e);var e=null;if(_30!=null){var _32=_30.getElementsByTagName("*");for(var t=0;t<_32.length;t++){var c=_32[t];if(c.tagName.toLowerCase()=="input"||c.tagName.toLowerCase()=="textarea"){if(!e){e=c;}if(c.getAttribute("edit")==_2f){e=c;}}}}return e;};abego.setRange=function(_35,_36,end){if(_35.setSelectionRange){_35.setSelectionRange(_36,end);var max=0+_35.scrollHeight;var len=_35.textLength;var top=max*_36/len,bot=max*end/len;_35.scrollTop=Math.min(top,(bot+top-_35.clientHeight)/2);}else{if(_35.createTextRange!=undefined){var _3b=_35.createTextRange();_3b.collapse();_3b.moveEnd("character",end);_3b.moveStart("character",_36);_3b.select();}else{_35.select();}}};abego.internal.TagManager=function(){var _3c=null;var _3d=function(){if(_3c){return;}_3c={};store.forEachTiddler(function(_3e,_3f){for(var i=0;i<_3f.tags.length;i++){var tag=_3f.tags[i];var _42=_3c[tag];if(!_42){_42=_3c[tag]={count:0,tiddlers:{}};}_42.tiddlers[_3f.title]=true;_42.count+=1;}});};var _43=TiddlyWiki.prototype.saveTiddler;TiddlyWiki.prototype.saveTiddler=function(_44,_45,_46,_47,_48,_49){var _4a=this.fetchTiddler(_44);var _4b=_4a?_4a.tags:[];var _4c=(typeof _49=="string")?_49.readBracketedList():_49;_43.apply(this,arguments);if(!abego.arraysAreEqual(_4b,_4c)){abego.internal.getTagManager().reset();}};var _4d=TiddlyWiki.prototype.removeTiddler;TiddlyWiki.prototype.removeTiddler=function(_4e){var _4f=this.fetchTiddler(_4e);var _50=_4f&&_4f.tags.length>0;_4d.apply(this,arguments);if(_50){abego.internal.getTagManager().reset();}};this.reset=function(){_3c=null;};this.getTiddlersWithTag=function(tag){_3d();var _52=_3c[tag];return _52?_52.tiddlers:null;};this.getAllTags=function(_53){_3d();var _54=[];for(var i in _3c){_54.push(i);}for(i=0;_53&&i<_53.length;i++){_54.pushUnique(_53[i],true);}abego.sortIgnoreCase(_54);return _54;};this.getTagInfos=function(){_3d();var _56=[];for(var _57 in _3c){_56.push([_57,_3c[_57]]);}return _56;};var _58=function(a,b){var a1=a[1];var b1=b[1];var d=b[1].count-a[1].count;return d!=0?d:abego.compareStrings(a[0].toLowerCase(),b[0].toLowerCase());};this.getSortedTagInfos=function(){_3d();var _5e=this.getTagInfos();_5e.sort(_58);return _5e;};this.getPartnerRankedTags=function(_5f){var _60={};for(var i=0;i<_5f.length;i++){var _62=this.getTiddlersWithTag(_5f[i]);for(var _63 in _62){var _64=store.getTiddler(_63);if(!(_64 instanceof Tiddler)){continue;}for(var j=0;j<_64.tags.length;j++){var tag=_64.tags[j];var c=_60[tag];_60[tag]=c?c+1:1;}}}var _68=abego.toSet(_5f);var _69=[];for(var n in _60){if(!_68[n]){_69.push(n);}}_69.sort(function(a,b){var d=_60[b]-_60[a];return d!=0?d:abego.compareStrings(a.toLowerCase(),b.toLowerCase());});return _69;};};abego.internal.getTagManager=function(){if(!abego.internal.gTagManager){abego.internal.gTagManager=new abego.internal.TagManager();}return abego.internal.gTagManager;};(function(){var _6e=2;var _6f=1;var _70=30;var _71;var _72;var _73;var _74;var _75;var _76;if(!abego.IntelliTagger){abego.IntelliTagger={};}var _77=function(){return _72;};var _78=function(tag){return _75[tag];};var _7a=function(s){var i=s.lastIndexOf(" ");return (i>=0)?s.substr(0,i):"";};var _7d=function(_7e){var s=_7e.value;var len=s.length;return (len>0&&s[len-1]!=" ");};var _81=function(_82){var s=_82.value;var len=s.length;if(len>0&&s[len-1]!=" "){_82.value+=" ";}};var _85=function(tag,_87,_88){if(_7d(_87)){_87.value=_7a(_87.value);}story.setTiddlerTag(_88.title,tag,0);_81(_87);abego.IntelliTagger.assistTagging(_87,_88);};var _89=function(n){if(_76&&_76.length>n){return _76[n];}return (_74&&_74.length>n)?_74[n]:null;};var _8b=function(n,_8d,_8e){var _8f=_89(n);if(_8f){_85(_8f,_8d,_8e);}};var _90=function(_91){var pos=_91.value.lastIndexOf(" ");var _93=(pos>=0)?_91.value.substr(++pos,_91.value.length):_91.value;return new RegExp(_93.escapeRegExp(),"i");};var _94=function(_95,_96){var _97=0;for(var i=0;i<_95.length;i++){if(_96[_95[i]]){_97++;}}return _97;};var _99=function(_9a,_9b,_9c){var _9d=1;var c=_9a[_9b];for(var i=_9b+1;i<_9a.length;i++){if(_9a[i][1].count==c){if(_9a[i][0].match(_9c)){_9d++;}}else{break;}}return _9d;};var _a0=function(_a1,_a2){var _a3=abego.internal.getTagManager().getSortedTagInfos();var _a4=[];var _a5=0;for(var i=0;i<_a3.length;i++){var c=_a3[i][1].count;if(c!=_a5){if(_a2&&(_a4.length+_99(_a3,i,_a1)>_a2)){break;}_a5=c;}if(c==1){break;}var s=_a3[i][0];if(s.match(_a1)){_a4.push(s);}}return _a4;};var _a9=function(_aa,_ab){return abego.filterStrings(abego.internal.getTagManager().getAllTags(_ab),_aa);};var _ac=function(){if(!_71){return;}var _ad=store.getTiddlerText("IntelliTaggerMainTemplate");if(!_ad){_ad="<b>Tiddler IntelliTaggerMainTemplate not found</b>";}_71.innerHTML=_ad;applyHtmlMacros(_71,null);refreshElements(_71,null);};var _ae=function(e){if(!e){var e=window.event;}var tag=this.getAttribute("tag");if(_73){_73.call(this,tag,e);}return false;};var _b2=function(_b3){createTiddlyElement(_b3,"span",null,"tagSeparator"," | ");};var _b4=function(_b5,_b6,_b7,_b8,_b9){if(!_b6){return;}var _ba=_b8?abego.toSet(_b8):{};var n=_b6.length;var c=0;for(var i=0;i<n;i++){var tag=_b6[i];if(_ba[tag]){continue;}if(c>0){_b2(_b5);}if(_b9&&c>=_b9){abego.createEllipsis(_b5);break;}c++;var _bf="";var _c0=_b5;if(_b7<10){_c0=createTiddlyElement(_b5,"span",null,"numberedSuggestion");_b7++;var key=_b7<10?""+(_b7):"0";createTiddlyElement(_c0,"span",null,"suggestionNumber",key+") ");var _c2=_b7==1?"Return or ":"";_bf=" (Shortcut: %1Alt-%0)".format([key,_c2]);}var _c3=config.views.wikified.tag.tooltip.format([tag]);var _c4=(_78(tag)?"Remove tag '%0'%1":"Add tag '%0'%1").format([tag,_bf]);var _c5="%0; Shift-Click: %1".format([_c4,_c3]);var btn=createTiddlyButton(_c0,tag,_c5,_ae,_78(tag)?"currentTag":null);btn.setAttribute("tag",tag);}};var _c7=function(){if(_71){window.scrollTo(0,ensureVisible(_71));}if(_77()){window.scrollTo(0,ensureVisible(_77()));}};var _c8=function(e){if(!e){var e=window.event;}if(!_71){return;}var _cb=resolveTarget(e);if(_cb==_77()){return;}if(abego.isDescendantOrSelf(_71,_cb)){return;}abego.IntelliTagger.close();};addEvent(document,"click",_c8);var _cc=Story.prototype.gatherSaveFields;Story.prototype.gatherSaveFields=function(e,_ce){_cc.apply(this,arguments);var _cf=_ce.tags;if(_cf){_ce.tags=_cf.trim();}};var _d0=function(_d1){story.focusTiddler(_d1,"tags");var _d2=abego.getTiddlerField(story,_d1,"tags");if(_d2){var len=_d2.value.length;abego.setRange(_d2,len,len);window.scrollTo(0,ensureVisible(_d2));}};var _d4=config.macros.edit.handler;config.macros.edit.handler=function(_d5,_d6,_d7,_d8,_d9,_da){_d4.apply(this,arguments);var _db=_d7[0];if((_da instanceof Tiddler)&&_db=="tags"){var _dc=_d5.lastChild;_dc.onfocus=function(e){abego.IntelliTagger.assistTagging(_dc,_da);setTimeout(function(){_d0(_da.title);},100);};_dc.onkeyup=function(e){if(!e){var e=window.event;}if(e.altKey&&!e.ctrlKey&&!e.metaKey&&(e.keyCode>=48&&e.keyCode<=57)){_8b(e.keyCode==48?9:e.keyCode-49,_dc,_da);}else{if(e.ctrlKey&&e.keyCode==32){_8b(0,_dc,_da);}}if(!e.ctrlKey&&(e.keyCode==13||e.keyCode==10)){_8b(0,_dc,_da);}setTimeout(function(){abego.IntelliTagger.assistTagging(_dc,_da);},100);return false;};_81(_dc);}};var _e0=function(e){if(!e){var e=window.event;}var _e3=resolveTarget(e);var _e4=_e3.getAttribute("tiddler");if(_e4){story.displayTiddler(_e3,_e4,"IntelliTaggerEditTagsTemplate",false);_d0(_e4);}return false;};var _e5=config.macros.tags.handler;config.macros.tags.handler=function(_e6,_e7,_e8,_e9,_ea,_eb){_e5.apply(this,arguments);abego.IntelliTagger.createEditTagsButton(_eb,createTiddlyElement(_e6.lastChild,"li"));};var _ec=function(){if(_71&&_72&&!abego.isDescendantOrSelf(document,_72)){abego.IntelliTagger.close();}};setInterval(_ec,100);abego.IntelliTagger.displayTagSuggestions=function(_ed,_ee,_ef,_f0,_f1){_74=_ed;_75=abego.toSet(_ee);_76=_ef;_72=_f0;_73=_f1;if(!_71){_71=createTiddlyElement(document.body,"div",null,"intelliTaggerSuggestions");_71.style.position="absolute";}_ac();abego.openAsPopup(_71);if(_77()){var w=_77().offsetWidth;if(_71.offsetWidth<w){_71.style.width=(w-2*(_6e+_6f))+"px";}abego.moveBelowAndClip(_71,_77());}else{abego.centerOnWindow(_71);}_c7();};abego.IntelliTagger.assistTagging=function(_f3,_f4){var _f5=_90(_f3);var s=_f3.value;if(_7d(_f3)){s=_7a(s);}var _f7=s.readBracketedList();var _f8=_f7.length>0?abego.filterStrings(abego.internal.getTagManager().getPartnerRankedTags(_f7),_f5,_70):_a0(_f5,_70);abego.IntelliTagger.displayTagSuggestions(_a9(_f5,_f7),_f7,_f8,_f3,function(tag,e){if(e.shiftKey){onClickTag.call(this,e);}else{_85(tag,_f3,_f4);}});};abego.IntelliTagger.close=function(){abego.closePopup(_71);_71=null;return false;};abego.IntelliTagger.createEditTagsButton=function(_fb,_fc,_fd,_fe,_ff,id,_101){if(!_fd){_fd="[edit]";}if(!_fe){_fe="Edit the tags";}if(!_ff){_ff="editTags";}var _102=createTiddlyButton(_fc,_fd,_fe,_e0,_ff,id,_101);_102.setAttribute("tiddler",(_fb instanceof Tiddler)?_fb.title:String(_fb));return _102;};abego.IntelliTagger.getSuggestionTagsMaxCount=function(){return 100;};config.macros.intelliTagger={label:"intelliTagger",handler:function(_103,_104,_105,_106,_107,_108){var _109=_107.parseParams("list",null,true);var _10a=_109[0]["action"];for(var i=0;_10a&&i<_10a.length;i++){var _10c=_10a[i];var _10d=config.macros.intelliTagger.subhandlers[_10c];if(!_10d){abego.alertAndThrow("Unsupported action '%0'".format([_10c]));}_10d(_103,_104,_105,_106,_107,_108);}},subhandlers:{showTags:function(_10e,_10f,_110,_111,_112,_113){_b4(_10e,_74,_76?_76.length:0,_76,abego.IntelliTagger.getSuggestionTagsMaxCount());},showFavorites:function(_114,_115,_116,_117,_118,_119){_b4(_114,_76,0);},closeButton:function(_11a,_11b,_11c,_11d,_11e,_11f){var _120=createTiddlyButton(_11a,"close","Close the suggestions",abego.IntelliTagger.close);},version:function(_121){var t="IntelliTagger %0.%1.%2".format([version.extensions.IntelliTaggerPlugin.major,version.extensions.IntelliTaggerPlugin.minor,version.extensions.IntelliTaggerPlugin.revision]);var e=createTiddlyElement(_121,"a");e.setAttribute("href","http://tiddlywiki.abego-software.de/#IntelliTaggerPlugin");e.innerHTML="<font color=\"black\" face=\"Arial, Helvetica, sans-serif\">"+t+"<font>";},copyright:function(_124){var e=createTiddlyElement(_124,"a");e.setAttribute("href","http://tiddlywiki.abego-software.de");e.innerHTML="<font color=\"black\" face=\"Arial, Helvetica, sans-serif\">&copy; 2006-2007 <b><font color=\"red\">abego</font></b> Software<font>";}}};})();config.shadowTiddlers["IntelliTaggerStyleSheet"]="/***\n"+"!~IntelliTagger Stylesheet\n"+"***/\n"+"/*{{{*/\n"+".intelliTaggerSuggestions {\n"+"\tposition: absolute;\n"+"\twidth: 600px;\n"+"\n"+"\tpadding: 2px;\n"+"\tlist-style: none;\n"+"\tmargin: 0;\n"+"\n"+"\tbackground: #eeeeee;\n"+"\tborder: 1px solid DarkGray;\n"+"}\n"+"\n"+".intelliTaggerSuggestions .currentTag   {\n"+"\tfont-weight: bold;\n"+"}\n"+"\n"+".intelliTaggerSuggestions .suggestionNumber {\n"+"\tcolor: #808080;\n"+"}\n"+"\n"+".intelliTaggerSuggestions .numberedSuggestion{\n"+"\twhite-space: nowrap;\n"+"}\n"+"\n"+".intelliTaggerSuggestions .intelliTaggerFooter {\n"+"\tmargin-top: 4px;\n"+"\tborder-top-width: thin;\n"+"\tborder-top-style: solid;\n"+"\tborder-top-color: #999999;\n"+"}\n"+".intelliTaggerSuggestions .favorites {\n"+"\tborder-bottom-width: thin;\n"+"\tborder-bottom-style: solid;\n"+"\tborder-bottom-color: #999999;\n"+"\tpadding-bottom: 2px;\n"+"}\n"+"\n"+".intelliTaggerSuggestions .normalTags {\n"+"\tpadding-top: 2px;\n"+"}\n"+"\n"+".intelliTaggerSuggestions .intelliTaggerFooter .button {\n"+"\tfont-size: 10px;\n"+"\n"+"\tpadding-left: 0.3em;\n"+"\tpadding-right: 0.3em;\n"+"}\n"+"\n"+"/*}}}*/\n";config.shadowTiddlers["IntelliTaggerMainTemplate"]="<!--\n"+"{{{\n"+"-->\n"+"<div class=\"favorites\" macro=\"intelliTagger action: showFavorites\"></div>\n"+"<div class=\"normalTags\" macro=\"intelliTagger action: showTags\"></div>\n"+"<!-- The Footer (with the Navigation) ============================================ -->\n"+"<table class=\"intelliTaggerFooter\" border=\"0\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"><tbody>\n"+"  <tr>\n"+"\t<td align=\"left\">\n"+"\t\t<span macro=\"intelliTagger action: closeButton\"></span>\n"+"\t</td>\n"+"\t<td align=\"right\">\n"+"\t\t<span macro=\"intelliTagger action: version\"></span>, <span macro=\"intelliTagger action: copyright \"></span>\n"+"\t</td>\n"+"  </tr>\n"+"</tbody></table>\n"+"<!--\n"+"}}}\n"+"-->\n";config.shadowTiddlers["IntelliTaggerEditTagsTemplate"]="<!--\n"+"{{{\n"+"-->\n"+"<div class='toolbar' macro='toolbar +saveTiddler -cancelTiddler'></div>\n"+"<div class='title' macro='view title'></div>\n"+"<div class='tagged' macro='tags'></div>\n"+"<div class='viewer' macro='view text wikified'></div>\n"+"<div class='toolbar' macro='toolbar +saveTiddler -cancelTiddler'></div>\n"+"<div class='editor' macro='edit tags'></div><div class='editorFooter'><span macro='message views.editor.tagPrompt'></span><span macro='tagChooser'></span></div>\n"+"<!--\n"+"}}}\n"+"-->\n";config.shadowTiddlers["BSD open source license (abego Software)"]="See [[Licence|http://tiddlywiki.abego-software.de/#%5B%5BBSD%20open%20source%20license%5D%5D]].";config.shadowTiddlers["IntelliTaggerPlugin Documentation"]="[[Documentation on abego Software website|http://tiddlywiki.abego-software.de/doc/IntelliTagger.pdf]].";config.shadowTiddlers["IntelliTaggerPlugin SourceCode"]="[[Plugin source code on abego Software website|http://tiddlywiki.abego-software.de/archive/IntelliTaggerPlugin/Plugin-IntelliTagger-src.1.0.2.js]]\n";(function(){var _126=restart;restart=function(){setStylesheet(store.getTiddlerText("IntelliTaggerStyleSheet"),"IntelliTaggerStyleSheet");_126.apply(this,arguments);};})();}
// %/