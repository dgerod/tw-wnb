//{{{

/* Create variables */
config.options.CategoryTemplatePlugin = {};
var categoryTemplates = {}

/* Define keyword used for category */
keyword = 'category';

/* And set a template for each category */
categoryTemplates['journal'] = 'JournalPage';
categoryTemplates['task'] = 'Task';
categoryTemplates['question'] = 'Question';
categoryTemplates['meeting'] = 'Meeting';
categoryTemplates['note'] = 'Note';
categoryTemplates['drawer'] = '';

/* Assign keyword and templates to plugin configuration*/
config.options.CategoryTemplatePlugin.txtFieldname = keyword;
config.options.CategoryTemplatePlugin.Templates = categoryTemplates;

//}}}