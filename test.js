const axios = require('axios')
const { config } = require('dotenv')
const yt = require('yt-dm-stream-url')

config()

const API_KEY = process.env.YAHOO_API_KEY

// axios({
//   method: 'post',
//   url: 'https://jlp.yahooapis.jp/JIMService/V2/conversion',
//   headers: {
//     'Content-Type': 'application/json',
//     'User-Agent': `Yahoo AppID: ${API_KEY}`
//   },
//   data: {
//     id: '1234-1',
//     jsonrpc: '2.0',
//     method: 'jlp.jimservice.conversion',
//     params: {
//       q: '真っ白なましろ',
//       option: ['hiragana'],
//       dictionary: ['base', 'name', 'place', 'zip', 'symbol']
//     }
//   }
// }).then((res) => {
//   console.log(res.data)
// })

const channelId = 'UCmo-AFrtD4YM1BpUSJZbNfA' // たくたく
// const channelId = 'UCPEheRaHC8AOveyU6VC-2iQ' // しんにじえも
const url = `https://www.youtube.com/channel/${channelId}`
yt.getStream(url)
  .then((result) => {
    console.log(result)
  })
  .catch((reason) => {
    console.error(reason)
  })
