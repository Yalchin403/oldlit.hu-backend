const express = require("express");
import * as dotenv from 'dotenv'


dotenv.config(); // configure dotenv
const PORT = process.env.APP_PORT;

// set up the app
const app = express();
app.use(express.json());
app.use(express.static('static'));

// Define Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/reviews', require('./routes/reviews'))

// set up the server
app.listen(PORT || 5000, () => {
  console.log(`Server is listening on port ${PORT}`);
});

