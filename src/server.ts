const express = require("express");
import * as dotenv from 'dotenv';
import { UserController } from './controllers/user';
import { initializeDotenv } from './utils/init-dotenv';
const { trim_all } = require('request_trimmer');
const methodOverride = require('method-override');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
import { initializeLogger } from './utils/inti-logger';

// configure dotenv
initializeDotenv();

// configure logging
export const logger = initializeLogger();

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
app.use('/api/reviews', require('./routes/reviews'));

// swagger configs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// set up the server
app.listen(PORT || 5000, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;