#!/usr/bin/env python3
# -*- coding:utf-8 -*-

import smtplib
import datetime
import requests
import json
import time
from email.mime.text import MIMEText

def GetStockByAlphaVantage(ticker):
    ret = {} 
    query = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=' + ticker + '&apikey=YOURAPIKEY'
    result = requests.get(query)
    if result.status_code == 200:
        #print("\n====\n\n"+str(result.content))
        timePriceDict = json.loads(result.content)['Time Series (Daily)']
        day = 0
        for (time, price) in timePriceDict.items():
            ret[time] = price['5. adjusted close']
            day = day+1
            if day >= 3:
                break
    return ret

def GetStock(ticker):
    return GetStockByAlphaVantage(ticker)

def PriceDrop(result):
    postprice = -1
    ret = True
    for price in result.values():
        if postprice > 0 and float(price) < float(postprice):
            ret = False
        postprice = float(price)
    return ret

def SendMail(mailToList, mailFrom, subject, mailContent):
    mailServer = smtplib.SMTP('localhost')
    msg = MIMEText(mailContent)
    msg['Subject'] = subject
    msg['From'] = mailFrom
    msg['To'] = mailToList
    mailServer.sendmail(mailFrom, mailToList.split(','), msg.as_string())


if __name__ == '__main__':
    mailContent = 'SWPPX:\n'
    result = GetStock('SWPPX')
    mailContent += str(result)
    if PriceDrop(result):
        mailContent += '\nPrice drop for 2 days'

    time.sleep(20)
    mailContent += '\n\nVEIRX:\n'
    result = GetStock('VEIRX')
    mailContent += str(result)
    if PriceDrop(result):
        mailContent += '\nPrice drop for 2 days'

    time.sleep(20)
    mailContent += '\n\nMICFX:\n'
    result = GetStock('MICFX')
    mailContent += str(result)
    if PriceDrop(result):
        mailContent += '\nPrice drop for 2 days'

    time.sleep(20) # will be throttled by AlphaVantage when the usage is > 5 per minute or 500 per day
    mailContent += '\n\nAAPL:\n'
    result = GetStock('AAPL')
    mailContent += str(result)
    if PriceDrop(result):
        mailContent += '\nPrice drop for 2 days'

    time.sleep(20)
    mailContent += '\n\nHome Depot:\n'
    result = GetStock('HD')
    mailContent += str(result)
    if PriceDrop(result):
        mailContent += '\nPrice drop for 2 days'

    time.sleep(20)
    mailContent += '\n\nFLCH:\n'
    result = GetStock('FLCH')
    mailContent += str(result)
    if PriceDrop(result):
        mailContent += '\nPrice drop for 2 days'

    time.sleep(20)
    mailContent += '\n\nSMH:\n'
    result = GetStock('SMH')
    mailContent += str(result)
    if PriceDrop(result):
        mailContent += '\nPrice drop for 2 days'

    time.sleep(20)
    mailContent += '\n\nQQQ:\n'
    result = GetStock('qqq')
    mailContent += str(result)
    if PriceDrop(result):
        mailContent += '\nPrice drop for 2 days'

    time.sleep(20)
    mailContent += '\n\nVOO:\n'
    result = GetStock('voo')
    mailContent += str(result)
    if PriceDrop(result):
        mailContent += '\nPrice drop for 2 days'

    time.sleep(20)
    mailContent += '\n\nCOSTCO:\n'
    result = GetStock('cost')
    mailContent += str(result)
    if PriceDrop(result):
        mailContent += '\nPrice drop for 2 days'
    print(mailContent)
    
    SendMail('TO1@YOURMAIL.COM,TO2@YOURMAIL.COM', 'FROM@YOURMAIL.COM', 'stock prices', mailContent)
