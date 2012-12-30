/***
|Name|TiddlyLockPlugin|
|Source|http://www.minormania.com/tiddlylock/tiddlylock.html|
|Version|1.2|
|Author|Richard Hobbis|
|License|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|Type|plugin|
|Overrides|config.macros.newTiddler.onClickNewTiddler()<br>config.commands.cancelTiddler.handler()<br>config.commands.deleteTiddler.handler<br>config.commands.editTiddler.handler()<br>config.commands.saveTiddler.handler()<br>saveChanges()<br>checkUnsavedChanges()|
|Description|Automatically locks and unlocks the TiddlyWiki as required, allowing multiple users to edit the TiddlyWiki without fear of overwriting other users' changes.|
!!!Usage
<<<
Simply import TiddlyLockPlugin into your TiddlyWiki!
<<<
!!!Installation
<<<
Import (or copy/paste) ''this tiddler'' into your TiddlyWiki and make sure it's tagged with <<tag systemConfig>>. Reload your TiddlyWiki to enable TiddlyLock.
<<<
!!!Configuration
<<<
None required!
<<<
!!!Revision History
<<<
''2010.07.06 [1.2.0]'' Allow the location of the Lock File to be specified by the user, instead of defaulting to the location of the TiddlyWiki file. The default location is the same folder as the TiddlyWiki file itself, however this can be changed by editing ''//this html file//'' in a text editor and search for {{{TiddlyLock.LockPath = '';}}} The folder will be created if it doesn't exist.
''2010.07.06 [1.2.0]'' Upgraded this TiddlyWiki to core version 2.6
''2008.05.15 [1.1.0]'' Upgraded source TiddlyWiki to use core version 2.4. Tested and verified TiddlyLock under version 2.4.
''2007.06.22 [1.0.4]'' Added locking on 'new tiddler' which also traps 'new journal'. Tweaked messages.
''2007.06.20 [1.0.3]'' Fixed an issue that occurred when a user navigated away from the TiddlyWiki without saving outstanding changes.
''2007.05.10 [1.0.2]'' Implemented a timestamp to track the last update time. This fixes the multi-browser edit issue and also removes the need for a password.
''2007.05.08 [1.0.1]'' Function overrides are now done using apply() ensuring clean upgrades (thanks Martin!)
''2007.05.01 [1.0.0]'' Initial Release
<<<
!!!Known Issues
<<<
*Monkey Pirate TiddlyWiki (MPTW) adds a ''disable'' button to the toolbar for systemConfig tiddlers. This button is available even when the TW is marked as readOnly and therefore it's possible for two users to disable/enable plugins at the same time. In this case, whoever saves the TW last will 'win' and their changes will be saved. Note that this is only an issue if there are no other unsaved changes in both browsers - TiddlyLock still handles all other changes.
<<<
!!!Credits
<<<
This feature was developed by Richard Hobbis (rhobbis [at] hotmail [dot] com).
<<<
!!!Code
***/

//{{{
// Convert a date to UTC YYYYMMDDHHMMSSMMM string format
// This is the same as the builtin function convertToYYYYMMDDHHMMSSMMM() but
// without the '.' in the middle - this allows simple date comparisons
Date.prototype.TLConvertToYYYYMMDDHHMMSSMMM = function()
{
  return(String.zeroPad(this.getUTCFullYear(),4)
    + String.zeroPad(this.getUTCMonth()+1,2)
    + String.zeroPad(this.getUTCDate(),2)
    + String.zeroPad(this.getUTCHours(),2)
    + String.zeroPad(this.getUTCMinutes(),2)
    + String.zeroPad(this.getUTCSeconds(),2)
    + String.zeroPad(this.getUTCMilliseconds(),4));
}

// namespace for TiddlyLock
TiddlyLock = {};

// Load/Last Update timestamp
TiddlyLock.TimeStamp = new Date().TLConvertToYYYYMMDDHHMMSSMMM();

