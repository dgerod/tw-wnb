/***
|''Name:''|elnbNewCmdPlugin|
|''Description:''||
|''Version:''|1.1.1|
|''Date:''|Oct 24,2010|
|''Source:''| |
|''Author:''|dieesrod@[[zyzlab|http://zyzlab.dyndns.org]]|
|''License:''|[[BSD open source license|License]]|

Examples: <<elnbNewJournal>><<elnbTodayJournal>><<elnbTodayJournal2>><<elnbNewNote>><<elnbNewTodo>><<elnbNewQuestion>><<elnbNewMeeting>><<elnbNewReference>>

''General''
***/
//{{{
if( !version.extensions.elnb )   
    version.extensions.elnb = {};
    
version.extensions.elnb.NewCmdPlugin= { major: 4, minor: 0, revision: 0, date: new Date(2009,6,4) };  

version.extensions.elnb = 
{
     newTID: function() 
     {           
        // Today date
         var today = new Date().formatString( 'YYYY0MM0DD' );

         // Extract TID from tiddler and divide it in date and id
         var tiddler = store.getTiddler( "TID");
         var text = tiddler["text"];

         var token = text.split("-")
         var prevDate= token[0];
         var id = parseInt( token[1] );
       
         // If TID is smaller than current date then update TID completly
         // else increment only id.

         if( today > prevDate )
         {
           var newDate = today ;
           var newId = 1;
         }
         else 
         {
           var newDate = prevDate;
           var newId = id + 1;
         }

         // Create TID using date and id
         // Store it in a tiddler and return the value

         var tid = newDate  + '-' +  newId ;
         tiddler["text"] = tid;
         
         return tid;     
     } ,
};

