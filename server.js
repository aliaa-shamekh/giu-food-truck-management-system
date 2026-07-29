const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const {handlePrivateBackendApi} = require('./routes/private/api');
const {handlePublicBackendApi} = require('./routes/public/api');
const {handlePublicFrontEndView} = require('./routes/public/view');
const {handlePrivateFrontEndView} = require('./routes/private/view');
const {authMiddleware} = require('./middleware/auth');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

// view engine setup
app.set('views', './views');
app.set('view engine', 'hjs');

// Register hjs template engine for Express
// const hoganExpress = require('hogan-express');
// app.engine('hjs', hoganExpress);
app.use(express.static('./public'));

// Cookie parser middleware - MUST be before routes
//app.use(cookieParser());

// Handle post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

handlePublicFrontEndView(app);
handlePublicBackendApi(app);
app.use(authMiddleware);
handlePrivateFrontEndView(app);
handlePrivateBackendApi(app);

app.listen(PORT, () => {
    console.log(`Server is now listening at port ${PORT} on http://localhost:${PORT}/`);
});







