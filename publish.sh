#!/bin/bash

# We get the version
version=$(grep "<version>" tiapp.xml | sed -e "s/.*<version>//" -e "s/<.version>//" )
echo "Version : " $version

if [ ! -f ./Release-Notes.$version.txt ]
then
	echo "Release Notes de la version : " $version > ./Release-Notes.$version.txt
	subl -n -w ./Release-Notes.$version.txt
fi
echo
echo "--------------------------------------------------------------------"
echo "Release Notes : "
cat ./Release-Notes.$version.txt
echo "--------------------------------------------------------------------"

read -p "Are you sure to publish the current version ? " -n 1
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi
echo

apiToken='fb8d69b0f974ec8ad0b3623697152199_NjgxMjk5MjAxMi0xMC0xNiAxNToxNzoxNi43NzYyMDI'
teamToken='9e90e19a193196af8292ac34f6e3f8a6_MTQ0MTA0MjAxMi0xMC0xNiAxNToyNTo0MC42NjA0NTM'

echo We compress the dSym files
zip -r build/iphone/build/Debug-iphoneos/StepIn.app.dSYM.zip build/iphone/build/Debug-iphoneos/StepIn.app.dSYM

echo We send it to TestFlight
curl -# http://testflightapp.com/api/builds.json -F file=@build/iphone/build/Debug-iphoneos/StepIn.ipa -F dsym=@build/iphone/build/Debug-iphoneos/StepIn.app.dSYM.zip -F api_token=$apiToken -F team_token=$teamToken -F notes=@./Release-Notes.$version.txt -F notify=True -F distribution_lists='Devs,Testers' -o /tmp/curl.txt


