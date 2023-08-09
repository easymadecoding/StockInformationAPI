const PORT = process.env.PORT || 8000
const express = require('express')
const serverless = require('serverless-http')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()
const router = express.Router();

router.get('/', (req, res) => {
    res.json('Welcome to the stock dividend API')
})


router.get('/dividend/:symbol', (req, res) => {
    const symbol = req.params.symbol

    const url = 'https://www.streetinsider.com/dividend_history.php?q='


    axios.get(url + symbol)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const parsedData = []
            const dividendData = []

            $('td', html).each(function () {
                const data = $(this).text()

                dividendData.push({
                    data
                })
            })

            for (i = 0; i < dividendData.length; i=i+9) {

                var dividend = {
                    ExDivDate: JSON.stringify(dividendData[i]).split(':')[1].slice(1,-2),
                    Amount: JSON.stringify(dividendData[i+1]).split(':')[1].slice(1,-2),
                    DeclarationDate: JSON.stringify(dividendData[i+5]).split(':')[1].slice(1,-2),
                    RecordDate: JSON.stringify(dividendData[i+6]).split(':')[1].slice(1,-2),
                    PaymanetDate: JSON.stringify(dividendData[i+7]).split(':')[1].slice(1,-2),
                }

                parsedData.push(dividend)
              } 

            res.json(parsedData)

        }).catch(err => console.log(err))
})

app.use('/.netlify/functions/index', router)

module.exports.handler=serverless(app)