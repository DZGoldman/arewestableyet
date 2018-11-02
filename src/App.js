import React, { Component } from "react";
import "./App.css";
import { commaSeparateNumber } from "./helpers.js";
import FlipMove from "react-flip-move";
import { Table } from "react-bootstrap";
import axios from "axios";

class App extends Component {
  state = {
    coinData: [],
    sort: {
      column: "balance",
      descending: false
    },
    columnHeaders: ["name", "symbol", "balance", "type", "dominance", "holders", "% held by top account"]
  };

  componentDidMount = () => {
    this.dataUrl = "/data";
    if (process.env.NODE_ENV == "development") {
      this.dataUrl = "http://0.0.0.0:33507" + this.dataUrl;
    }

    axios.get(this.dataUrl).then(d => {
      console.log(d);
      this.setState({
        coinData: this.addPercentsToCoins(
          d.data.coins.sort((a, b) => a["balance"] - b["balance"])
        )
          .map(c => Object.assign({}, c, { checked: true }))
          .reverse(),
        lastUpdated: d.data.last_updated
      });
    });
  };

  sortBy = header => {
    console.log(header)
    if (header == this.state.sort.column) {
      return this.flipSortOrder();
    }
    const coinData = [...this.state.coinData];
    const sort = Object.assign({}, this.state.sort, { column: header });
    if (sort.descending) {
      coinData.sort((a, b) => a[header] - b[header]);

    } else {
      coinData.sort((a, b) => b[header] - a[header]);
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
    const total = coinData.map(c => c.balance).reduce((a, b) => a + b);
    // filter out unchecked
    coinData.forEach(coin => {
      coin.dominance = coin.balance / total;
    });
    return coinData;
  };
  render() {
    const { coinData, columnHeaders } = this.state;
    const total =
      coinData.length && coinData.map(c => c.balance).reduce((a, b) => a + b);
    return (
      <div className="App">
        <nav id="navbar" className="navbar navbar-dark">
          <div id="nav-items-container">
            <div>
              <a className="navbar-brand" href="/">
                are we <span id='stable'>stable</span> yet?
              </a>
            </div>
            <div className='go-right'>
              <a className="navbar-brand" href={this.dataUrl}>
                <i className="fas fa-fw fa-code" /> JSON API
              </a>
            </div>
            <div className='go-right'>
              <a
                className="navbar-brand"
                href="https://github.com/ummjackson/awdy"
              >
                <i className="fab fa-fw fa-github" /> Contribute on Github
              </a>
            </div>
          </div>
        </nav>
        <Table className="table table-striped">
          <thead>
            <tr>
              {columnHeaders.map(h => {
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
                    {h}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* <FlipMove > */}
            {this.state.coinData.map((coin, index) => {
              return (
                <tr key={coin.symbol}>
                  <td>{coin.name}</td>
                  <td>{coin.symbol}</td>
                  <td>$ {commaSeparateNumber(coin.balance)}</td>
                  <td>{coin.type}</td>
                  <td>{(100 * coin.dominance).toFixed(2)} %</td>
                  <td>{coin.holders} </td>
                  <td>{coin.whale_balance} </td>
                  
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
        </Table>
        <div id="data-container">
          <div>Total ${commaSeparateNumber(total)}</div>
          <div>Last Updated: {this.state.lastUpdated}</div>
        </div>

        <footer>
    <div className="footer" id="footer">
       
    
    <div className="footer-bottom">
      <div className='footer-row'>
          <div> <p> Created by Daniel Goldman </p> </div>
          <div> <a target ="_blank" href="https://twitter.com/DZack23"> <i className="fab fa-twitter"> </i> </a> </div>
          <div> <a target ="_blank" href="https://github.com/DZGoldman"> <i className="fab fa-github"></i> </a> </div>
          <div> <a target ="_blank" href="https://medium.com/@dzack23"> <i className="fab fa-medium"></i> </a> </div>
          <div> <a target ="_blank" href="http://danielzgoldman.com/"> <i className="fa fa-home"></i> </a> </div>
      </div>
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
