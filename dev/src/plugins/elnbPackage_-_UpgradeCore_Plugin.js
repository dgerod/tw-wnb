/***
***/
//{{{

if( !version.extensions.elnb)
       version.extensions.elnb = {};

version.extensions.elnb.upgradeCore = {major: 1, minor: 0, revision: 0, date: new Date(2011,2,6)};  

//--
//
//--

// The TW-eLNB core
var coreConn = config.extensions.elnb.elnbCore;

config.macros.elnbUpgrade = {

        serverType: coreConn.serverType,
        serverHost: coreConn.serverHost,
        coreFile: coreConn.coreHost,
	readOnlyWarning: "You cannot import into a read-only TiddlyWiki file. Try opening it from a file:// URL",
	wizardTitle: "Upgrade TW-eLNB core code",
	step1Title: "Update or repair this TiddlyWiki to the latest release",
	step1Html: "Specify the type of the server: <select name='selTypes'><option value=''>Choose...</option></select><br>Enter the URL or pathname here: <input type='text' size=50 name='txtPath'><br>...or browse for a file: <input type='file' size=50 name='txtBrowse'><br><hr>...or select a pre-defined feed: <select name='selFeeds'><option value=''>Choose...</option></select>",
	openLabel: "open",
	openPrompt: "Open the connection to this file or server",
	statusOpenHost: "Opening the host",
	statusGetWorkspaceList: "Getting the list of available workspaces",
	step2Title: "Step 2: Choose the workspace",
	step2Html: "Enter a workspace name: <input type='text' size=50 name='txtWorkspace'><br>...or select a workspace: <select name='selWorkspace'><option value=''>Choose...</option></select>",
	cancelLabel: "cancel",
	cancelPrompt: "Cancel this import",
	statusOpenWorkspace: "Opening the workspace",
	statusGetTiddlerList: "Getting the list of available tiddlers",
	errorGettingTiddlerList: "Error getting list of tiddlers, click Cancel to try again",
	step3Title: "Step 3: Choose the tiddlers to import",
	step3Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='true' name='chkSync'>Keep these tiddlers linked to this server so that you can synchronise subsequent changes</input><br><input type='checkbox' name='chkSave'>Save the details of this server in a 'systemServer' tiddler called:</input> <input type='text' size=25 name='txtSaveTiddler'>",
	importLabel: "import",
	importPrompt: "Import these tiddlers",
	confirmOverwriteText: "Are you sure you want to overwrite these tiddlers:\n\n%0",
	step4Title: "Step 4: Importing %0 tiddler(s)",
	step4Html: "<input type='hidden' name='markReport'></input>", // DO NOT TRANSLATE
	doneLabel: "done",
	donePrompt: "Close this wizard",
	statusDoingImport: "Importing tiddlers",
	statusDoneImport: "All tiddlers imported",
	systemServerNamePattern: "%2 on %1",
	systemServerNamePatternNoWorkspace: "%1",
	confirmOverwriteSaveTiddler: "The tiddler '%0' already exists. Click 'OK' to overwrite it with the details of this server, or 'Cancel' to leave it unchanged",
	serverSaveTemplate: "|''Type:''|%0|\n|''URL:''|%1|\n|''Workspace:''|%2|\n\nThis tiddler was automatically created to record the details of this server",
	serverSaveModifier: "(System)",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "Size", type: 'Size'},
			{name: 'Tags', field: 'tags', title: "Tags", type: 'Tags'}
			],
		rowClasses: [
			]}
	};

//--
//-- UpgradeCore macro
//--

config.macros.elnbUpgrade.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(readOnly) {
		createTiddlyElement(place,"div",null,"marked",this.readOnlyWarning);
		return;
	}
	var w = new Wizard();
	w.createWizard(place,this.wizardTitle);
	this.restart(w);
};

config.macros.elnbUpgrade.onCancel = function(e)
{
	var wizard = new Wizard(this);
	var place = wizard.clear();
	config.macros.elnbUpgrade.restart(wizard);
	return false;
};

config.macros.elnbUpgrade.onClose = function(e)
{
	backstage.hidePanel();
	return false;
};

