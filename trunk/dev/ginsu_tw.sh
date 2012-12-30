#!/bin/bash

TW_FILE_DIR=$HOME/Documents/my_data/my_projects/tw-wnb/dev/input
TW_COOKER_DIR=$HOME/Documents/my_data/my_projects/tw-wnb/dev/build/cooker
DEFAULT_FILENAME=index

FILENAME=${1:-$DEFAULT_FILENAME}
DEST=$TW_FILE_DIR
RECIPE=$TW_FILE_DIR/$FILENAME.html

ruby -C $TW_COOKER_DIR ginsu.rb -s $RECIPE -d$DEST $2 $3 $4 $5
