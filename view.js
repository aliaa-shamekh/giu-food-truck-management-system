const db = require('../../connectors/db');
const { getSessionToken , getUser } = require('../../utils/session');
const axios = require('axios');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

function handlePrivateFrontEndView(app) {

    // Dashboard - redirects based on user role
    app.get('/dashboard' , async (req , res) => {
        const user = await getUser(req);
        if(user.role == "truckOwner"){
            return res.redirect('/ownerDashboard');
        }
        // role of customer
        return res.render('customerHomepage' , {name : user.name});
    });

    // Customer Routes
    app.get('/trucks', async (req, res) => {
        const user = await getUser(req);
        return res.render('trucks', {name: user.name});
    });

    app.get('/truckMenu/:truckId', async (req, res) => {
        const user = await getUser(req);
        return res.render('truckMenu', {
            name: user.name,
            truckId: req.params.truckId
        });
    });

    app.get('/cart', async (req, res) => {
        const user = await getUser(req);
        return res.render('cart', {name: user.name});
    });

    app.get('/myOrders', async (req, res) => {
        const user = await getUser(req);
        return res.render('myOrders', {name: user.name});
    });

    // Truck Owner Routes
    app.get('/ownerDashboard', async (req, res) => {
        const user = await getUser(req);
        if(user.role !== 'truckOwner') {
            return res.redirect('/dashboard');
        }
        return res.render('ownerDashboard', {name: user.name});
    });

    app.get('/menuItems', async (req, res) => {
        const user = await getUser(req);
        if(user.role !== 'truckOwner') {
            return res.redirect('/dashboard');
        }
        return res.render('menuItems', {name: user.name});
    });

    app.get('/addMenuItem', async (req, res) => {
        const user = await getUser(req);
        if(user.role !== 'truckOwner') {
            return res.redirect('/dashboard');
        }
        return res.render('addMenuItem', {name: user.name});
    });

    app.get('/truckOrders', async (req, res) => {
        const user = await getUser(req);
        if(user.role !== 'truckOwner') {
            return res.redirect('/dashboard');
        }
        return res.render('truckOrders', {name: user.name});
    });

    // Logout route
    app.get('/logout', async (req, res) => {
        const sessionToken = getSessionToken(req);
        if (sessionToken) {
            await db('FoodTruck.Sessions').where('token', sessionToken).del();
        }
        res.clearCookie('session_token');
        return res.redirect('/');
    });

    app.get('/testingAxios' , async (req , res) => {
        try {
            const result = await axios.get(`http://localhost:${PORT}/test`);
            return res.status(200).send(result.data);
        } catch (error) {
            console.log("error message",error.message);
            return res.status(400).send(error.message);
        }
    });  
}  



//  // Customer Routes
//     app.get('/trucks', async (req, res) => {
//         const user = await getUser(req);
//         return res.render('trucks', {name: user.name});
//     });

//     app.get('/truckMenu/:truckId', async (req, res) => {
//         const user = await getUser(req);
//         return res.render('truckMenu', {
//             name: user.name,
//             truckId: req.params.truckId
//         });
//     });

//     app.get('/cart', async (req, res) => {
//         const user = await getUser(req);
//         return res.render('cart', {name: user.name});
//     });

//     app.get('/myOrders', async (req, res) => {
//         const user = await getUser(req);
//         return res.render('myOrders', {name: user.name});
//     });

//     // Truck Owner Routes
//     app.get('/ownerDashboard', async (req, res) => {
//         const user = await getUser(req);
//         if(user.role !== 'truckOwner') {
//             return res.redirect('/dashboard');
//         }
//         return res.render('ownerDashboard', {name: user.name});
//     });

//     app.get('/menuItems', async (req, res) => {
//         const user = await getUser(req);
//         if(user.role !== 'truckOwner') {
//             return res.redirect('/dashboard');
//         }
//         return res.render('menuItems', {name: user.name});
//     });

//     app.get('/addMenuItem', async (req, res) => {
//         const user = await getUser(req);
//         if(user.role !== 'truckOwner') {
//             return res.redirect('/dashboard');
//         }
//         return res.render('addMenuItem', {name: user.name});
//     });

//     app.get('/truckOrders', async (req, res) => {
//         const user = await getUser(req);
//         if(user.role !== 'truckOwner') {
//             return res.redirect('/dashboard');
//         }
//         return res.render('truckOrders', {name: user.name});
//     });

//     // Logout route
//     app.get('/logout', async (req, res) => {
//         const sessionToken = getSessionToken(req);
//         if (sessionToken) {
//             await db('FoodTruck.Sessions').where('token', sessionToken).del();
//         }
//         res.clearCookie('session_token');
//         return res.redirect('/');
//     });

//     app.get('/testingAxios' , async (req , res) => {
//         try {
//             const result = await axios.get(`http://localhost:${PORT}/test`);
//             return res.status(200).send(result.data);
//         } catch (error) {
//             console.log("error message",error.message);
//             return res.status(400).send(error.message);
//         }
//     });  
  
module.exports = {handlePrivateFrontEndView};
  