//}}}
/***
''New note''
***/
//{{{
config.macros.elnbNewNote = {  

     label: "new note",  
     tooltip: "Create a new note",  
     category: "note",
     tags: "",

     handler: function ( place,macroName,params,wikifier,paramString,tiddler ) 
     {  
         var buttonLabel = this.label;  
         var buttonTip  = this.tooltip;  

         createTiddlyButton( place,buttonLabel,buttonTip,this.createNote );  
     },

     createNote: function(e) 
     {            
         var date = new Date();
         var author = config.options.txtUserName;

         var tid = version.extensions.elnb.newTID();
         var title = "NO-" + tid;
         subject = "New note ...";
         var text = "";

         var category =  config.macros.elnbNewNote.category;
         var tags = config.macros.elnbNewNote.tags;    

         store.saveTiddler( title,title,text,author,date,tags );
         store.setValue( title,"category",category );        
         store.setValue( title,"subject",subject );    

         story.displayTiddler(null, title, DEFAULT_EDIT_TEMPLATE);
     } ,
}
//}}}
/***
''New journal''
***/
//{{{
config.macros.elnbNewJournal = {  

     label: "new journal",  
     tooltip: "Create a new journal entry",  
     category: "journal",
     tags: "#starred",

     page1_suffix: "Diary",
     page1_tags: "@diary",
     page1_default: "",

     page2_suffix: "TimeLog",
     page2_tags: "@timeLog",
     page2_default: "TimeLogDefaultData",

     page3_suffix: "Pomodoro",
     page3_tags: "@pomodoro",
     page3_default: "PomodoroDefaultData",

     handler: function ( place,macroName,params,wikifier,paramString,tiddler ) 
     {  
         var buttonLabel = this.label;  
         var buttonTip  = this.tooltip;  

         createTiddlyButton( place,buttonLabel,buttonTip,this.createJournal );  
     },

     createJournal : function(e) 
     {  
         var date = new Date();
         var author = config.options.txtUserName;
         var title = "JRL "+ date.formatString( 'YYYY-0MM-0DD ddd' );
         var category =  config.macros.elnbNewJournal.category;
         
         var text = "";
         var tags;
         var defaultData;
       
         // Page
         // ----------------------------------------------------------------------------------

         var mainTitle = title;
         tags = config.macros.elnbNewJournal.tags;
         
         text = "";         
         store.saveTiddler( mainTitle,mainTitle,text,author,date,tags );
         store.setValue( mainTitle ,"category",category );

         story.displayTiddler( null,mainTitle,DEFAULT_VIEW_TEMPLATE );
     } ,
}
//}}}
/***
''Today journal''
***/
//{{{
config.macros.elnbTodayJournal = {  

     label: "today journal",  
     tooltip: "Open today journal entry",  

     handler: function ( place,macroName,params,wikifier,paramString,tiddler ) 
     {  
         var date = new Date();
         var title = "JRL "+ date.formatString( 'YYYY-0MM-0DD ddd' );
         //createTiddlyLink(place,title,includeText,className,isStatic,linkedFromTiddler,noToggle)
         //createTiddlyLink(createTiddlyElement(popup,"li"),title,true,null,false,null,true);  
         createTiddlyLink( place,title,true,null,false,null,true );  
     },
}
//}}}
/***
''Today journal''
***/
//{{{
config.macros.elnbTodayJournal2 = {  

     label: "today journal",  
     tooltip: "Open today journal entry",  

     handler: function ( place,macroName,params,wikifier,paramString,tiddler ) 
     {  
         var buttonLabel = this.label;  
         var buttonTip  = this.tooltip;  

        var date = new Date();
        buttonLabel = date.formatString( 'YYYY-0MM-0DD ddd' );

        createTiddlyButton( place,buttonLabel,buttonTip,this.openTodayJournal );  
     },

     openTodayJournal : function(e) 
     {  
         var date = new Date();
         var title = "JRL "+ date.formatString( 'YYYY-0MM-0DD ddd' );

         var mainTitle = title;
         story.displayTiddler( null,mainTitle,DEFAULT_VIEW_TEMPLATE );
     } ,
}
//}}}
/***
''New todo''
***/
//{{{
config.macros.elnbNewTodo = {  

     label: "new task",  
     tooltip: "Create a new task",  
     category: "task",
     tags: "#future",

     handler: function ( place,macroName,params,wikifier,paramString,tiddler ) 
     {  
         var buttonLabel = this.label;  
         var buttonTip  = this.tooltip;  

         createTiddlyButton( place,buttonLabel,buttonTip,this.createTodo );  
     },

     createTodo: function(e) 
     {  
         var date = new Date();
         var author = config.options.txtUserName;

         var tid = version.extensions.elnb.newTID();
         var title = "TSK-" + tid;
         var subject = "New task ...";
         var text = "";

         var category =  config.macros.elnbNewTodo.category;
         var tags = config.macros.elnbNewTodo.tags;    

         store.saveTiddler( title,title,text,author,date,tags );
         store.setValue( title,"category",category );       
         store.setValue( title,"subject",subject );      

         story.displayTiddler(null, title, DEFAULT_EDIT_TEMPLATE);
     } ,
}
//}}}
/***
''New question''
***/
//{{{
config.macros.elnbNewQuestion = {  

     label: "new question",  
     tooltip: "Create a new question",  
     category: "question",
     tags: "#open",

     handler: function ( place,macroName,params,wikifier,paramString,tiddler ) 
     {  
         var buttonLabel = this.label;  
         var buttonTip  = this.tooltip;  

         createTiddlyButton( place,buttonLabel,buttonTip,this.createQuestion );  
     },

     createQuestion : function(e) 
     {  
         var date = new Date();
         var author = config.options.txtUserName;

         var tid = version.extensions.elnb.newTID();
         var title = "Q-" + tid;
         var subject = "New question  ...";
         var text = "";

         var category =  config.macros.elnbNewQuestion.category;
         var tags = config.macros.elnbNewQuestion.tags;    

         store.saveTiddler( title,title,text,author,date,tags );
         store.setValue( title,"category",category );       
         store.setValue( title,"subject",subject );      

         story.displayTiddler(null, title, DEFAULT_EDIT_TEMPLATE);
     } ,
}
//}}}
/***
''New meeting''
***/
//{{{
config.macros.elnbNewMeeting = {  

     label: "new meeting",  
     tooltip: "Create a new meeting  minutes",  
     category: "meeting",
     tags: "",

     handler: function ( place,macroName,params,wikifier,paramString,tiddler ) 
     {  
         var buttonLabel = this.label;  
         var buttonTip  = this.tooltip;  

         createTiddlyButton( place,buttonLabel,buttonTip,this.createMeeting);  
     },

     createMeeting: function(e) 
     {  
         var date = new Date();
         var author = config.options.txtUserName;

         var tid = version.extensions.elnb.newTID();
         var title = "MM-" + tid;
         var subject = "New meeting...";
         var text = ""

         var category =  config.macros.elnbNewMeeting .category;
         var tags = config.macros.elnbNewMeeting .tags;    

         store.saveTiddler( title,title,text,author,date,tags );
         store.setValue( title,"category",category );      

         store.setValue( title,"subject",subject );    
         store.setValue( title,"date","" );       
         store.setValue( title,"time","" );       
         store.setValue( title,"attendance","" );       
         store.setValue( title,"location","" );       

         story.displayTiddler(null, title, DEFAULT_EDIT_TEMPLATE);
     } ,
}
//}}}
/***
''New reference''
***/
//{{{
config.macros.elnbNewReference = {  

     label: "new reference",  
     tooltip: "Create a new reference",  
     category: "drawer",
     tags: "",

     handler: function ( place,macroName,params,wikifier,paramString,tiddler ) 
     {  
         var buttonLabel = this.label;  
         var buttonTip  = this.tooltip;  

         createTiddlyButton( place,buttonLabel,buttonTip,this.createReference );  
     },

     createReference : function(e) 
     {  
         var date = new Date();
         var author = config.options.txtUserName;
   
         var title = "FDR "+ date.formatString( 'YYYY0MM0DD' ) +"-XXX";
         var text = "";

         var category =  config.macros.elnbNewReference.category;
         var tags = config.macros.elnbNewReference.tags;    

         store.saveTiddler( title,title,text,author,date,tags );
         store.setValue( title,"category",category );         

         story.displayTiddler(null, title, DEFAULT_EDIT_TEMPLATE);
     } ,
}
//}}}

     