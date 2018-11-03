import React, { Component } from "react";
import "./App.css";
import FlipMove from "react-flip-move";
import { commaSeparateNumber } from "./helpers.js";
import { Table } from "react-bootstrap";
import axios from "axios";

// import Shuffle from 'react-shuffle'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coinData: [],
      sort: {
        column: "balance",
        descending: false
      },
      columnHeaders:    ["name", "symbol", "balance", "dominance", '24_hour_volume', "vol_dominance", "type", "holders", "percents"],
      columnHeaderNames: ["name", "symbol", "market cap", "cap dominance", "24-hr volume", "volume dominance",  "stability mechanism", "holders", "% held by top account"]
    };

  }


  componentDidMount = () => {
    this.dataUrl = "/data";
    if (process.env.NODE_ENV == "development") {
      this.dataUrl = "http://0.0.0.0:33507" + this.dataUrl;
    }


    axios.get(this.dataUrl).then(d => {
      this.setState({
        coinData: this.addPercentsToCoins(
          d.data.coins.sort((a, b) => a["balance"] >= b["balance"] ? 1 : -1)
        )
          .map(c => Object.assign({}, c, { checked: true }))
          .reverse(),
        lastUpdated: d.data.last_updated
      });

      window.setTimeout(()=>{
        this.wobble()

        window.setInterval( ()=>{
          this.wobble()

        }, 1000*20)

      }, 2000)
    });


  };

  wobble = () => {
    var currentClass = 'rotate'
    var i = 0;
    var id = window.setInterval(()=>{
      i++
      currentClass = currentClass == 'rotate' ? 'back-rotate' : "rotate"
      this.setState({
        rotateClass: currentClass
      }, ()=>{
        if (i > 20){
          window.clearInterval(id)
          this.setState({
            rotateClass: ''
          })
        }
      })
    }, 130)
 
  }

  sortBy = header => {
    console.log(header)
    if (header == this.state.sort.column) {
      return this.flipSortOrder();
    }
    const coinData = [...this.state.coinData];
    const sort = Object.assign({}, this.state.sort, { column: header });
    if (sort.descending) {
      coinData.sort((a, b) => a[header] >= b[header] ? 1 : -1);

    } else {
      coinData.sort((a, b) => b[header] >= a[header] ? 1 : -1);
    }
    this.setState({
      coinData,
      sort
    });
  };

  flipSortOrder = () => {
    const { sort, coinData } = this.state;
    this.setState({
      sort: Object.assign({}, sort, { descending: !sort.descending }),
      coinData: coinData.reverse()
    });
  };

  toggleCheck = coinIndex => {
    console.log(coinIndex);
    const coinData = [...this.state.coinData];
    coinData[coinIndex] = Object.assign({}, coinData[coinIndex], {
      checked: !coinData[coinIndex].checked
    });
    this.setState({ coinData });
  };

  addPercentsToCoins = coinData => {
    const totalBalance = coinData.map(c => c.balance).reduce((a, b) => a + b);
    const totalVolume = coinData.map(c => c['24_hour_volume']).reduce((a, b) => a + b);
    // filter out unchecked
    coinData.forEach(coin => {
      coin.dominance = coin.balance / totalBalance;
      coin.vol_dominance = coin['24_hour_volume'] / totalVolume;
    });
    return coinData;
  };

  getBalanceRef = coin =>{
    if (coin.chain == "ether"){
      return "https://etherscan.io/token/" + coin.address
    } else if (coin.symbol == "USDT"){
      return coin.data_url
    } else if (coin.symbol == "BITUSD"){
      return coin.data_url
    }
  }

  getPercentRef = coin => {
    if (coin.chain == 'ether') {
      return "https://etherscan.io/token/tokenholderchart/" + coin.address
    } else if (coin.symbol == "BITUSD"){
      return "https://cryptofresh.com/a/USD"
    } else if (coin.symbol == "USDT") {
      return "https://omniexplorer.info/address/1NTMakcgVwQpMdGxRQnFKyb3G1FAJysSfz"
    }
  }

  getVolPercent= (n) => {
    if (n < .01){
      return parseFloat( 100 * n).toFixed(4)
    } else {
      return parseFloat( 100 * n).toFixed(2)
    }
  }
  render() {


    const { coinData, columnHeaders } = this.state;
    const total =
      coinData.length && coinData.map(c => c.balance).reduce((a, b) => a + b);
    return (
      <div className="App">
        <nav id="navbar" className="navbar navbar-dark">
          <div id="nav-items-container">
            <div  className="navbar-brand"  onClick={this.wobble}>
              <i className="fas fa-balance-scale"></i>  are we <span className={this.state.rotateClass} id='stable'>stable</span> yet?
            </div>
            <div id='header-right-wrapper'>
              <div>
                <a className="navbar-brand" 
                href={this.dataUrl}>
                  <i className="fas fa-fw fa-code" /> JSON API
                </a>
              </div>
              <div>
                <a
                  className="navbar-brand"
                  href="https://github.com/DZGoldman/arewestableyet"
                >
                  <i className="fab fa-fw fa-github" /> Contribute on Github
                </a>
              </div>
            </div>
          </div>
        </nav>
        <table className="table table-striped">
          <thead>
            <tr   id='header-row'>
              {columnHeaders.map( (h, i) => {
                return (
                  <th
                    key={h}
                    onClick={() => this.sortBy(h)}
                    className={
                      h != this.state.sort.column
                        ? "deemphasized-col"
                        : "emphasized-col"
                    }
                  >
                    {this.state.columnHeaderNames[i]}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* <FlipMove> */}
            {coinData.length  == 0 && <tr>loading...</tr> }
            {coinData.length > 0 && coinData.map((coin, index) => {
              return (
                <tr key={coin.symbol}>
                  <td><a target ='_blank' href={ coin.homepage}>{coin.name}</a></td>
                  <td>{coin.symbol}</td>
                  <td>$ <a target ='_blank' href={ this.getBalanceRef(coin)}> {commaSeparateNumber(coin.balance)} </a> </td>
                  <td>{(100 * coin.dominance).toFixed(2)} %</td>
                  <td>{commaSeparateNumber(coin['24_hour_volume'])}</td>
                  <td>{this.getVolPercent(coin.vol_dominance)} %</td>
                  <td>{coin.type}</td>
                  <td>{coin.holders}</td>
                  <td> <a target ='_blank' href={ this.getPercentRef(coin)}> {coin.percents} % </a></td>
                  
                    {/* <td><input 
                  type="checkbox"
                  checked = {coin.checked}
                  onClick = {()=> this.toggleCheck(index)}
                  /></td> */}
                  
                </tr>
              );
            })}
            {/* </FlipMove> */}
          </tbody>
        </table>
        {coinData.length > 0 && <div id="data-container">
          <div>Total ${commaSeparateNumber(total)}</div>
          <div>Last Updated: {this.state.lastUpdated}</div>
          </div> 
        }

        <footer>
    <div className="footer" id="footer">
       
    
    <div className="footer-bottom">
      <div className='footer-row'>
          <div>Created by Daniel Goldman </div>
          <div> <a target ="_blank" href="https://twitter.com/DZack23"> <i className="fab fa-twitter"> </i> </a> </div>
          <div> <a target ="_blank" href="https://github.com/DZGoldman"> <i className="fab fa-github"></i> </a> </div>
          <div> <a target ="_blank" href="https://medium.com/@dzack23"> <i className="fab fa-medium"></i> </a> </div>
          <div> <a target ="_blank" href="http://danielzgoldman.com/"> <i className="fa fa-home"></i> </a> </div>
      </div>
      <div id='inspired-by'  className='footer-row'> blatantly inspired by &nbsp;<a target='_blank' href='https://arewedecentralizedyet.com/'>arewedecentralizedyet.com</a></div>

        <div  id='tips' className='footer-row'>
          <div > <p> Stability ain't cheap, send a tip: </p> </div> 
            <div className='tip'>BTC: <b>33STRJgjFgG2r8vEy9xLKN5dYfw26tSmVi</b></div>
            <div className='tip'>ETH (or DAI!): <b>0x36de2576CC8CCc79557092d4Caf47876D3fd416c</b></div>
            <div className='tip'>XMR: <b>832DjfVp9ddVwQqq9hvXoHYfRL5f2kyRwDWFBaRdX3151sbp1VNvy5PdTRphnaa4RqGqJFRQfsHdnaPbtyfzQ6jKGtvJdPR</b></div>
        </div>
    </div>
    </div>
</footer>

      </div>
    );
  }
}

export default App;
