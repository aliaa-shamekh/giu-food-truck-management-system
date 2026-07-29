<<<<<<< HEAD
const db = require('../connectors/db');

function getSessionToken(req) {
  // Use cookie-parser's req.cookies if available, otherwise fall back to manual parsing
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }
  
  // Fallback to manual parsing if cookie-parser didn't set req.cookies
  if(!req.headers.cookie){
    return null
  }
  const cookies = req.headers.cookie.split(';')
    .map(function (cookie) { return cookie.trim() })
    .filter(function (cookie) { return cookie.includes('session_token') })
    .join('');

  const sessionToken = cookies.slice('session_token='.length);
  if (!sessionToken) {
    return null;
  }
  return sessionToken;
}

async function getUser(req) {

  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    console.log("no session token is found")
    return null;
  }


  const user = await db.select('*')
    .from({ s: 'FoodTruck.Sessions' })
    .where('token', sessionToken)
    .innerJoin('FoodTruck.Users as u', 's.userId', 'u.userId')
    .first(); 

  if (!user) {
    console.log("no user found for session token")
    return null;
  }

  if(user.role == "truckOwner"){
    const TruckRecord = await db.select('*')
    .from({ u: 'FoodTruck.Trucks' })
    .where('ownerId', user.userId)
    // has no FoodTrucks
    if(TruckRecord.length == 0){
      console.log(`This ${user.name} has no owned trucks despite his role`);
      console.log('user =>', user)
      return user; 
    }else{
      const firstRecord = TruckRecord[0];
      const truckOwnerUser =  {...user, ...firstRecord}
      console.log('truck Owner user =>', truckOwnerUser)
      return truckOwnerUser;
    }
  }

  // role of customer
  console.log('user =>', user)
  return user;  
}



module.exports = {getSessionToken , getUser};
=======
const db = require('../connectors/db');

function getSessionToken(req) {
  // Use cookie-parser's req.cookies if available, otherwise fall back to manual parsing
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }
  
  // Fallback to manual parsing if cookie-parser didn't set req.cookies
  if(!req.headers.cookie){
    return null
  }
  const cookies = req.headers.cookie.split(';')
    .map(function (cookie) { return cookie.trim() })
    .filter(function (cookie) { return cookie.includes('session_token') })
    .join('');

  const sessionToken = cookies.slice('session_token='.length);
  if (!sessionToken) {
    return null;
  }
  return sessionToken;
}

async function getUser(req) {

  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    console.log("no session token is found")
    return null;
  }


  const user = await db.select('*')
    .from({ s: 'FoodTruck.Sessions' })
    .where('token', sessionToken)
    .innerJoin('FoodTruck.Users as u', 's.userId', 'u.userId')
    .first(); 

  if (!user) {
    console.log("no user found for session token")
    return null;
  }

  if(user.role == "truckOwner"){
    const TruckRecord = await db.select('*')
    .from({ u: 'FoodTruck.Trucks' })
    .where('ownerId', user.userId)
    // has no FoodTrucks
    if(TruckRecord.length == 0){
      console.log(`This ${user.name} has no owned trucks despite his role`);
      console.log('user =>', user)
      return user; 
    }else{
      const firstRecord = TruckRecord[0];
      const truckOwnerUser =  {...user, ...firstRecord}
      console.log('truck Owner user =>', truckOwnerUser)
      return truckOwnerUser;
    }
  }

  // role of customer
  console.log('user =>', user)
  return user;  
}



module.exports = {getSessionToken , getUser};
>>>>>>> fe566b012d6cc2bd4dcfd0679b988c0b817670cc
