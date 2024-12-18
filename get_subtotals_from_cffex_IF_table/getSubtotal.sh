#!/bin/bash

# date -d '1 day ago' 
echo $1
#rm -f index.xml	# the front end request has been changed since April 2014
rm -f IF.xml

if [ $# -eq 1 ]; then	#the number of parameters is 0 based
	lstrDate=$1
else
	lstrDate=$(date +%Y%m/%d)	# today
fi

#ofName=$(sed 's/\///' <<< $lstrDate)
#ofName="$ofName.txt"
ofName="result.txt"

#url="http://www.cffex.com.cn/fzjy/ccpm/$lstrDate/index.xml"
url="http://www.cffex.com.cn/fzjy/ccpm/$lstrDate/IF.xml"

wget -q $url

#if [ ! -f index.xml ]; then
if [ ! -f IF.xml ]; then
	echo "no data in $lstrDate"
	exit 0
fi

#./parseXML.awk index.xml $ofName
./parseXML.awk IF.xml $ofName