// Lockfile
TiddlyLock.LockPath = ''; // custom values *must* include trailing '\\'
TiddlyLock.OldLockData = '';
TiddlyLock.LockData = '';
TiddlyLock.LockFile = TLLockPath();
// define messages
TiddlyLock.Msg = {
  Locked: 'File locked',
  Unlocked: 'File unlocked',
  LockFailed: 'Failed to lock file',
  UnlockFailed: 'Failed to unlock file',
  ReadOnly: 'Now in Read-Only mode.',
  Changed: 'This file has been changed by someone else.',
  Reload: 'Reload this file before editing.'};

// create/update the lock file
function TLSave(timeStamp,lockedBy)
{
  var lockedText='';
  if (lockedBy!='')
  {
    lockedText=timeStamp+'##'+lockedBy;
  }
  else lockedText=timeStamp+'##';
    var lockSave=saveFile(TiddlyLock.LockFile,lockedText);
  TiddlyLock.TimeStamp = timeStamp;
  return false;
}


// Create/update the lock file to prevent other users from editing the TW
function TLLock()
{
  clearMessage();
  lockSave = TLSave(new Date().TLConvertToYYYYMMDDHHMMSSMMM(),config.options.txtUserName);
  displayMessage(TiddlyLock.Msg.Locked,'');
  return false;
}


// Clear the lock file if necessary, but only if I have it locked, setting the
// timestamp in the lockfile to the specified value
function TLUnlock(timeStamp)
{
  if ((store && store.isDirty && !store.isDirty())
    && (story && story.areAnyDirty && !story.areAnyDirty())
    && TLIsLocked()
    && TLIsLockedByMe())
  {
    lockSave=TLSave(timeStamp,'','');
    displayMessage(TiddlyLock.Msg.Unlocked,'');
    TiddlyLock.OldLockData = TiddlyLock.LockData;
  }
  return false;
}

// Get the contents of the lock file, if it exists
function TLLockPath()
{
  var lockPath,pathRoot,p,fileName;
  var fullPath=document.location.toString();
  if(TiddlyLock.LockPath!='') pathRoot=TiddlyLock.LockPath; // location of lock file is defined by TiddlyLock.LockPath
  else pathRoot=getLocalPath(fullPath); // location of lock file is derived from the wiki filename
  if((p=pathRoot.lastIndexOf('\\'))!=-1) pathRoot=pathRoot.substr(0,p+1); // truncate any trailing filename (derived paths only)
  fileName=getLocalPath(fullPath); // full wiki file name, including path
  if((p=fileName.lastIndexOf('\\'))!=-1) fileName=fileName.substr(p+1); // truncate everything up to the last slash
  if((p=fileName.lastIndexOf('.'))!=-1) fileName=fileName.substr(0,p); // remove any existing extension
  fileName=fileName+'.lck'; // add new extension
  return pathRoot+fileName;
}

// Get the contents of the lock file, if it exists
function TLLockData()
{
  return loadFile(TiddlyLock.LockFile);
}

// Get the contents of the lock file, if it exists
function TLIsLocked()
{
  TiddlyLock.LockData = TLLockData();
  if (TiddlyLock.LockData
      && ( TLLockedBy(TiddlyLock.LockData)!='' // someone has it locked
         || TiddlyLock.TimeStamp < TLLockedTimeStamp(TiddlyLock.LockData) // changed by someone else but not currently locked
         )
     )
    return true;
  else
    return false;
}


// check if locked by me
function TLIsLockedByMe()
{
  if(TiddlyLock.LockData == TiddlyLock.TimeStamp+'##' + config.options.txtUserName)
    return true;
  else
    return false;
}


// returns just the timestamp portion of the supplied lock file contents
function TLLockedTimeStamp(lockData)
{
  if(lockData)
    return lockData.split('##')[0];
  else
    return '';
}


// returns just the username portion of the supplied lock file contents
function TLLockedBy(lockData)
{
  if(lockData)
    return lockData.split('##')[1];
  else
    return '';
}

