require('dotenv').config({ path: __dirname+'../.env' });
var mysql      = require('mysql');
// Dev-connection
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'password',
//   database : 'image2pdf_database'
// });

// Prod-connection
var connection = mysql.createConnection({
  host     : 'img2pdf.cytvbvbmlzrr.ap-south-1.rds.amazonaws.com',
  user     : 'admin',
  password : process.env.DATABASE_PASS,
  database : 'img2pdf'
});
 
connection.connect(err=>{
  if(err) console.log(err.message);
});
 
module.exports = connection;
// connection.end();