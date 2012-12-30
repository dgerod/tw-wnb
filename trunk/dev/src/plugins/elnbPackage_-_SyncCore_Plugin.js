/***
***/
//{{{

if( !version.extensions.elnb)
       version.extensions.elnb = {};

version.extensions.elnb.upgradeCore = {major: 1, minor: 0, revision: 0, date: new Date(2011,2,6)};  

//--
//-- 
//--

// The TW-eLNB core
var coreConn = config.extensions.elnb.elnbCore;

config.macros.elnbSync = {

        serverType: coreConn.serverType,
        serverHost: coreConn.serverHost,
        coreFile: coreConn.coreHost,

	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler'},
			{name: 'Server Type', field: 'serverType', title: "Server type", type: 'String'},
			{name: 'Server Host', field: 'serverHost', title: "Server host", type: 'String'},
			{name: 'Server Workspace', field: 'serverWorkspace', title: "Server workspace", type: 'String'},
			{name: 'Status', field: 'status', title: "Synchronisation status", type: 'String'},
			{name: 'Server URL', field: 'serverUrl', title: "Server URL", text: "View", type: 'Link'}
			],
		rowClasses: [
			],
		buttons: [
			{caption: "Sync these tiddlers", name: 'sync'}
			]},
	wizardTitle: "Synchronize with TW-eLNB core",
	step1Title: "Choose the tiddlers you want to synchronize",
	step1Html: "<input type='hidden' name='markList'></input>", // DO NOT TRANSLATE
	syncLabel: "sync",
	syncPrompt: "Sync these tiddlers",
	hasChanged: "Changed while unplugged",
	hasNotChanged: "Unchanged while unplugged",
	syncStatusList: {
		none: {text: "...", display:'none', className:'notChanged'},
		changedServer: {text: "New version on server", display:null, className:'changedServer'},
		changedLocally: {text: "Changed in local", display:null, className:'changedLocally'},
		changedBoth: {text: "Changed in local and new version on server", display:null, className:'changedBoth'},
		notFound: {text: "Not found on server", display:null, className:'notFound'},
		putToServer: {text: "Saved update on server", display:null, className:'putToServer'},
		gotFromServer: {text: "Retrieved update from server", display:null, className:'gotFromServer'}
		}
};

//--
//-- Sync macro
//--

// Sync state.
var currSync = null;

// sync macro
config.macros.elnbSync.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(!wikifier.isStatic)
		this.startSync(place);
};

config.macros.elnbSync.cancelSync = function()
{
	currSync = null;
};

config.macros.elnbSync.startSync = function(place)
{
	if(currSync)
		config.macros.elnbSync.cancelSync();
	currSync = {};
	currSync.syncList = this.getSyncableTiddlers();
	currSync.syncTasks = this.createSyncTasks(currSync.syncList);
	this.preProcessSyncableTiddlers(currSync.syncList);
	var wizard = new Wizard();
	currSync.wizard = wizard;
	wizard.createWizard(place,this.wizardTitle);
	wizard.addStep(this.step1Title,this.step1Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	currSync.listView = ListView.create(listWrapper,currSync.syncList,this.listViewTemplate);
	this.processSyncableTiddlers(currSync.syncList);
	wizard.setButtons([{caption: this.syncLabel, tooltip: this.syncPrompt, onClick: this.doSync}]);
};

config.macros.elnbSync.getSyncableTiddlers = function()
{
	var list = [];
	store.forEachTiddler(function(title,tiddler) {
		var syncItem = {};
                var thisMacro = config.macros.elnbSync;
		syncItem.serverType = tiddler.getServerType();
		syncItem.serverHost = tiddler.fields['server.host'];

		if(syncItem.serverType && syncItem.serverHost ==  thisMacro.serverHost) {
		//if(syncItem.serverType && syncItem.serverHost) {
                        syncItem.serverHost = thisMacro.coreFile;
                         
			syncItem.adaptor = new config.adaptors[syncItem.serverType];
			syncItem.serverHost = syncItem.adaptor.fullHostName(syncItem.serverHost);
			syncItem.serverWorkspace = tiddler.fields['server.workspace'];
			syncItem.tiddler = tiddler;
			syncItem.title = tiddler.title;
			syncItem.isTouched = tiddler.isTouched();
			syncItem.selected = syncItem.isTouched;
			
                        syncItem.syncStatus = thisMacro.syncStatusList[syncItem.isTouched ? "changedLocally" : "none"];
			//syncItem.syncStatus = thisMacro.syncStatusList["none"];

                        syncItem.status = syncItem.syncStatus.text;
			list.push(syncItem);
		}
		});
	list.sort(function(a,b) {return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1);});
	return list;
};

config.macros.elnbSync.preProcessSyncableTiddlers = function(syncList)
{
    displayMessage( "elnbSync.preProcessSyncableTiddlers - syncItems len: " + syncList.length );
    var thisMacro = config.macros.elnbSync;

    for(var i=0; i<syncList.length; i++) {
		var si = syncList[i];
          
		//si.serverUrl = si.adaptor.generateTiddlerInfo(si.tiddler).uri;   

        var tiddler = si.tiddler;
        tiddler.fields['server.host'] = thisMacro.coreFile;   
    
		si.serverUrl = si.adaptor.generateTiddlerInfo(tiddler).uri; 
	}
};