config.macros.elnbUpgrade.restart = function(wizard)
{
	var me = config.macros.elnbUpgrade;
	wizard.addStep(this.step1Title,this.step1Html);
	var s = wizard.getElement("selTypes");
	for(var t in config.adaptors) {
		var e = createTiddlyElement(s,"option",null,null,config.adaptors[t].serverLabel ? config.adaptors[t].serverLabel : t);
		e.value = t;
	}
	if(config.defaultAdaptor)
		s.value = config.defaultAdaptor;
	s = wizard.getElement("selFeeds");
	var feeds = this.getFeeds();
	for(t in feeds) {
		e = createTiddlyElement(s,"option",null,null,t);
		e.value = t;
	}
	wizard.setValue("feeds",feeds);
	s.onchange = me.onFeedChange;
	var fileInput = wizard.getElement("txtBrowse");
	fileInput.onchange = me.onBrowseChange;
	fileInput.onkeyup = me.onBrowseChange;
	wizard.setButtons([{caption: this.openLabel, tooltip: this.openPrompt, onClick: me.onOpen}]);

        // Add path to TW-eLNB code
        var fileInput = wizard.getElement("txtPath");
        fileInput.value = this.coreFile;

	wizard.formElem.action = "javascript:;";
	wizard.formElem.onsubmit = function() {
		if(!this.txtPath || this.txtPath.value.length) //# check for manually entered path in first step
			this.lastChild.firstChild.onclick();
	};
};

config.macros.elnbUpgrade.getFeeds = function()
{
	var feeds = {};
	var tagged = store.getTaggedTiddlers("systemServer","title");
	for(var t=0; t<tagged.length; t++) {
		var title = tagged[t].title;
		var serverType = store.getTiddlerSlice(title,"Type");
		if(!serverType)
			serverType = "file";
		feeds[title] = {title: title,
						url: store.getTiddlerSlice(title,"URL"),
						workspace: store.getTiddlerSlice(title,"Workspace"),
						workspaceList: store.getTiddlerSlice(title,"WorkspaceList"),
						tiddlerFilter: store.getTiddlerSlice(title,"TiddlerFilter"),
						serverType: serverType,
						description: store.getTiddlerSlice(title,"Description")};
	}
	return feeds;
};

config.macros.elnbUpgrade.onFeedChange = function(e)
{
	var wizard = new Wizard(this);
	var selTypes = wizard.getElement("selTypes");
	var fileInput = wizard.getElement("txtPath");
	var feeds = wizard.getValue("feeds");
	var f = feeds[this.value];
	if(f) {
		selTypes.value = f.serverType;
		fileInput.value = f.url;
		wizard.setValue("feedName",f.serverType);
		wizard.setValue("feedHost",f.url);
		wizard.setValue("feedWorkspace",f.workspace);
		wizard.setValue("feedWorkspaceList",f.workspaceList);
		wizard.setValue("feedTiddlerFilter",f.tiddlerFilter);
	}
	return false;
};

config.macros.elnbUpgrade.onBrowseChange = function(e)
{
	var wizard = new Wizard(this);
	if(this.files && this.files[0]) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");
		} catch (ex) {
			showException(ex);
		}
	}
	var fileInput = wizard.getElement("txtPath");
	fileInput.value = config.macros.elnbUpgrade.getURLFromLocalPath(this.value);
	var serverType = wizard.getElement("selTypes");
	serverType.value = "file";
	return true;
};

config.macros.elnbUpgrade.getURLFromLocalPath = function(v)
{
	if(!v || !v.length)
		return v;
	v = v.replace(/\\/g,"/"); // use "/" for cross-platform consistency
	var u;
	var t = v.split(":");
	var p = t[1] || t[0]; // remove drive letter (if any)
	if(t[1] && (t[0] == "http" || t[0] == "https" || t[0] == "file")) {
		u = v;
	} else if(p.substr(0,1)=="/") {
		u = document.location.protocol + "//" + document.location.hostname + (t[1] ? "/" : "") + v;
	} else {
		var c = document.location.href.replace(/\\/g,"/");
		var pos = c.lastIndexOf("/");
		if(pos!=-1)
			c = c.substr(0,pos); // remove filename
		u = c + "/" + p;
	}
	return u;
};

config.macros.elnbUpgrade.onOpen = function(e)
{
	var me = config.macros.elnbUpgrade;
	var wizard = new Wizard(this);
	var fileInput = wizard.getElement("txtPath");
	var url = fileInput.value;
	var serverType = wizard.getElement("selTypes").value || config.defaultAdaptor;
	var adaptor = new config.adaptors[serverType]();
	wizard.setValue("adaptor",adaptor);
	wizard.setValue("serverType",serverType);
	wizard.setValue("host",url);
	var ret = adaptor.openHost(url,null,wizard,me.onOpenHost);
	if(ret !== true)
		displayMessage(ret);
	wizard.setButtons([{caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel}],me.statusOpenHost);
	return false;
};

