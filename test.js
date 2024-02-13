const axios = require('axios')
const { config } = require('dotenv')

config()

const API_KEY = process.env.YAHOO_API_KEY

axios({
  method: 'post',
  url: 'https://jlp.yahooapis.jp/JIMService/V2/conversion',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `Yahoo AppID: ${API_KEY}`
  },
  data: {
    id: '1234-1',
    jsonrpc: '2.0',
    method: 'jlp.jimservice.conversion',
    params: {
      q: '真っ白なましろ',
      option: ['hiragana'],
      dictionary: ['base', 'name', 'place', 'zip', 'symbol']
    }
  }
}).then((res) => {
  console.log(res.data)
})
