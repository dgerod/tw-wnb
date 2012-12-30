/***
|''Name:''|BackupOptionsPlugin|
|''Version:''|1.0.1 (2007-09-29)|
|''Source:''|None|
|''Author:''|Tyler Akins|
|''Licence:''|Public domain|
|''TiddlyWiki:''|2.0+|
|''Browser:''|Firefox 1.0.4+; InternetExplorer 6.0|

!Description
Tired of having thousands of backups made due to saving every minor edit?  Do you only want one backup per hour, day, or just one backup ever?  Not a problem.

This plugin lets you define a file format that you want to use when saving backups.  Because backups will overwrite each other if they have the same name, you can now control how often new backup files are created.  If you want one created every day, just include the year, month, and day in your format and avoid using the hours, minutes, seconds, and milliseconds.  If you want only one backup, set a static name and it will just keep overwriting the old file.

!Configuration
Select what attributes you want to include in the backup filename in the order you like.  Dates are all in UTC format.  If the format field is left blank, it defaults to what the backups would normally be named:  {{{%N.%Y%M%D.%h%m%s%n.html}}}

{{wideInput{<<option txtBackupOptionsFormat 40>>}}}

|!Code|!Description|!Example|
| ''%D'' |Day of month, two digits| 18 |
| ''%h'' |Hour, two digits, 24 hour format| 21 |
| ''%M'' |Month number, two digits| 11 |
| ''%m'' |Minute, two digits| 59 |
| ''%N'' |Base name of the wiki| TiddlyWiki |
| ''%n'' |Millisecond, four digits| 8441 |
| ''%s'' |Seconds, two digits| 06 |
| ''%Y'' |Year, four digits| 2006 |
| ''%y'' |Year, two digits| 06 |
| ''%%'' |A percent symbol| % |

!Examples
Based on a base filename of "TiddlyWiki.html", and a date of 2006-11-18 21:59:06.8441, here are a few format options:

|!''Format''|!Description|
|!//Sample//|~|
| ''%N.bak'' |Saves only one backup, ever.  Always overwrites the .bak file with a new backup, keeping just one file around.|
| //TiddlyWiki.bak// |~|
| ''%N.%Y%M%D.%h%m%s%n.html'' |This is the default format that TiddlyWiki uses when making a new backup.|
| //TiddlyWiki.20061118.2159068441.html// |~|
| ''%N-%Y-%M-%D.html'' |Keep around only one backup per day.  When a new backup is made, it will overwrite any other backups made on that day.|
| //TiddlyWiki-2006-11-18.html// |~|
| ''Backups\%Y%M\%N-%D-%h%m.bak'' |Save all backups in a set of directories, with one directory that contains all, then another subdirectory that holds a year and month, and then the backup file.|
| //Backups\200611\TiddlyWiki-18-2159.bak// |~|

!Revision history
* v1.0.0 (2007-09-29)
** Initial release

!Code
***/
//{{{
//============================================================================
//                           BackupOptionsPlugin

// Ensure that the BackupOptionsPlugin is only installed once.
//

if (!version.extensions.BackupOptionsPlugin) {

setStylesheet(".wideInput input { width:30em; }","BackupOptionsStylesheet");

version.extensions.BackupOptionsPlugin = {
    major: 1, minor: 0, revision: 0,
    date: new Date(2007, 9, 11), 
    type: 'plugin',
    source: "http://rumkin.com/tools/tiddlywiki/#BackupOptionsPlugin"
};


if (!config.options.txtBackupOptionsFormat)
	config.options.txtBackupOptionsFormat = "%N.%Y%M%D.%h%m%s%n.html"; // Same as default format
if (config.optionsDesc)
	config.optionsDesc.txtBackupOptionsFormat = "Filename format for backups."

if (version.major < 2) alertAndThrow("BackupOptionsPlugin requires TiddlyWiki 2.0 or newer.");

//============================================================================
// Overwrite the built-in functions

getBackupPath = function(localPath) {
	var formatString = config.options['txtBackupOptionsFormat'];
	if (formatString == undefined || ! formatString || formatString == '')
		formatString = '%N.%Y%M%D.%h%m%s%n.html';
	var backSlash = true;
	var dirPathPos = localPath.lastIndexOf("\\");
	if (dirPathPos == -1)
	{
		dirPathPos = localPath.lastIndexOf("/");
		backSlash = false;
	}
	var backupFolder = config.options.txtBackupFolder;
	if (! backupFolder || backupFolder == '')
		backupFolder = '.';
	backupFolder += (backSlash ? "\\" : '/');
	var backupPath = localPath.substr(0, dirPathPos) + (backSlash ? "\\" : '/') + backupFolder;
	var backupBase = localPath.substr(dirPathPos)
	backupBase = backupBase.substr(0, backupBase.lastIndexOf('.'));
	var d = new Date()
	while (formatString.length > 0)
	{
		var formatHandled = 0;
		if (formatString.length > 1 && formatString.charAt(0) == '%')
		{
			formatHandled = 1;
			switch (formatString.charAt(1))
			{
				case 'D':
					backupPath += String.zeroPad(d.getUTCDate(), 2);
					break;
				case 'h':
					backupPath += String.zeroPad(d.getUTCHours(), 2);
					break;
				case 'M':
					backupPath += String.zeroPad(d.getUTCMonth(), 2);
					break;
				case 'm':
					backupPath += String.zeroPad(d.getUTCMinutes(), 2);
					break;
				case 'N':
					backupPath += backupBase;
					break;
				case 'n':
					backupPath += String.zeroPad(d.getUTCMilliseconds(), 4);
					break;
				case 's':
					backupPath += String.zeroPad(d.getUTCSeconds(), 4);
					break;
				case 'Y':
					backupPath += String.zeroPad(d.getUTCFullYear(), 4);
					break;
				case 'y':
					backupPath += String.zeroPad(d.getUTCFullYear() % 100, 4);
					break;
				case '%':
					backupPath += '%';
					break;
				default:
					formatHandled = 0;
			}
			if (formatHandled)
				formatString = formatString.substr(2);
		}
		if (! formatHandled)
		{
			backupPath += formatString.charAt(0);
			formatString = formatString.substr(1);
		}
	}

	return backupPath;
}

} // of "install only once"
//}}}
/***

!Licence and Copyright
You are free to use this however you like.  I place this code into the public domain.
***/
