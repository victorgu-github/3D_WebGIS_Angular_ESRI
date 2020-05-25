#!/usr/bin/env bash

RED_COLOR='\033[0;31m' # Red Color
BLUE='\033[0;34m'
GREEN_COLOR='\033[0;32m'
NO_COLOR='\033[0;39m' # No Color
BOLD='\033[1m'

usage() {
cat <<EOM
Usage:
    Delete local tag:
        $(basename $0) delete-local <TAG_NAME>
    Delete remote tag:
        $(basename $0) delete-remote <TAG_NAME>
    Reset last commit:
        $(basename $0) reset-last soft/hard
            - soft, reset last commit, keep the change locally
            - hard, reset last commit without saving changes
EOM
    exit 0
}

[ -z $1 ] && { usage; }

case "$1" in
    delete-local)
        if [[ $2 =~ ^v[0-9]+\.[0-9]+\.[0-9]+(a|b|rc)?$ ]] ;
        then
            git tag --delete $2
            echo -e "${RED_COLOR}Delete local TAG:${NO_COLOR} ${BOLD}$2${NO_COLOR}";
        else
            echo -e "\nPlease input a valid version number!";
            exit -1;
        fi
        ;;
    delete-remote)
        if [[ $2 =~ ^v[0-9]+\.[0-9]+\.[0-9]+(a|b|rc)?$ ]] ;
        then
            git push --delete origin $2
            echo -e "${RED_COLOR}Delete remote TAG:${NO_COLOR} ${BOLD}$2${NO_COLOR}";
        else
            echo -e "\n${RED_COLOR}Please input a valid version number${NO_COLOR}";
            exit -1;
        fi
        ;;
    reset-last)
        if [ "$2" == "hard" ];
        then
            echo "Hard reset last commit."
            git reset --hard HEAD~
        else
            echo "Soft reset last commit."
            git reset HEAD~
        fi
        ;;
    *)
        echo -e "\n${RED_COLOR}Please input valid parameters!${NO_COLOR}";
        usage;
        exit -1;;
esac
