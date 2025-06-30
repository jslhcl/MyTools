from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
import time
import sys

# KidsQuest                             - 6a9d5eb8d7f8
# Museum of flight                      - ba4a1c71f547
# Museum of History & Industry          - dcb899890d0c
# Museum of Pop Culture                 - 33c1f0af9b02
# Northwest African American Museum     - b03f547b9c80
# NW Railway Museum                     - 6bccded8c288
# Rhododendron Species Botanical Garden - cd3534a4e786
# Seattle Aquarium                      - 8e456682901d
# Seattle Art Museum                    - 14621cebb10b
# Washington State History Museum       - 0cc2150f16b9
# Wing Luke Museum                      - 9ec25160a8a0
# Woodland Park Zoo                     - 15d03dcb51d3

if __name__ == '__main__':
    if len(sys.argv) != 5:
        print('Usage: python selenium_pass.py 2025-06-30 0cc2150f16b9 {your_account} {your_pin}')
        quit()
    driver = webdriver.Chrome()
    year, month, day = 2025, 6, 29
    url = f'https://rooms.kcls.org/passes/{sys.argv[2]}/book?date={sys.argv[1]}'
    driver.get(url)

    driver.find_element(By.ID, 'username').send_keys(f'{sys.argv[3]}')
    driver.find_element(By.ID, 'password').send_keys(f'{sys.argv[4]}')
    driver.find_element(By.ID, 's-libapps-login-button').click()

    driver.find_element(By.ID, 'terms_accept').click()

    time.sleep(59)
    driver.quit()
