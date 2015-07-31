#!/usr/bin/env python
# -*- coding:utf-8 -*-

import smtplib
import sys
import time

from email.mime.text import MIMEText

def sendmailBcc(frm, toList, contentFile):
	fp = open(contentFile, 'r')
	msg = MIMEText(fp.read())

	msg['Subject'] = 'Bye'
	msg['From'] = frm
	msg['To'] = frm
	toAddr = [frm]+toList

	s = smtplib.SMTP('localhost')
	# print frm, '===\n', toAddr, '===\n', msg.as_string()
	s.sendmail(frm, toAddr, msg.as_string())
	s.quit()

if __name__ == '__main__':
	if len(sys.argv) < 4:
		print 'usage: ./sendmail.py from emailListFile contentFile'
		exit(0)

	# the format of emailListFile is something like
	# a@company.com
	# b@company.com
	# c@company.com 
	emails = open(sys.argv[2], 'r').readlines()
	emails = map((lambda x: x.rstrip()), emails)	# trim the trailing \n
	
	start = 0
	while start < len(emails):
		interval = emails[start:start+10]
		sendmailBcc(sys.argv[1], interval, sys.argv[3])
		start = start+10
		time.sleep(5)
