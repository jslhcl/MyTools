#!/bin/bash

rm -f result.txt

for i in {1500..1}
do
	lstrDate=$(date -d "$i day ago" +%Y%m/%d)
	./getSubtotal.sh $lstrDate
done	

sed -i '/^$/d' result.txt
