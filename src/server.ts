const express = require("express");
import * as dotenv from 'dotenv'
const { trim_all} = require('request_trimmer');
const methodOverride = require('method-override')


dotenv.config(); // configure dotenv
const PORT = process.env.APP_PORT;

// set up the app
const app = express();
app.use(express.json());
app.use(express.static('static'));
app.use(trim_all);

// override with POST having ?_method=PUT
app.use(methodOverride('_method'));

// Define Routes
app.use('/api', require('./routes/index'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'))

// set up the server
app.listen(PORT || 5000, () => {
  console.log(`Server is listening on port ${PORT}`);
});
