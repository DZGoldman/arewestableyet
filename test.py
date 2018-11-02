from coin_data import *

a = get_ether_soup("0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359")
print(a.find_all('.content'))
print(a.prettify())
# for el in a.find('#maintable'):
#     text = el.text
#     if "addresses" in text:
#         text = text.replace("addresses", "").strip()
#         print(int(text))