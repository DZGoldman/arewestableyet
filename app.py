from flask import Flask, render_template
from flask_cors import CORS

import os, json
from coin_data import read_json_file
app = Flask(__name__, static_folder="./build/static", template_folder="./build")

CORS(app)






@app.route('/data', methods=['Get'])
def home():

    return  json.dumps(read_json_file())


@app.route('/', methods=['Get'])

def index():
    '''Return index.html for all non-api routes'''
#   return render_template( 'index.html')
    return 'testing'

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 33507))
    app.run(host='0.0.0.0', port=port, debug=True)


