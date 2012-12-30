/***
***/
//{{{

if( !version.extensions.elnb)
       version.extensions.elnb = {};

version.extensions.elnb.elnbExport = {major: 1, minor: 0, revision: 0, date: new Date(2011,2,6)};  

if( !config.extensions.elnb)
       config.extensions.elnb = {};

config.extensions.elnb.ExportData  = {
    filterUserData: "(not %tw-elnb)",
    filterLayout: "(%tw-elnb)"
};

//--
// Backstage tasks
//-- 

config.tasks.elnbExport = {  
    text: "elnbExport", 
    tooltip: "Sync to tw-elnb", 
    content: '<<saveAs "label:Export user data" quiet (not %tw-elnb)>><br><<saveAs "label:Export layout" quiet (%tw-elnb)>>'
}  
   
config.backstageTasks.push( "elnbExport" );  

//}}}