#! /bin/bash

set -e

RED_COLOR='\033[0;31m' # Red Color
BLUE='\033[0;34m'
GREEN_COLOR='\033[0;32m'
NO_COLOR='\033[0;39m' # No Color
BOLD='\033[1m'

echo -e "\n"
echo -e "******************************************************************"
echo -e "*                                                                *"
echo -e "*  This script is to tag current commit and push TAG to remote.  *"
echo -e "*                                                                *"
echo -e "******************************************************************\n"
read -r -p "$(echo -e ${GREEN_COLOR}Have you updated release doc and CHANGELOG file?${NO_COLOR} [y/N])" response
case "$response" in
    [yY][eE][sS]|[yY])
        echo -e "\n"
        ;;
    *)
        echo -e "\n${RED_COLOR}Please update release doc and CHANGELOG first!${NO_COLOR}";
        exit;;
esac

read -r -p "$(echo -e ${GREEN_COLOR}Please input a release number:${NO_COLOR} )" response
if [[ $response =~ ^v[0-9]+\.[0-9]+\.[0-9]+(a|b|rc)?$ ]] ;
then
    echo -e "Release number is: ${GREEN_COLOR}$response${NO_COLOR}";
else
    echo -e "${RED_COLOR}Please input a valid version number such as:${NO_COLOR} ${BOLD}v1.12.10 or v1.12.10rc${NO_COLOR}";
    exit;
fi

npm version $response -m "[Release] version ${response}"

git push origin tag $response
