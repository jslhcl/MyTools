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
import getpass

# import pdb

# Reference:
# http://linsir.org/post/python-douban-robot
# http://www.crifan.com/note_about_website_crawl_and_emulate_login/

class DoubanAgent:
	def __init__(self, args):
		self.cmd = args.cmd
		self.userID = args.userID
		self.groupID = args.groupID
		self.optAll = args.optAll
		if self.optAll==None:
			self.optAll = 'Cur'
		#self.time = time
		if args.page:
			self.pageNum = int(args.page)
		else:
			self.pageNum = -1

		self.region = args.region
		self.content = args.content

		self.result = []
		self.cookie = None
	
	def start(self):
		if self.cmd == 'search':
			if self.region:
				self.result = self.findPeopleInGroupFilteredByRegion(self.groupID, self.region)
			elif self.groupID:
				self.result = self.findAllPostsInAGroup(self.userID, self.groupID)
			elif self.optAll == 'Cur':
				self.result = self.findAllPostsInJoinedGroups(self.userID)
			elif self.optAll == 'Bef':
				# TODO: check the joined groups before. Need log in first
				print 'TBD'
			else:
				print 'Not supported yet'
		elif self.cmd == 'mailto':
			self.sendMail(self.userID, self.content)
		else:
			print 'Not supported yet'

	def login(self):
		#yourAccount, yourPasswd, otherID = sys.argv[1], sys,argv[2], sys.argv[3]
		loginurl = 'https://www.douban.com/accounts/login'
		cookie = cookielib.CookieJar()
		opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cookie))
		email = raw_input('Your login email?')
		passwd = getpass.getpass('password?')
		# TODO: It is said that the User-Agent is needed in the header, but it is ok now without it
		params = {'form_email':email, 'form_password':passwd, 'source':'None'}
		response = opener.open(loginurl, urllib.urlencode(params))
		if response.geturl().find('http://accounts.douban.com/login') >= 0:
			html = response.read()
			imgurl=re.search('<img id="captcha_image" src="(.+?)" alt="captcha" class="captcha_image"/>', html)
			if imgurl:
				url = imgurl.group(1)
				res = urllib.urlretrieve(url, 'v.jpg')
				captcha=re.search('<input type="hidden" name="captcha-id" value="(.+?)"/>' ,html)
				if captcha:
					vcode = raw_input('captcha:')
					params['captcha-solution'] = vcode
					params['captcha-id'] = captcha.group(1)
					params['login'] = '登录'
		
					response = opener.open(loginurl, urllib.urlencode(params))
					if response.geturl() == 'http://www.douban.com/':
						print 'login success!'
						self.cookie = cookie
						return True
                elif response.geturl().find('http://www.douban.com/') >= 0:
                        print 'login success!'
                        self.cookie = cookie
                        return True

		print 'login Failed!'
		return False
    
        def getck(self):
		if not self.cookie:
			return ""
                for item in self.cookie:
                    if item.name == 'ck':
                        return item.value.strip('"')
                return ""

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

        def findPeopleInGroupFilteredByRegion(self, groupID, region):
        	ret = []
		print 'You cannot see all the groups as an anonymous user\n'
		print 'So please login and make sure you have the corresponding permissions\n'
		isLoginSuccess = self.login()
		if not isLoginSuccess:
			return ret

        	groupUrl = 'http://www.douban.com/group/'+groupID
		opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(self.cookie))
		#req = urllib2.Request(groupUrl)
		#groupSource = opener.open(req).read()
		groupSource = opener.open(groupUrl).read()

		memberNum = int(re.search('浏览所有\S+ \(([0-9]*)\)', groupSource).group(1))
		idx = 0
		while idx < memberNum:
			memberUrl = 'http://www.douban.com/group/'+groupID+'/members?start='+str(idx)
                        print memberUrl
                        time.sleep(2)
			memberPg = opener.open(memberUrl).read()
			memberPgSoup = BeautifulSoup(memberPg)

			#memberTag = memberPgSoup.find('div', attrs={'class':'mod'}, string='成员')
			memberTags = memberPgSoup.find_all('div', attrs={'class':'mod'})
                        if idx==0:
                            memberTag = memberTags[2]
                        else:
                            memberTag = memberTags[0]

			ulTag = memberTag.find('ul')
			for childTag in ulTag.children:
				if str(childTag).find('('+region+')') >= 0:
					ret.append(childTag.div.a.get('href'))

                        idx += 35

		return ret
						
        def sendMail(self, to, content):
            isLoginSuccess = self.login()
            if not isLoginSuccess:
                return
            mailData = {"m_submit":"好了，寄出去", "to": to, "m_text": content, "ck": self.getck()} 
            mailUrl = 'http://www.douban.com/doumail/write'
            opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(self.cookie))
            opener.open(mailUrl, urllib.urlencode(mailData))

if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='GET and POST something automatically in Douban')
	parser.add_argument('cmd', help='which operation do you want to do?')

	parser.add_argument('-u', '--user', dest='userID', help='user id you want to search', metavar='USERID')
	parser.add_argument('-g', '--group', dest='groupID', help='in which group?', metavar='GROUPID')
	parser.add_argument('-a', '--all', dest='optAll', help='all groups currently or joined ever before. Default currently', metavar='[Cur|Bef]')
	#parser.add_argument('-t', '--time', dest='time', help='since when? format: YYYYMMDD', metavar='YYYYMMDD')
	parser.add_argument('-p', '--page', dest='page', help='view how many pages?', metavar='pageNUM')

	parser.add_argument('-r', '--region', dest='region', help='in which region?', metavar='REGION')
	parser.add_argument('-c', '--content', dest='content', help='mail content?', metavar='CONTENT')

	args = parser.parse_args(sys.argv[1:])
	#print args.userID

	da = DoubanAgent(args)
	da.start()
	print da.result
