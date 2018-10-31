from flask import Flask, request
import os, json, requests, datetime
app = Flask(__name__)

# from bs4 import BeautifulSoup



def get_ether_soup(url):
    # r = requests.get("https://etherscan.io/token/" + address)
    r = requests.get(url)
    # print(soup.find_all('a'))
    return BeautifulSoup(r.text, 'html.parser')

def get_balance_ether(address):
    res = requests.get('https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=' + address+ '&apikey=' + os.environ.get('ETHERSCAN_KEY')).json()
    if res.get('message') == 'OK':
        print(res)
        return res['result']

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
        if coin.get('chain') == 'ether':
            print(coin['name'])
            balance = get_balance_ether(coin.get('address'))
            # sanity check
            balance = balance[0: len(balance) - coin['decimals']]
            coin['balance'] = float(balance)
    di['last_updated'] = str(datetime.datetime.now())
    write_json_to_file(di)
main()
@app.route('/data', methods=['Get'])
def home():

    return  json.dumps(read_json_file())


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 33507))
    app.run(host='0.0.0.0', port=port)


