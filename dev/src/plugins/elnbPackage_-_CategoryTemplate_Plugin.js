/***
|Name|CategoryTemplatePlugin|
|Version|1.0.1|
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|License| |
|Type|Plugin|
|Description|Use alternative ViewTemplate/EditTemplate based on category field of a tiddler|
This plugin extends the core function, story.chooseTemplateForTiddler(), so that any given tiddler can be viewed and/or edited using alternatives to the standard tiddler templates.
!!!!!Configuration
>see [[CategoryTemplatePluginConfig]]
!!!!!Revisions
> 2010.08.25 [1.0.1] initial release 
!!!!!Code
***/
//{{{

version.extensions.CategoryTemplatePlugin = {major: 1, minor: 0, revision: 1, date: new Date(2010,8,25)};

/* */
if ( !config.options.CategoryTemplatePlugin )	
      config.options.CategoryTemplatePlugin = {};

      config.options.CategoryTemplatePlugin.txtFieldname = 'category';
      config.options.CategoryTemplatePlugin.Templates = {};

/* */
Story.prototype.categoryTemplate_chooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler
Story.prototype.chooseTemplateForTiddler = function( title,template )
{
      // get core template and split into theme and template name
      var coreTemplate = this.categoryTemplate_chooseTemplateForTiddler.apply(this,arguments);
      var theme = ""; 
      var template = coreTemplate;
      var parts = template.split(config.textPrimitives.sectionSeparator);

      if (parts[1]) 
       { 
         theme=parts[0]; 
         template=parts[1]; 
       }
       // if theme is not specified
      else 
      {
         theme = config.options.txtTheme||""; 
      }

      theme += config.textPrimitives.sectionSeparator;

      // look for templates using category field value as prefix
      var category = store.getValue( title,config.options.CategoryTemplatePlugin.txtFieldname );
      var v = config.options.CategoryTemplatePlugin.Templates[ category ];

      
      // if category is not defined we use the 'template' field
      if ( ( typeof v == "undefined")  || (v =="") ) 
      {
         v = store.getValue( title,"template" );
      }

      // theme##valueTemplate
      if ( store.getTiddlerText( theme + v + template ) )
      { 
            return theme + v + template; 
      }
      // valueTemplate
      if ( store.getTiddlerText( v + template ) )
      { 
            return v + template; 
      }		

      // no match... use core result
      return coreTemplate;
}

//}}}