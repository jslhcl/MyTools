#!/usr/bin/python
# -*- coding:utf-8 -*-

"""
Usage: 
	./FindPostsInDouban.py userID groupID

Find all the posts of someone in a specific group
Install BeautifulSoup first
"""

import urllib
import urllib2
import cookielib
import sys
import re
import time
from bs4 import BeautifulSoup
#import pdb

def findAllPostsInAGroup(userID, groupID):
	#pdb.set_trace()
	ret = []
	if not groupID.startswith('http:'):
		groupID = 'http://www.douban.com/group/'+groupID+'/discussion';
	groupSource = urllib.urlopen(groupID).read()
	# groupTitle = re.search('<title>\s*(\S*)\s*</title>', groupSource).group(1)
	lastPgNum = 1
	lastPg = re.search('data-total-page="(.+?)"', groupSource)
	if lastPg:
		lastPgNum = re.search('data-total-page="(.+?)"', groupSource).group(1)
	for pgIdx in range(int(lastPgNum)):
		currentPgUrl = groupID+'?start='+str(pgIdx*25)
		print currentPgUrl
		time.sleep(2)
		currentPgSource = urllib.urlopen(currentPgUrl).read()
		currentPgSoup = BeautifulSoup(currentPgSource)
		tableTag = currentPgSoup.find('table', attrs={'class':'olt'})
		if tableTag:
			for childTag in tableTag.children:
				if str(childTag).find(userID) >= 0:
					ret.append(childTag.td.a.get('href'))
	return ret

if __name__ == '__main__':
	if len(sys.argv) != 3:
		print('Usage: ./FindPostsInDouban.py userID groupID')
		exit(0)
	posts = findAllPostsInAGroup(sys.argv[1], sys.argv[2])
	print posts
	