config.macros.elnbUpgrade.onOpenHost = function(context,wizard)
{
	var me = config.macros.elnbUpgrade;
	var adaptor = wizard.getValue("adaptor");
	if(context.status !== true)
		displayMessage("Error in elnbSync.onOpenHost: " + context.statusText);
	var ret = adaptor.getWorkspaceList(context,wizard,me.onGetWorkspaceList);
	if(ret !== true)
		displayMessage(ret);
	wizard.setButtons([{caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel}],me.statusGetWorkspaceList);
};

config.macros.elnbUpgrade.onGetWorkspaceList = function(context,wizard)
{
	var me = config.macros.elnbUpgrade;
	if(context.status !== true)
		displayMessage("Error in elnbSync.onGetWorkspaceList: " + context.statusText);
	wizard.setValue("context",context);
	var workspace = wizard.getValue("feedWorkspace");
	if(!workspace && context.workspaces.length==1)
		workspace = context.workspaces[0].title;
	if(workspace) {
		var ret = context.adaptor.openWorkspace(workspace,context,wizard,me.onOpenWorkspace);
		if(ret !== true)
			displayMessage(ret);
		wizard.setValue("workspace",workspace);
		wizard.setButtons([{caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel}],me.statusOpenWorkspace);
		return;
	}
	wizard.addStep(me.step2Title,me.step2Html);
	var s = wizard.getElement("selWorkspace");
	s.onchange = me.onWorkspaceChange;
	for(var t=0; t<context.workspaces.length; t++) {
		var e = createTiddlyElement(s,"option",null,null,context.workspaces[t].title);
		e.value = context.workspaces[t].title;
	}
	var workspaceList = wizard.getValue("feedWorkspaceList");
	if(workspaceList) {
		var list = workspaceList.parseParams("workspace",null,false,true);
		for(var n=1; n<list.length; n++) {
			if(context.workspaces.findByField("title",list[n].value) == null) {
				e = createTiddlyElement(s,"option",null,null,list[n].value);
				e.value = list[n].value;
			}
		}
	}
	if(workspace) {
		t = wizard.getElement("txtWorkspace");
		t.value = workspace;
	}
	wizard.setButtons([{caption: me.openLabel, tooltip: me.openPrompt, onClick: me.onChooseWorkspace}]);
};

config.macros.elnbUpgrade.onWorkspaceChange = function(e)
{
	var wizard = new Wizard(this);
	var t = wizard.getElement("txtWorkspace");
	t.value = this.value;
	this.selectedIndex = 0;
	return false;
};

config.macros.elnbUpgrade.onChooseWorkspace = function(e)
{
	var me = config.macros.elnbUpgrade;
	var wizard = new Wizard(this);
	var adaptor = wizard.getValue("adaptor");
	var workspace = wizard.getElement("txtWorkspace").value;
	wizard.setValue("workspace",workspace);
	var context = wizard.getValue("context");
	var ret = adaptor.openWorkspace(workspace,context,wizard,me.onOpenWorkspace);
	if(ret !== true)
		displayMessage(ret);
	wizard.setButtons([{caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel}],me.statusOpenWorkspace);
	return false;
};

config.macros.elnbUpgrade.onOpenWorkspace = function(context,wizard)
{
	var me = config.macros.elnbUpgrade;
	if(context.status !== true)
		displayMessage("Error in elnbSync.onOpenWorkspace: " + context.statusText);
	var adaptor = wizard.getValue("adaptor");
	var ret = adaptor.getTiddlerList(context,wizard,me.onGetTiddlerList,wizard.getValue("feedTiddlerFilter"));
	if(ret !== true)
		displayMessage(ret);
	wizard.setButtons([{caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel}],me.statusGetTiddlerList);
};

config.macros.elnbUpgrade.onGetTiddlerList = function(context,wizard)
{
	var me = config.macros.elnbUpgrade;
	if(context.status !== true) {
		wizard.setButtons([{caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel}],me.errorGettingTiddlerList);
		return;
	}
	// Extract data for the listview
	var listedTiddlers = [];
	if(context.tiddlers) {
		for(var n=0; n<context.tiddlers.length; n++) {
			var tiddler = context.tiddlers[n];
			listedTiddlers.push({
				title: tiddler.title,
				modified: tiddler.modified,
				modifier: tiddler.modifier,
				text: tiddler.text ? wikifyPlainText(tiddler.text,100) : "",
				tags: tiddler.tags,
				size: tiddler.text ? tiddler.text.length : 0,
				tiddler: tiddler
			});
		}
	}
	listedTiddlers.sort(function(a,b) {return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1);});
	// Display the listview
	wizard.addStep(me.step3Title,me.step3Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	var listView = ListView.create(listWrapper,listedTiddlers,me.listViewTemplate);
	wizard.setValue("listView",listView);
	wizard.setValue("context",context);
	var txtSaveTiddler = wizard.getElement("txtSaveTiddler");
	txtSaveTiddler.value = me.generateSystemServerName(wizard);
	wizard.setButtons([
			{caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel},
			{caption: me.importLabel, tooltip: me.importPrompt, onClick: me.doImport}
		]);
};

