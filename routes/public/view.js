<<<<<<< HEAD

function handlePublicFrontEndView(app) {
  
    app.get('/', function(req, res) {
        return res.render('login');
      });
    
      app.get('/register', async function(req, res) {
        return res.render('register');
      });
}  
  
module.exports = {handlePublicFrontEndView};
  
=======

function handlePublicFrontEndView(app) {
  
    app.get('/', function(req, res) {
        return res.render('login');
      });
    
      app.get('/register', async function(req, res) {
        return res.render('register');
      });
}  
  
module.exports = {handlePublicFrontEndView};
  
>>>>>>> fe566b012d6cc2bd4dcfd0679b988c0b817670cc
