# MyTools

# My Interesting and Useful Tools

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
