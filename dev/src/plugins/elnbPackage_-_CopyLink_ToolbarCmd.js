/***
|Name||
|Description||
|Package|TW-eLNB |
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|Based on|TW References Command|
|Source||
|Version|1.0.0|
|License||
|~CoreVersion||
|Type|ToolbarCommand|
***/

//{{{
if( !config.commands.elnb )     
     config.commands.elnb = {};  

config.commands.elnb.CopyLink = {

    text: "link",
    tooltip: "Create tiddler link",
    readOnlyText: "Create tiddler link",
	
    clipboardSwf : './tools/clipboard.swf',
    flashCopier: {},
    
    handler: function(event,src,title) 
    {
        clearMessage();

        var subject = store.getTiddlerSubjectByTitle( title );
        var linkTiddler = "[[" + subject + "|" + title + "]]";

        displayMessage( linkTiddler + " link"); 

        thisMacro = config.commands.elnb.CopyLink;

        // Internet Explorer
        if( window.clipboardData )
	{
            window.clipboardData.setData( 'text', linkTiddler );
	}
        // Mozilla
        else if( window.Components ) 
        {
           try { netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); }
           catch(e) 
           { 
              alert(e.description?e.description:e.toString()); 
              return; 
           }
           var nsIClipboardHelper = window.Components.interfaces.nsIClipboardHelper;
           const clip = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(nsIClipboardHelper);

           clip.copyString( linkTiddler );
        }
        // Other browsers
	else if( thisMacro.clipboardSwf != null )
	{
	   var flashcopier = thisMacro.flashCopier;
				
	   if( flashcopier == null )
           {
    	                flashcopier = document.createElement('div');
			thisMacro.flashCopier = flashcopier;
			thisMacro.div.appendChild( flashcopier );		
	   }

           flashcopier.innerHTML = '<embed src="' + thisMacro.clipboardSwf + '" FlashVars="clipboard=' + 
                                                encodeURIComponent( linkTiddler ) + '" width="0" height="0" type="application/x-shockwave-flash"></embed>';
      } 

      displayMessage('The link is in your clipboard now');
   }
};

//	
config.commands.elnbCopyLink  = config.commands.elnb.CopyLink;

//}}}