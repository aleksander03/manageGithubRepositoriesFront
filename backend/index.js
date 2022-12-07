const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();
const port = 5000;

app.use(bodyParser.json())
app.use(cors())

app.post('/api/login', async (req, res) => {
    const login = req.body.login;
    const password = req.body.password;
    const response = await axios.post('https://api.github.com/user', { login, password });
    res.send();
})

app.get('/', function (req, res) {
    res.send('Get something')
})

app.listen(port, () => {
    console.log(`App listening at ${port} port`);
})