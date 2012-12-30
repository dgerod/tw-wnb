/***
|''Name''|<...>|
|''Description''|<...>|
|''Author''|FND|
|''Version''|<#.#.#>|
|''Status''|<//unknown//; @@experimental@@; @@beta@@; //obsolete//; stable>|
|''Source''|http://devpad.tiddlyspot.com/#<...>|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5.0|
|''Requires''|<...>|
|''Keywords''|<...>|
{{{
<<randomTiddler "systemConfig">>
}}}
!Source Code
***/
//{{{
(function($) {

var macro = config.macros.randomTiddler = {
	locale: {
		label: "random",
		tooltip: "display a random tiddler"
	},

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var excludeTag = params[0] || "excludeLists";
		var btn = createTiddlyButton(place, this.locale.label,
			this.locale.tooltip, function() {});
		btn.onclick = null; // XXX: hacky, but createTiddlyButton wouldn't add href otherwise
		$(btn).data("excludeTag", excludeTag).click(this.onClick);;
	},
	onClick: function() {
		var btn = $(this);
		var excludeTag = btn.data("excludeTag");
		var tiddlers = store.getTiddlers();
		macro.displayRandomTiddler(tiddlers, excludeTag);
	},
	displayRandomTiddler: function(tiddlers, excludeTag) {
		var i = Math.floor(Math.random() * tiddlers.length);
		var tid = tiddlers[i];
		if(!tid.tags.contains(excludeTag)) {
			story.displayTiddler(place, tid);
		} else {
			this.displayRandomTiddler(tiddlers); // XXX: risks infinite recursion
		}
	}
};

})(jQuery);
//}}}