import React, { Component } from 'react';
import './App.css';
import {commaSeparateNumber} from './helpers.js'
class App extends Component {
  state = {
    coinData: [
      {
          "name": "Tether",
          "symbol": "USDT",
          "balance": 3023432,
          "type": "fiat proxy",
          "contract": "https://omniexplorer.info/asset/31",

      },
      {
          "name": "Gemini Dollar",
          "symbol": "GUSD",
          "balance": 1023432,
          "type": "fiat proxy",
          "contract": "https://omniexplorer.info/asset/31",
      },
      {
          "name": "Dai",
          "symbol": "Dai",
          "balance": 23432,
          "type": "crypto collatoralized",
          "contract": "https://omniexplorer.info/asset/31",
      },
      {
          "name": "USCOIN",
          "symbol": "USD",
          "balance": 6023432,
          "type": "fiat proxy",
          "contract": "https://omniexplorer.info/asset/31",
      },
      // source
    ],
    sort:{
      column: 'balance',
      descending: false
    },
    columnHeaders: ["name", "symbol", "balance", "type", "percent"]
  }

  componentDidMount = ()=>{
    this.setState({
      coinData: this.addPercentsToCoins([...this.state.coinData]
        .sort((a,b)=> a['balance'] > b['balance'])) 
        .map((c)=>  Object.assign({}, c, {checked: true})).reverse() 
    })
  }

  sortBy = (header)=>{
    if (header == this.state.sort.column){
      return this.flipSortOrder()
    }
    const coinData = [...this.state.coinData]
    const sort = Object.assign({}, this.state.sort, {column:header} )
    if (sort.descending){
      coinData.sort((a,b)=> a[header] > b[header])
    } else {
      coinData.sort((a,b)=> a[header] < b[header])

    }
    this.setState({coinData,
      sort
    })
  }

  flipSortOrder = () =>{
    const {sort, coinData} = this.state
    this.setState({
      sort: Object.assign({}, sort, {descending:!sort.descending} ),
      coinData: coinData.reverse()
    })
  }

  toggleCheck = (coinIndex) => {
    console.log(coinIndex)
    const coinData = [...this.state.coinData]
    coinData[coinIndex] = Object.assign({}, coinData[coinIndex], {checked: !coinData[coinIndex].checked })
    this.setState({coinData})

  }

  addPercentsToCoins = (coinData) => {
    const total = coinData
    .map((c)=> c.balance)
    .reduce((a,b)=>a + b)
    // filter out unchecked
    coinData.forEach((coin)=>{
      coin.percent = coin.balance / total
    } )
    return coinData
  }
  render() {
    const {coinData, columnHeaders} = this.state

    return (
      <div className="App">
          <table >
            <tbody>
          <tr>
            {columnHeaders.map((h)=>{
              return(
              <th 
                key={h}
                onClick={()=> this.sortBy(h)}
                style={
                h != this.state.sort.column ? { fontWeight: "normal"} : {}
                }>
              {h}
              </th>
            )
            })}
           
          </tr>
          <br/>
        {
          this.state.coinData.map((coin, index)=>{
            return (
              <tr key = {coin.symbol}>
                <td>{coin.name}</td>
                <td>{coin.symbol}</td>
                <td>$ {commaSeparateNumber(coin.balance)}</td>
                <td>{coin.type}</td>
                <td>{(100*coin.percent).toFixed(2)} %</td>
                <td> <input 
                  type="checkbox"
                  checked = {coin.checked}
                  onClick = {()=> this.toggleCheck(index)}
                  />
                </td>
              </tr>
            )
          })
        }
         </tbody>
      </table>
      </div>
    );
  }
}

export default App;


