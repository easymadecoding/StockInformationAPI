const express = require('express');
const serverless = require('serverless-http');
const router = require('./dividend'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/.netlify/functions/dividend', router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
