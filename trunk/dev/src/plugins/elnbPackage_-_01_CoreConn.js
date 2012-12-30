//{{{

// ---
// Information
// ---

if( !version.extensions.elnb )
     version.extensions.elnb = {};

version.extensions.elnb.elnbCore = { major: 1, minor: 0, revision: 0, date: new Date(2011,2,6) };

// ---
// Functions and data
// ---

if( !config.extensions.elnb )
     config.extensions.elnb = {};

config.extensions.elnb.elnbCore = {

     serverType: "file",
     serverHost: "file:///Y:/work/dwm/elnb/sandbox/tw-elnb_core.html",
     corePath: "tw-elnb/base/tw-elnb_core.html",
     coreHost: "",

    setup: function () {
          
          var fileURL = document.location.toString();       
          fileURL = fileURL.substr( 0,fileURL.lastIndexOf("/") );
   
          var coreURL = fileURL + "/" + this.corePath;
          this.coreHost = coreURL;
    } 
};

// ---
// Initialize
// ---

config.extensions.elnb.elnbCore.setup();

//}}}
