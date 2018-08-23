const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');
const authenticateMiddleware = require('./middlewares/authenticate');

const app = express();

// allow cross-origin requests
app.use(cors());

mongoose.connect('mongodb://appuser:Pass123@ds121190.mlab.com:21190/graphqldemo');

mongoose.connection.once('open', () => {
    console.log('connected to database');
});

app.use('/graphql', authenticateMiddleware(), graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(4000, () => {
    console.log('Listening for requests on port 4000');
});
