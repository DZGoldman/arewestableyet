import React, { Component } from 'react';
import './App.css';

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
      descending: true
    },
    columnHeaders: ["name", "symbol", "balance", "type", "percent"]
  }

  componentDidMount = ()=>{
    this.setState({
      coinData: this.addPercentsToCoins([...this.state.coinData])
    })
  }

  sortBy = (header)=>{
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
              >
              {h}
              </th>
            )
            })}
           
          </tr>
        {
          this.state.coinData.map((coin)=>{
            return <tr key = {coin.symbol}>
                   <td>{coin.name}</td>
                   <td>{coin.symbol}</td>
                   <td>$ {coin.balance}</td>
                   <td>{coin.type}</td>
                   <td>{(100*coin.percent).toFixed(2)} %</td>
            </tr>
          })
        }
         </tbody>
         <button onClick = {this.flipSortOrder}>flip </button>
      </table>
      </div>
    );
  }
}

export default App;
