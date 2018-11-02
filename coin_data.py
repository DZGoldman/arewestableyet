import requests, datetime, json, os

from bs4 import BeautifulSoup

def get_ether_soup(address):
    r = requests.get("https://etherscan.io/token/" + address)
    # r = requests.get(url)
    # print(soup.find_all('a'))
    return BeautifulSoup(r.text, 'html.parser')
def get_holders_count(soup):
    for el in soup.find_all('td'):
        text = el.text
        if "addresses" in text:
            text = text.replace("addresses", "").strip()
            return int(text)
def get_balance_ether(address):
    res = requests.get('https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=' + address+ '&apikey=' + os.environ.get('ETHERSCAN_KEY')).json()
    if res.get('message') == 'OK':
        print(res)
        return res['result']

def get_usdt_balance():
    res = requests.get('http://omniexplorer.info/ask.aspx?api=getpropertytotaltokens&prop=31').json()
    if(isinstance(res, float) ):
        return res

# print(get_balance("0x056fd409e1d7a124bd7017459dfea2f387b6d5cd"))

def read_json_file():
    with open('coins.json') as json_data:
        return json.load(json_data)

def write_json_to_file(d):
    with open('coins.json', 'w') as fp:
        json.dump(d, fp)

def main():
    di = read_json_file()
    coins = di['coins']
    for coin in coins:
        print(coin['name'])
        if coin.get('chain') == 'ether':
            address = coin.get('address')
            balance = get_balance_ether(address)
            balance = balance[0: len(balance) - coin['decimals']]

            soup = get_ether_soup(address)
            holders = get_holders_count(soup)
            coin['holders'] = holders
        elif coin.get('symbol') == "USDT":
            balance = get_usdt_balance() 
        #TODO  sanity check
        coin['balance'] = float(balance)
    di['last_updated'] = str(datetime.datetime.now())
    write_json_to_file(di)