config.macros.elnbSync.processSyncableTiddlers = function(syncList)
{
    displayMessage( "elnbSync.processSyncableTiddlers - syncItems len: " + syncList.length );
	for(var i=0; i<syncList.length; i++) {
		var si = syncList[i];
		if(si.syncStatus.display)
			si.rowElement.style.display = si.syncStatus.display;
		if(si.syncStatus.className)
			si.rowElement.className = si.syncStatus.className;
	}
};

config.macros.elnbSync.createSyncTasks = function(syncList)
{
	var syncTasks = [];
	for(var i=0; i<syncList.length; i++) {
		var si = syncList[i];
		var r = null;
		for(var j=0; j<syncTasks.length; j++) {
			var cst = syncTasks[j];
			if(si.serverType == cst.serverType && si.serverHost == cst.serverHost && si.serverWorkspace == cst.serverWorkspace)
				r = cst;
		}
		if(r) {
			si.syncTask = r;
			r.syncItems.push(si);
		} else {
			si.syncTask = this.createSyncTask(si);
			syncTasks.push(si.syncTask);
		}
	}
	return syncTasks;
};

config.macros.elnbSync.createSyncTask = function(syncItem)
{
	var st = {};
	st.serverType = syncItem.serverType;
	st.serverHost = syncItem.serverHost;
	st.serverWorkspace = syncItem.serverWorkspace;
	st.syncItems = [syncItem];

	var openWorkspaceCallback = function(context,syncItems) {
		if(context.status) {
			context.adaptor.getTiddlerList(context,syncItems,getTiddlerListCallback);
			return true;
		}
		displayMessage(context.statusText);
		return false;
	};

	var getTiddlerListCallback = function(context,sycnItems) {
		var me = config.macros.elnbSync;
		if(!context.status) {
			displayMessage(context.statusText);
			return false;
		}
		syncItems = context.userParams;
		var tiddlers = context.tiddlers;
		for(var i=0; i<syncItems.length; i++) {
			var si = syncItems[i];
			var f = tiddlers.findByField("title",si.title);
			if(f !== null) {
				if(tiddlers[f].fields['server.page.revision'] > si.tiddler.fields['server.page.revision']) {
					si.syncStatus = me.syncStatusList[si.isTouched ? 'changedBoth' : 'changedServer'];
				}
			} else {
				si.syncStatus = me.syncStatusList.notFound;
			}
			me.updateSyncStatus(si);
		}
		return true;
	};
	var context = {host:st.serverHost,workspace:st.serverWorkspace};
	syncItem.adaptor.openHost(st.serverHost);
	syncItem.adaptor.openWorkspace(st.serverWorkspace,context,st.syncItems,openWorkspaceCallback);
	return st;
};

config.macros.elnbSync.updateSyncStatus = function(syncItem)
{
	var e = syncItem.colElements["status"];
	removeChildren(e);
	createTiddlyText(e,syncItem.syncStatus.text);
	syncItem.rowElement.style.display = syncItem.syncStatus.display;
	if(syncItem.syncStatus.className)
		syncItem.rowElement.className = syncItem.syncStatus.className;
};

config.macros.elnbSync.doSync = function(e)
{
        displayMessage( "Sync TW-eLNB core - elnbSync.doSync" );

	var me = config.macros.elnbSync;
	var getTiddlerCallback = function(context,syncItem) {
		if(syncItem) {
			var tiddler = context.tiddler;
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
			syncItem.syncStatus = me.syncStatusList.gotFromServer;
			me.updateSyncStatus(syncItem);
		}
	};
	var putTiddlerCallback = function(context,syncItem) {
		if(syncItem) {
			store.resetTiddler(context.title);
			syncItem.syncStatus = me.syncStatusList.putToServer;
			me.updateSyncStatus(syncItem);
		}
	};

	var rowNames = ListView.getSelectedRows(currSync.listView);
	var sl = me.syncStatusList;
	for(var i=0; i<currSync.syncList.length; i++) {
		var si = currSync.syncList[i];
		if(rowNames.indexOf(si.title) != -1) {
			var errorMsg = "Error in doSync: ";
			try {
				var r = true;
				switch(si.syncStatus) {

                                // Not allowed to update TW-eLNB core 
                                // Therefore, always there is change on server the local file is updated.
                           		
				case sl.changedServer:
				case sl.changedBoth:
					var context = {"workspace": si.serverWorkspace};
					r = si.adaptor.getTiddler(si.title,context,si,getTiddlerCallback);
					break;
				case sl.notFound:
				case sl.changedLocally:
				//case sl.changedBoth:
                                        // Not allowed to update TW-eLNB core 
					//r = si.adaptor.putTiddler(si.tiddler,null,si,putTiddlerCallback);
					break;
				default:
					break;
				}
				if(!r)
					displayMessage(errorMsg + r);
			} catch(ex) {
				if(ex.name == "TypeError")
					displayMessage("sync operation unsupported: " + ex.message);
				else
					displayMessage(errorMsg + ex.message);
			}
		}
	}
	return false;
};


//--
// Backstage tasks
//-- 

config.tasks.elnbSync = {  
    text: "elnbSync", 
    tooltip: "Sync to tw-elnb", 
    content: '<<elnbSync>>'
}  
   
config.backstageTasks.push( "elnbSync" );  

//}}}
