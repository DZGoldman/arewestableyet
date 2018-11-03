import requests, json, os
from bs4 import BeautifulSoup
from time import gmtime, strftime

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

def get_ether_percents(address):
    r = requests.get("https://etherscan.io/token/tokenholderchart/" + address)
    soup =  BeautifulSoup(r.text, 'html.parser')
    t = soup.find_all('td')
    first = [el.text for el in t if '%' in el.text][0].replace('%', "")
    return round(float(first), 2)

def scape_value_ether(soup):
    texts = [el.text for el in soup.find_all('td', {'class', 'tditem'})]
    s = texts[0]
    in_parens = s[s.find("(")+1:s.find(")")]
    text = in_parens.replace(',','').replace('$','')
    return int(float(text))

def get_balance_ether(address):
    res = requests.get('https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=' + address+ '&apikey=' + os.environ.get('ETHERSCAN_KEY')).json()
    if res.get('message') == 'OK':
        # print(res)
        return res['result']

def get_usdt_balance():
    res = requests.get('http://omniexplorer.info/ask.aspx?api=getpropertytotaltokens&prop=31').json()
    if(isinstance(res, float) ):
        return res
def get_btf_usdt_balance():
    data =requests.post(
        url="https://api.omniexplorer.info/v1/address/addr/details/", 
        data={'addr': "1NTMakcgVwQpMdGxRQnFKyb3G1FAJysSfz"}, 
        headers={"Content-Type" :"application/x-www-form-urlencoded"}
        ).json()
    balances = data['balance']
    for balance in balances:
        if balance.get('id') == '31':
            return int(float(balance['value']))* 0.00000001

def get_bit_usd_data():
    r = requests.get("https://cryptofresh.com/api/holders?asset=USD").json()
    count = len(r)
    balance_list = [float(r[key]) for key in r]
    total = sum(balance_list)
    top_holder = max(balance_list)
    top_percent = round(100 *top_holder/total, 2)
    return count, int(total), top_percent

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
        if coin.get('symbol') == "BITUSD":
            coin['holders'], balance, coin['percents'] = get_bit_usd_data()


        elif coin.get('symbol') == "DGX":
            address = coin.get('address')
            soup = get_ether_soup(address)
            balance = scape_value_ether(soup)
            holders = get_holders_count(soup)
            coin['holders'] = holders
            coin['percents'] = get_ether_percents(address)

        elif coin.get('chain') == 'ether':
            address = coin.get('address')
            balance = get_balance_ether(address)
            balance = balance[0: len(balance) - coin['decimals']]

            soup = get_ether_soup(address)
            holders = get_holders_count(soup)
            coin['holders'] = holders
            coin['percents'] = get_ether_percents(address)

        elif coin.get('symbol') == "USDT":
            whale_balance = get_btf_usdt_balance()
            balance = get_usdt_balance() 
            coin['percents'] = round( 100 * whale_balance / balance , 2)


        #TODO  sanity check
        coin['balance'] = float(balance)
        print(coin)
    di['last_updated'] = strftime("%Y-%m-%d %H:%M:%S", gmtime()) + ' ' + strftime("%Z", gmtime())
    if os.environ.get('DEV'):
        write_json_to_file(di)
    return di