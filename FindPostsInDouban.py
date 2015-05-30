#!/usr/bin/python
# -*- coding:utf-8 -*-

"""
Install BeautifulSoup first
"""

import urllib
import urllib2
import cookielib
import sys
import re
import time
from bs4 import BeautifulSoup
import argparse

import pdb

class SearchSession:
	def __init__(self, userID, groupID, allOpt, page):
		self.userID = userID
		self.groupID = groupID
		self.allOpt = allOpt
		if allOpt==None:
			self.allOpt = 'Cur'
		#self.time = time
		if page:
			self.pageNum = int(page)
		else:
			self.pageNum = -1
		self.result = []
	
	def start(self):
		if self.groupID:
			self.result = self.findAllPostsInAGroup(self.userID, self.groupID)
		elif self.allOpt == 'Cur':
			self.result = self.findAllPostsInJoinedGroups(self.userID)
		elif self.allOpt == 'Bef':
			# TODO: check the joined groups before. Need log in first
			print 'TBD'
		else:
			print 'Not supported yet'

	def findAllPostsInAGroup(self, userID, groupID):
		ret = []
		if not groupID.startswith('http:'):
			groupID = 'http://www.douban.com/group/'+groupID+'/discussion';
		groupSource = urllib.urlopen(groupID).read()
		# groupTitle = re.search('<title>\s*(\S*)\s*</title>', groupSource).group(1)
		lastPgNum = 1
		lastPg = re.search('data-total-page="(.+?)"', groupSource)
		if lastPg:
			lastPgNum = int(re.search('data-total-page="(.+?)"', groupSource).group(1))
			if self.pageNum>=0 and self.pageNum<lastPgNum:
				lastPgNum = self.pageNum 

		for pgIdx in range(lastPgNum):
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

	def findAllPostsInJoinedGroups(self, userID):
		ret = []
		joinsUrl = 'http://www.douban.com/group/people/'+userID+'/joins'
		joinsSource = urllib.urlopen(joinsUrl).read()
		pattern = re.compile('<a href="http://www.douban.com/group/[a-zA-Z0-9\-\_]*/">')
		groups = pattern.findall(joinsSource)
		for groupUrl in groups:
			print groupUrl + ' begins'
			posts = self.findAllPostsInAGroup(userID, groupUrl[9:-2]+'discussion')
			ret += posts
		return ret


if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('-u', '--user', dest='userID', help='user id you want to search', metavar='USERID', required=True)
	parser.add_argument('-g', '--group', dest='groupID', help='in which group?', metavar='GROUPID')
	parser.add_argument('-a', '--all', dest='optAll', help='all groups currently or joined ever before. Default currently', metavar='[Cur|Bef]')
	#parser.add_argument('-t', '--time', dest='time', help='since when? format: YYYYMMDD', metavar='YYYYMMDD')
	parser.add_argument('-p', '--page', dest='page', help='view how many pages?', metavar='pageNUM')

	args = parser.parse_args(sys.argv[1:])
	#print args.userID

	ss = SearchSession(args.userID, args.groupID, args.optAll, args.page)
	ss.start()	
	print ss.result
