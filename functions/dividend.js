const express = require('express')
const serverless = require('serverless-http')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()
const router = express.Router();
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
}

function dateToUnixTimestamp(dateString) {

    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const unixTimestamp = Math.floor(date.getTime() / 1000);

    return unixTimestamp;
}

const dateString = '23-10-1990';
const unixTimestamp = dateToUnixTimestamp(dateString);


router.get('/', (req, res) => {
    res.json('Welcome to the stock information API')
})

router.get('/:symbol/:startDate/:endDate', async (req, res) => {
    
    try{
        var startDateValue = 0;
        var endDateValue = 0;
        var result = 0.0;

        console.log('Start: ');

        const { symbol, startDate, endDate } = req.params;

        const url = 'https://finance.yahoo.com/quote/' + symbol + '/history/?period1=' + dateToUnixTimestamp(startDate) +'&period2=' + dateToUnixTimestamp(endDate);
    
        console.log('Url: ', url);
    
        const response = await axios.get(url, {headers,});
        const html = response.data;
    
        const $ = cheerio.load(html);

        console.log('$: ', $);


        $('tbody tr.svelte-ta1t6m').each((index, element) => {
            const row = $(element);
        
            const dateCell = row.find('td:nth-child(1)').text();

            console.log('Date Cell:', dateCell);

            if (dateCell == startDate) {

                startDateValue = row.find('td:nth-child(2)').text();
                console.log('Start Date Value:', startDateValue);
            }

            if (dateCell === endDate) {
                endDateValue = parseFloat(row.find('td:nth-child(2)').text());
                console.log('End Date Value:', endDateValue);
        
                if (startDateValue !== undefined) {
                    result = ((endDateValue - startDateValue) / startDateValue) * 100;
                    console.log('Percentage Return:', result.toFixed(2) + '%');
                } else {
                    console.log('Start date not found.');
                }
            }
        });

        res.json(result)

    } catch(error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
})


router.get('/:symbol', (req, res) => {
    
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
                    PaymentDate: JSON.stringify(dividendData[i+7]).split(':')[1].slice(1,-2),
                }

                parsedData.push(dividend)
              } 

            res.json(parsedData)

        }).catch(err => console.log(err))
})

app.use('/.netlify/functions/dividend', router)

module.exports.handler=serverless(app)
module.exports = router;