#!/bin/bash

TW_SOURCE_DIR=$HOME/Documents/my_data/my_projects/tw-wnb/dev/src
TW_OUTPUT_DIR=$HOME/Documents/my_data/my_projects/tw-wnb/dev/output
TW_COOKER_DIR=$HOME/Documents/my_data/my_projects/tw-wnb/dev/build/cooker

DEFAULT_FILENAME=index
FILENAME=${1:-$DEFAULT_FILENAME}
DEST=$TW_OUTPUT_DIR
RECIPE=$TW_SOURCE_DIR/$FILENAME.html.recipe

ruby -C $TW_COOKER_DIR cook.rb $RECIPE -d$DEST -r$TW_SOURCE_DIR $2 $3 $4
