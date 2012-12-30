/***
|Name|elnbGeTiddlerSubject|
|Description|Returns the 'subject' field of a tiddler, if it does not exist then returns the 'title'. <br>The function is added to TW 'store'.|
|Package|TW-eLNB |
|Version|1.0.0|
|Source||
|Author|[[dieesrod@zyzlab|http://zyzlab.dyndns.org]]|
|License||
|~CoreVersion||
|Type|Plugin|

!Usage
!!Example 1
Code:
{{{
<<forEachTiddler
      where 'tiddler.tags.contains("@timeLog") || 
                tiddler.tags.contains("@pomodoro")'  
      sortBy 'tiddler.title' descending
      write " '* [[' + store.getTiddlerSubject(tiddler) + '|' + tiddler.title + ']]\n' ">>

}}}
Output:
<<forEachTiddler
      where 'tiddler.tags.contains("@timeLog") || 
                tiddler.tags.contains("@pomodoro")'  
      sortBy 'tiddler.title' descending
      write " '* [[' + store.getTiddlerSubject(tiddler) + '|' + tiddler.title + ']]\n' ">>
!!Example 2
Code:
{{{
store.getTiddlerSubjectByTitle("Dashboard")
store.getTiddlerSubjectByTitle("MM-20101029-1")
}}}
Output
 
!Source code
***/
//{{{

Tiddler.prototype.getSubject = function()
{
        var text = "";

        var subject = undefined;
        var fieldName = "subject";

        subject = this.fields[fieldName];

        if( subject == undefined )
           text = tiddler['title'];
        else 
           text = subject;

	return text;
};


TiddlyWiki.prototype.getTiddlerSubject = function (tiddler)
{
        var text = "";

        var subject = undefined;
        var fieldName = "subject";

        subject = this.getValue( tiddler,fieldName );

        if( subject == undefined )
           text = tiddler['title'];
        else 
           text = subject;

	return text;
};

TiddlyWiki.prototype.getTiddlerSubjectByTitle = function (title)
{
        var tiddler = undefined;
        var text = "";

        // Find tiddler by title
        tiddler = this.getTiddler( title );
        if( tiddler == undefined)
           return title; 
        
        // Get subject from tiddler
        var subject = undefined;
        var fieldName = "subject";

        subject = this.getValue( tiddler,fieldName );

        // Return subject if exists or return titlle
        if( subject == undefined )
           text = title;
        else 
           text = subject;

	return text;
};

TiddlyWiki.prototype.existTiddlerSubject = function (tiddler)
{
        var ret;

        var subject = undefined;
        var fieldName = "subject";

        subject = this.getValue( tiddler,fieldName );

        if( subject == undefined )
           ret = false;
        else 
           ret = true;

	return ret;
};
//}}}