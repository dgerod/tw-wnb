/***
|''Name:''|extendRenameTag|
|''Version:''|1.0|
|''Author:''|Mike Praeuner|
|''Description:''|Provides rename tag function for tag drop down|
|''~TiddlyWiki:''|Version 2.0.8 or better|
|''Original Author:''|SaqImtiaz|
|''Original Source:''|http://tw.lewcid.org//#TaggerPlugin|
Note this plugin has been customized for this document and is a variant of the original source.
Please refer to the original plugin http://tw.lewcid.org//#TaggerPlugin for extended use.
DO NOT USE in the same document with TaggerPlugin (use one or the other)
***/
//{{{

elnbTiddlerSwapTag =  function (tiddler, oldTag, newTag){
                    for (var i = 0; i < tiddler.tags.length; i++)
			  if (tiddler.tags[i] == oldTag) {
				  tiddler.tags[i] = newTag;
				  return true;}
                         return false;
}

elnbRenameTag = function(e) {
                    var tag=this.getAttribute("tag");
                    var newtag=prompt("Rename tag '"+tag+"' to:",tag);

                    if ((newtag==tag)||(newtag==null)) {return false;}

                    if(store.tiddlerExists(newtag))
                               {if(confirm(config.messages.overwriteWarning.format([newtag.toString()])))
                                             story.closeTiddler(newtag,false,false);
                               else
                                             return null;}

                    tagged=store.getTaggedTiddlers(tag);
                    if (tagged.length!=0){
                          for (var j = 0; j < tagged.length; j++)
                              elnbTiddlerSwapTag(tagged[j],tag,newtag);}

                    if (store.tiddlerExists(tag))
                       {store.saveTiddler(tag,newtag);}
                    if (document.getElementById("tiddler"+tag))
                       {var oldTagTiddler =  document.getElementById(story.idPrefix + tag);
                       var before= story.positionTiddler(oldTagTiddler);
                       var place = document.getElementById(story.container);
                       story.closeTiddler(tag,false,false);
                       story.createTiddler(place,before,newtag,null);
                       story.saveTiddler(newtag);}
                    if(config.options.chkAutoSave)
                                                      saveChanges();
                    return false;
}
//}}}