const { v4 } = require('uuid');
const db = require('../../connectors/db');
const axios = require('axios');

function handlePublicBackendApi(app) {

    // Register HTTP endpoint to create new user
    app.post('/api/v1/user', async function(req, res) {
      // Check if user already exists in the system
      const userExists = await db.select('*').from('FoodTruck.Users').where('email', req.body.email);
      //console.log(userExists)
      if (userExists.length > 0) {
        return res.status(400).send('user exists');
      }
      
      try {
        const newUser = req.body;
        const user = await db('FoodTruck.Users').insert(newUser).returning('*');
        return res.status(200).json(user);
      } catch (e) {
        console.log(e.message);
        return res.status(400).send('Could not register user');
      }
    });

    // Register HTTP endpoint to create new user
    app.post('/api/v1/user/login', async function(req, res) {
      // get users credentials from the JSON body
      const { email, password } = req.body
      if (!email) {
        // If the email is not present, return an HTTP unauthorized code
        return res.status(400).send('email is required');
      }
      if (!password) {
        // If the password is not present, return an HTTP unauthorized code
        return res.status(400).send('Password is required');
      }

      // validate the provided password against the password in the database
      // if invalid, send an unauthorized code
      let user = await db.select('*').from('FoodTruck.Users').where('email', email);
      if (user.length == 0) {
        return res.status(400).send('user does not exist');
      }
      user = user[0];
      if (user.password !== password) {
        return res.status(400).send('Password does not match');
      }

      // set the expiry time as 30 minutes after the current time
      const token = v4();
      const currentDateTime = new Date();
      const expiresAt = new Date(+currentDateTime + 18000000); // expire in 3 minutes

      // create a session containing information about the user and expiry time
      const session = {
        userId: user.userId,
        token,
        expiresAt,
      };
      try {
        await db('FoodTruck.Sessions').insert(session);
        // In the response, set a cookie on the client with the name "session_token"
        // and the value as the UUID we generated. We also set the expiration time.
        // Cookie options: httpOnly=false allows client-side JS to read it, sameSite='lax' for cross-site requests
        return res.cookie("session_token", token, { 
          expires: expiresAt,
          httpOnly: false, // Allow client-side JavaScript to access the cookie
          sameSite: 'lax', // Send cookie with same-site requests
          secure: false // Set to true in production with HTTPS
        }).status(200).send('login successful');
      } catch (e) {
        console.log(e.message);
        return res.status(400).send('Could not register user');
      }
    });




};


module.exports = {handlePublicBackendApi};
