const express = require('express')
const serverless = require('serverless-http')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()
const router = express.Router();
const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
}

function dateToUnixTimestamp(dateString) {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const unixTimestamp = Math.floor(date.getTime() / 1000); 

    console.log(dateString + " " + unixTimestamp)
    return unixTimestamp;
}

function dateToUnixTimestampPlusADay(dateString) {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0)); 
    const unixTimestamp = Math.floor(date.getTime() / 1000); 

    console.log(dateString + " " + unixTimestamp)
    return unixTimestamp;
}

function formatDateToMatchApiArgument(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
}

router.get('/', (req, res) => {
    res.json('Welcome to the stock information API')
})

router.get('/return/:symbol/:startDate/:endDate', async (req, res) => {
    
    try{
        var startDateValue = 0;
        var endDateValue = 0;
        var result = 0.0;

        const { symbol, startDate, endDate } = req.params;

        const url = 'https://finance.yahoo.com/quote/' + symbol + '/history/?period1=' + dateToUnixTimestamp(startDate) +'&period2=' + dateToUnixTimestampPlusADay(endDate);
    
        const response = await axios.get(url, {headers,});
        const html = response.data;
    
        const $ = cheerio.load(html);

        const processRows = () => {
            $('tbody tr.svelte-ta1t6m').each((index, element) => {
                const row = $(element);
                const dateCell = row.find('td:nth-child(1)').text();

                if (formatDateToMatchApiArgument(dateCell) == startDate) {
                    startDateValue = parseFloat(row.find('td:nth-child(2)').text());
                }

                if (formatDateToMatchApiArgument(dateCell) === endDate) {
                    endDateValue = parseFloat(row.find('td:nth-child(2)').text());
                }
            });

            if (startDateValue !== 0 && endDateValue !== 0) {
                result = ((endDateValue - startDateValue) / startDateValue) * 100;
                console.log('Percentage Return:', result.toFixed(2) + '%');
                res.json(result);
            } else {
                console.log('Start date or end date not found.');
                res.status(404).send('Start date or end date not found.');
            }
        };

        processRows();

    } catch(error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
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