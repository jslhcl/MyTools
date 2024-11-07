from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
import time
from datetime import datetime
import sys
import math
import unittest

# KidsQuest - 121204
# Museum of flight - 121207
# Museum of History & Industry - 121203
# Museum of Pop Culture - 121206
# NW Railway Museum - 123082
# Rhododendron Species Botanical Garden - 122053
# Seattle Aquarium - 121205
# Seattle Art Museum - 123191
# Washington State History Museum - 121201
# Woodland Park Zoo - 122964

def getTrAndTdIndex(today, date):
    # 0 - Monday, 6 - Sunday
    dOfw = date.weekday()
    gapDays = (date - datetime(today.year, today.month, 1)).days + 1
# calendar in the web site is like:
# Su Mo Tu We Th Fr Sa
    lastWeekDays = (dOfw+2) % 7
    tdIndex = 7 if lastWeekDays == 0 else lastWeekDays
    trIndex = math.ceil((gapDays - tdIndex)/7) + 1
    return trIndex, tdIndex

class Test(unittest.TestCase):
    def test_tr_td_index(self):
        today = datetime(2024, 10, 12)
        tr, td = getTrAndTdIndex(today, datetime(2024, 10, 12))
        self.assertEqual(tr, 2)
        self.assertEqual(td, 7)
        tr, td = getTrAndTdIndex(today, datetime(2024, 10, 13))
        self.assertEqual(tr, 3)
        self.assertEqual(td, 1)
        tr, td = getTrAndTdIndex(today, datetime(2024, 10, 14))
        self.assertEqual(tr, 3)
        self.assertEqual(td, 2)
        tr, td = getTrAndTdIndex(today, datetime(2024, 10, 15))
        self.assertEqual(tr, 3)
        self.assertEqual(td, 3)
        tr, td = getTrAndTdIndex(today, datetime(2024, 10, 18))
        self.assertEqual(tr, 3)
        self.assertEqual(td, 6)
        tr, td = getTrAndTdIndex(today, datetime(2024, 10, 19))
        self.assertEqual(tr, 3)
        self.assertEqual(td, 7)
        tr, td = getTrAndTdIndex(datetime(2024, 10, 23), datetime(2024, 11, 1))
        self.assertEqual(tr, 5)
        self.assertEqual(td, 6)

if __name__ == '__main__':
#    if len(sys.argv) == 1:
#        unittest.main()
    if len(sys.argv) != 3:
        print('Usage: python selenium_pass.py 10/14/2024 121203 {your_account} {your_pin}')
        quit()

    driver = webdriver.Chrome()
    url = "https://www.eventkeeper.com/mars/passes/tkx_passuse_RecordEdit.cfm?curOrg=KCLS&pID="+sys.argv[2]+"&pAvail=4&pDate="+sys.argv[1]+"&chamOrg=KCLS"
    driver.get(url)

    username = driver.find_element(By.ID, "barcode")
    username.send_keys(sys.argv[3])
    userpin = driver.find_element(By.ID, "pin")
    userpin.send_keys(sys.argv[4])
    loginButton = driver.find_element(By.NAME, "bSubmit")
    loginButton.click()

    verifyButton = driver.find_element(By.NAME, "bSubmit")
    verifyButton.click()
    
    editOkButton = driver.find_element(By.NAME, "btnEdit_OK")
    editOkButton.click()

    submitButton = driver.find_element(By.NAME, "bProcessConfirmation")
    submitButton.click()
    
    time.sleep(15)
    driver.quit()
