# MyTools

# My Interesting and Useful Tools

许多严密周全的哲学系统经不起历史的推排销蚀，在整体上都垮塌了，但是它们的一些个别见解还为后世所采取而未失去时效。好比庞大的建筑物已遭破坏，住不得人，也唬不得人了，而构成它的一些木石砖瓦仍然不失为可资利用的好材料。

## DoubanAgent.py

Features:

1. find all the posts of someone in a specific group / All groups he joins

2. find all the people in a sepcific region in a group

3. send mail automatically

execute

```Bash
./DoubanAgent.py -h
```

for the usage

## sendmail.py

this script is used to send mail to lots of people in bcc, if you don't have the permission to send mail to that group of people.

First of all, you need to set up an SMTP server. It is an easy step in Mac, in which the Postfix has been pre-installed. Check this [page](https://www.phase2technology.com/how-to-enable-local-smtp-server-postfix-on-os-x-leopard/) for the settings

Then you need to expand that mail group to get the email list, and save it to a file (emailListFile). the format of the file should be:

```Bash
person1@company.com
person2@company.com
person3@company.com
```

Then call the script:

```Bash
./sendmail.py your@email.com emailListFile contentFile
```

## upload.js

use Node.js to received an uploaded .tex file, and return the corresponding .pdf file as response

## createFileBatch.sh

Script to create batch files. 

```Batch
./createFileBatch.sh "10M" 20     # create 20 files each size is 10M
```

## doubanGroup.js

js version douban agent

## leetcode\_allProblems.js

Retrieve all problems of leetcode

