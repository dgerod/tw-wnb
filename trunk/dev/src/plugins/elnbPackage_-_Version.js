/***
|Name|tw-elnb Version|
|Description|Macro which returns current version.|
|Package|TW-eLNB |
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|Based on| |
|Source||
|Version|1.0.0|
|License||
|~CoreVersion||
|Type|Macro|
***/

//{{{

/* Create tw-elnb namespace */
if( !config.macros.elnb )
   config.macros.elnb = {};

/* Create macro */
config.macros.elnb.version = {
   handler: function ( place )
   {
      var version = "1.0-b";
      wikify( version, place );
   }
};

/* Set macro */
config.macros.elnbVersion = config.macros.elnb.version;
//}}}