/***
|Name:|TrashPlugin|
|Version:|1.2.0|
|Source:|http://www.TiddlyTools.com/#TrashPlugin|
|Author:|Eric Shulman|
|OriginalSource:|http://ido-xp.tiddlyspot.com/#TrashPlugin|
|OriginalAuthor:|Ido Magal (idoXatXidomagalXdotXcom)|
|License:|[[BSD open source license]]|
|CoreVersion:|2.1.0|
|Description|add 'Trash' tag to tiddlers instead of deleting them|
!!!!!Documentation
<<<
When TrashPlugin is installed and you click on the 'delete' command in the tiddler toolbar, rather than directly removing the tiddler from the system, it will be tagged with the following tags:
{{{
Trash excludeLists excludeMissing excludeSearch systemConfigDisable
}}}
As a result, although the tiddler still exists within the document, it is ''hidden from view and will not be searched or invoked as a plugin.''
*{{block{
To view a list of all tiddlers tagged with {{{Trash}}}, simply open the [[Trash]] tiddler (aka, the "trash can").}}}
*{{block{
To reclaim a tiddler from the [[Trash]], click on a title in the trash can to open that tiddler.  Then, edit it to remove the Trash tag (as well as the other tags noted above).}}}
*{{block{
To empty the trash can (i.e. actually //delete// the tiddlers), click on the ''//"empty trash"//'' button that appears in the [[Trash]] tiddler.  You can also add this button to your [[SideBarOptions]] or any other desired location by using the following macro:
{{{
<<emptyTrash>>
}}}
}}}
*{{block{
To ''bypass the trash can'' and use the normal delete handling (with the usual confirmation messages, if chkConfirmDelete is enabled), hold CTRL while clicking 'delete'}}}
*{{block{
To ''bypass both the trash can //and// the confirmation message'' and //immediately delete// the tiddler without any further interaction, hold CTRL+SHIFT while clicking 'delete'}}}
<<<
!!!!!Revisions
<<<
2009.05.20 [1.2.0] documentation rewrite and code cleanup/reduction
2009.05.12 [1.1.0.5] refactored code to add entry point: {{{config.commands.deleteTiddler.sendToTrash(title)}}}
2008.11.14 [1.1.0.4] added SHIFT-CLICK = bypass trash and delete immediately WITHOUT CONFIRMATION
2008.10.14 [1.1.0.3] return FALSE from emptyTrash() handler (fixes IE page transition error)
2008.05.18 [1.1.0.2] when creating the Trash tiddler, pass an empty tags array [] instead of a null value, so other plugins (e.g., InstantTimestampPlugin) won't fail
2006.12.21 [1.1.0.1] only call setDirty() when actually removing tiddlers from trash
2006.12.12 [1.1.0.0] added movedMsg (feedback when tiddler is tagged as Trash).   Make sure tiddler actually exists before tagging it with 'Trash'.  Fetch correct tiddler before checking for 'systemConfig' tag
2006.12.11 [1.0.3.1] Don't create Trash tiddler until needed. Remove Trash tiddler when no trash remains. Don't tag Trash tiddler with 'TrashPlugin'. Moved all user-visible strings to variables so they can be translated by 'lingo' plugins. Use displayMessage() instead of alert()
2006.12.11 [1.0.3] Fixed broken reference to core deleteTiddler. Now storing reference to core deleteTiddler in emptyTrash macro. Reduced deleteTiddler hijacking to only the handler.
2006.12.11 [1.0.2] EmptyTrash now uses removeTiddler instead of deleteTiddler. Supports trashing systemConfig tiddlers (adds systemConfigDisable tag).
2006.12.10 [1.0.1] Replaced TW version with proper Core reference. Now properly hijacking deleteTiddler command.
2006.12.10 [1.0.0] First draft.
<<<
!!!!!Code
***/
//{{{
version.extensions.TrashPlugin= {major: 1, minor: 2, revision: 0, date: new Date(2009,5,20)};
//}}}
//{{{
config.macros.emptyTrash = {
	tag: 'Trash',
	movedMsg: "'%0' has been tagged as %1",
	label: 'empty trash',
	tooltip: 'Delete all items tagged as %0',
	tooltipOlder: 'Delete items tagged as %0 that are older than %1 days old',
	emptyMsg: 'The trash is empty',
	noneToDeleteMsg: 'There are no items in the trash older than %0 days',
	confirmMsg: "The following tiddlers will be deleted:\n\n'%0'\n\nOK to proceed?",
	deletedMsg: "Deleted '%0'",
	handler: function ( place,macroName,params,wikifier,paramString,tiddler ) {
		var namedParams = (paramString.parseParams(daysOld))[0];
		var daysOld = namedParams['daysOld'] ? namedParams['daysOld'][0] : 0; // default
		var buttonTitle = namedParams['title'] ? namedParams['title'][0] : this.label;
		var buttonTip=this.tooltip.format([this.tag])
		if (daysOld) buttonTip=this.tooltipOlder.format([this.tag,daysOld])
		var b=createTiddlyButton(place,buttonTitle,buttonTip,this.emptyTrash);
		b.setAttribute('daysOld',daysOld);
	},
	emptyTrash: function() {
		var cme=config.macros.emptyTrash; // abbrev
		var daysOld=this.getAttribute('daysOld');
		var compareDate=new Date(); compareDate.setDate(compareDate.getDate()-daysOld);
		var collected=[];
		store.forEachTiddler(function(title,tiddler) {
			if (tiddler.isTagged(cme.tag) && tiddler.modified<compareDate)
				collected.push(title);
		});
		if (!collected.length)
			displayMessage(daysOld ? cme.noneToDeleteMsg.format([daysOld]) : cme.emptyMsg);
		else if (confirm(cme.confirmMsg.format([collected.join("', '")]))) {
			for (var i=0;i<collected.length;i++) {
				store.removeTiddler(collected[i]);
				store.setDirty(true);
				displayMessage(cme.deletedMsg.format([collected[i]]));
			}
		}
		if (!store.getTaggedTiddlers(cme.tag).length) // remove Trash if empty
			{ story.closeTiddler(cme.tag,true,false); store.removeTiddler(cme.tag); }
		else
			story.refreshTiddler(cme.tag,false,true); // refresh Trash if visible
		return false;
	}
}
//}}}
// // hijack delete command
//{{{
config.commands.deleteTiddler.orig_handler=config.commands.deleteTiddler.handler;
config.commands.deleteTiddler.handler=function(event,src,title) {
	// BYPASS TRASH: CTRL=normal delete, CTRL+SHIFT=without confirmation
	if (event.ctrlKey) {
		if (event.shiftKey) { var temp=config.options.chkConfirmDelete; config.options.chkConfirmDelete=false; }
		config.commands.deleteTiddler.orig_handler.apply(this,arguments);
		if (event.shiftKey) config.options.chkConfirmDelete=temp;
		story.refreshTiddler(config.macros.emptyTrash.tag,false,true);
		return false;
	}
	config.commands.deleteTiddler.sendToTrash(title);
	return false;
};

config.commands.deleteTiddler.sendToTrash = function(title) {
	var cme=config.macros.emptyTrash; // abbrev
	if (!store.tiddlerExists(title)) return; // make sure tiddler actually exists
	if (!store.tiddlerExists(cme.tag)) // make sure Trash tiddler exists
		store.saveTiddler(cme.tag,cme.tag,'<<emptyTrash>>','TrashPlugin',new Date(),[],{});
	store.setTiddlerTag(title,1,cme.tag);
	store.setTiddlerTag(title,1,'excludeLists');
	store.setTiddlerTag(title,1,'excludeMissing');
	store.setTiddlerTag(title,1,'excludeSearch');
	if (store.getTiddler(title).isTagged('systemConfig'))
		store.setTiddlerTag(title,1,'systemConfigDisable');
	story.closeTiddler(title,true);
	if(config.options.chkAutoSave) saveChanges();
	displayMessage(cme.movedMsg.format([title,cme.tag]));
	story.refreshTiddler(cme.tag,false,true);
};
//}}}