// display a message if locked or changed
function TLChangesAllowed()
{
  if(TLIsLocked() && !TLIsLockedByMe())
  {
    readOnly=true;
    if(TLLockedBy(TiddlyLock.LockData))
    {
      displayMessage(TiddlyLock.Msg.Locked+' by '+TLLockedBy(TiddlyLock.LockData));
      alert(TiddlyLock.Msg.Locked+' by '+TLLockedBy(TiddlyLock.LockData)+'. '+TiddlyLock.Msg.ReadOnly);
    }
    else
    {
      displayMessage(TiddlyLock.Msg.Changed+' '+TiddlyLock.Msg.Reload);
      alert(TiddlyLock.Msg.Changed+' '+TiddlyLock.Msg.Reload);
    }
    return false;
  }
  else
    return true;
}


//*********************************************
// OVERRIDE STANDARD FUNCTIONS
//*********************************************

//
// OVERRIDE onClickNewTiddler()
//
TiddlyLock.onClickNewTiddler = config.macros.newTiddler.onClickNewTiddler;
config.macros.newTiddler.onClickNewTiddler = function(event,src,title)
{
  if (TLChangesAllowed())
  {
    TiddlyLock.OldLockData = TiddlyLock.LockData;
    TLLock();
    var ret = TiddlyLock.onClickNewTiddler.apply(this,arguments);
    return ret;
  }
}

//
// OVERRIDE checkUnsavedChanges()
//
TiddlyLock.checkUnsavedChanges = checkUnsavedChanges;
checkUnsavedChanges = function(event,src,title)
{
  var ret = TiddlyLock.checkUnsavedChanges.apply(this,arguments);
  if(TLIsLocked() && TLIsLockedByMe())
    lockSave=TLSave(TLLockedTimeStamp(TiddlyLock.OldLockData),'','');
  return ret;
}


//
// OVERRIDE cancelTiddler()
//
TiddlyLock.cancelTiddler = config.commands.cancelTiddler.handler;
config.commands.cancelTiddler.handler = function(event,src,title)
{
  var ret = TiddlyLock.cancelTiddler.apply(this,arguments);
  TLUnlock(TLLockedTimeStamp(TiddlyLock.OldLockData));
  return ret;
}

//
// OVERRIDE deleteTiddler()
//
TiddlyLock.deleteTiddler = config.commands.deleteTiddler.handler;
config.commands.deleteTiddler.handler = function(event,src,title)
{
  if (TLChangesAllowed())
  {
    TiddlyLock.OldLockData = TiddlyLock.LockData;
    TLLock();
    var ret = TiddlyLock.deleteTiddler.apply(this,arguments);
    return ret;
  }
}

//
// OVERRIDE editTiddler()
//
TiddlyLock.editTiddler = config.commands.editTiddler.handler;
config.commands.editTiddler.handler = function(event,src,title)
{
  if (TLChangesAllowed())
  {
    TiddlyLock.OldLockData = TiddlyLock.LockData;
    TLLock();
  }
  var ret = TiddlyLock.editTiddler.apply(this,arguments);
  return ret;
}

//
// OVERRIDE saveChanges()
//
TiddlyLock.saveChanges = saveChanges;
saveChanges = function(onlyIfDirty)
{
  if(TLChangesAllowed())
  {
    var ret = TiddlyLock.saveChanges.apply(this,arguments);
    TLUnlock(new Date().TLConvertToYYYYMMDDHHMMSSMMM());
    return ret;
  }
  else
    return false;
}

//
// OVERRIDE saveTiddler()
//
TiddlyLock.saveTiddler= config.commands.saveTiddler.handler;
config.commands.saveTiddler.handler=function(event,src,title)
{
  var ret = TiddlyLock.saveTiddler.apply(this,arguments);
  TLUnlock(new Date().TLConvertToYYYYMMDDHHMMSSMMM());
  return ret;
}

//}}}