config.macros.elnbUpgrade.generateSystemServerName = function(wizard)
{
	var serverType = wizard.getValue("serverType");
	var host = wizard.getValue("host");
	var workspace = wizard.getValue("workspace");
	var pattern = config.macros.elnbUpgrade[workspace ? "systemServerNamePattern" : "systemServerNamePatternNoWorkspace"];
	return pattern.format([serverType,host,workspace]);
};

config.macros.elnbUpgrade.saveServerTiddler = function(wizard)
{
	var me = config.macros.elnbUpgrade;
	var txtSaveTiddler = wizard.getElement("txtSaveTiddler").value;
	if(store.tiddlerExists(txtSaveTiddler)) {
		if(!confirm(me.confirmOverwriteSaveTiddler.format([txtSaveTiddler])))
			return;
		store.suspendNotifications();
		store.removeTiddler(txtSaveTiddler);
		store.resumeNotifications();
	}
	var serverType = wizard.getValue("serverType");
	var host = wizard.getValue("host");
	var workspace = wizard.getValue("workspace");
	var text = me.serverSaveTemplate.format([serverType,host,workspace]);
	store.saveTiddler(txtSaveTiddler,txtSaveTiddler,text,me.serverSaveModifier,new Date(),["systemServer"]);
};

config.macros.elnbUpgrade.doImport = function(e)
{
	var me = config.macros.elnbUpgrade;
	var wizard = new Wizard(this);
	if(wizard.getElement("chkSave").checked)
		me.saveServerTiddler(wizard);
	var chkSync = wizard.getElement("chkSync").checked;
	wizard.setValue("sync",chkSync);
	var listView = wizard.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	var adaptor = wizard.getValue("adaptor");
	var overwrite = [];
	var t;
	for(t=0; t<rowNames.length; t++) {
		if(store.tiddlerExists(rowNames[t]))
			overwrite.push(rowNames[t]);
	}
	if(overwrite.length > 0) {
		if(!confirm(me.confirmOverwriteText.format([overwrite.join(", ")])))
			return false;
	}
	wizard.addStep(me.step4Title.format([rowNames.length]),me.step4Html);
	for(t=0; t<rowNames.length; t++) {
		var link = document.createElement("div");
		createTiddlyLink(link,rowNames[t],true);
		var place = wizard.getElement("markReport");
		place.parentNode.insertBefore(link,place);
	}
	wizard.setValue("remainingImports",rowNames.length);
	wizard.setButtons([
			{caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel}
		],me.statusDoingImport);
	var wizardContext = wizard.getValue("context");
	var tiddlers = wizardContext ? wizardContext.tiddlers : [];
	for(t=0; t<rowNames.length; t++) {
		var context = {
			allowSynchronous:true,
			tiddler:tiddlers[tiddlers.findByField("title",rowNames[t])]
		};
		adaptor.getTiddler(rowNames[t],context,wizard,me.onGetTiddler);
	}
	return false;
};

config.macros.elnbUpgrade.onGetTiddler = function(context,wizard)
{
	var me = config.macros.elnbUpgrade;
	if(!context.status)
		displayMessage("Error in elnbSync.onGetTiddler: " + context.statusText);
	var tiddler = context.tiddler;
	store.suspendNotifications();
	store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier, tiddler.modified, tiddler.tags, tiddler.fields, true, tiddler.created);
	if(!wizard.getValue("sync")) {
		store.setValue(tiddler.title,'server',null);
	}
	store.resumeNotifications();
	if(!context.isSynchronous)
		store.notify(tiddler.title,true);
	var remainingImports = wizard.getValue("remainingImports")-1;
	wizard.setValue("remainingImports",remainingImports);
	if(remainingImports == 0) {
		if(context.isSynchronous) {
			store.notifyAll();
			refreshDisplay();
		}
		wizard.setButtons([
				{caption: me.doneLabel, tooltip: me.donePrompt, onClick: me.onClose}
			],me.statusDoneImport);
		autoSaveChanges();
	}
};

//--
// Backstage tasks
//-- 

config.tasks.elnbUpgrade = {  
    text: "elnbUpgrade", 
    tooltip: "Upgrade TW-eLNB core code", 
    content: '<<elnbUpgrade>>'    
}  
   
config.backstageTasks.push( "elnbUpgrade" );  

//}}}