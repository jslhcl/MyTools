#!/bin/bash

# .\createFileBatch.sh "10M" 20     # create 20 files each size is 10M

filesize=$1
blockSize=512
blockCount=1

echo ${filesize:(-1)} $2
if [ ${filesize:(-1)} == "g" -o ${filesize:(-1)} == "G" ]; then
	blockSize=1048576  # 1024*1024
	blockCount=$(( ${filesize::-1}*1024 )) # file size * 1024
elif [ ${filesize:(-1)} == "m" -o ${filesize:(-1)} == "M" ]; then
	blockSize=1048576  # 1024*1024
	blockCount=${filesize::-1}
elif [ ${filesize:(-1)} == "k" -o ${filesize:(-1)} == "K" ]; then
	blockSize=1024
	blockCount=${filesize::-1}
fi

echo "blocksize="$blockSize", blockCount="$blockCount

for i in $(eval echo {1..$2})
do
	filename="file"$filesize"_"$i".CR2"
	echo $filename
	dd if=/dev/urandom of=$filename bs=$blockSize count=$blockCount
done
