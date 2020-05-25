#!/usr/bin/env bash

set -e

RED_COLOR='\033[0;31m' # Red Color
GREEN_COLOR='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NO_COLOR='\033[0;39m' # No Color

usage() {
cat <<EOM
Usage:
    Deploy to dev/test:
        $(basename $0) dev/test
    Deploy to prod:
        $(basename $0) prod/shanghai-prod <TAG_NAME>
EOM
    exit 0
}

[ -z $1 ] && { usage; }

case "$1" in
    dev|test|DEV|TEST|Test|Dev)
        echo -e "\nNote: Dev env is always using latest commit."
        echo -e "\nDeploy to ${BOLD}dev: ${NO_COLOR}\n"
        git pull -r origin master
        yarn
        npm run release-to-dev
        echo -e "\n${GREEN_COLOR}Deployment to $1 is done!${NO_COLOR}\n"
        ;;
    prod|PROD|Prod)
        if [[ $2 =~ ^v[0-9]+\.[0-9]+\.[0-9]+(a|b|rc)?$ ]] ;
        then
            echo -e "${BOLD}Release number is:${NO_COLOR} ${GREEN_COLOR}$2${NO_COLOR}";
        else
            echo -e "\n${RED_COLOR}Please input a valid version number${NO_COLOR}";
            exit -1;
        fi
        echo -e "\nDeploy to ${BOLD}prod:${NO_COLOR}\n"
        git fetch --tags
        git checkout "tags/$2"
        yarn
        npm run release-to-prod
        echo -e "\n${GREEN_COLOR}Version $2 is deployed to prod!${NO_COLOR}\n"
        ;;
    shanghai-test)
        echo -e "\nNote: Dev env is always using latest commit."
        echo -e "\nDeploy to ${BOLD}dev: ${NO_COLOR}\n"
        git pull -r origin master
        yarn
        npm run release-to-dev --shanghai=true
        echo -e "\n${GREEN_COLOR}Deployment to $1 is done!${NO_COLOR}\n"
        ;;
    shanghai-prod)
        if [[ $2 =~ ^v[0-9]+\.[0-9]+\.[0-9]+(a|b|rc)?$ ]] ;
        then
            echo -e "${BOLD}Release number is:${NO_COLOR} ${GREEN_COLOR}$2${NO_COLOR}";
        else
            echo -e "\n${RED_COLOR}Please input a valid version number${NO_COLOR}";
            exit -1;
        fi
        echo -e "\nDeploy to ${BOLD}prod:${NO_COLOR}\n"
        git fetch --tags
        git checkout "tags/$2"
        yarn
        npm run release-to-prod --shanghai=true
        echo -e "\n${GREEN_COLOR}Version $2 is deployed to Shanghai prod!${NO_COLOR}\n"
        ;;
    *)
        echo -e "\n${RED_COLOR}Please input valid parameters!${NO_COLOR}";
        usage;
        exit -1;;
esac
