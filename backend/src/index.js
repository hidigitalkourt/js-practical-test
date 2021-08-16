const express = require('express');
const {mysqlDb} = require('./db');

const app = express();
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })


/**
 * Route that serves the static content from the `frontned-reference` directory,
 * which contains the sample web client.
 */

app.use('/', express.static('../frontend-reference'));
let database = mysqlDb();
//GET A LIST OF BUGS
app.get('/api/bugs', (req, res) => {
  const data =  database.query('SELECT * from bugs', (error, results, fields) => {
    res.json({bugs: [results]});
  });
});

//CREATE A BUG
app.post('/api/bug', urlencodedParser, (req, res) => {  
  const data = database.query(`INSERT INTO bugs (title, description, status ) VALUES (?, ?, ?)`,
  [req.body.title, req.body.description, req.body.status], (error, results, fields) => {
    const id = results.insertId;
    console.log(id);
    console.log(error);

    const bug = database.query(`SELECT * from bugs WHERE bug_id = (?)`, [id], (error, results, fields) => {
      console.log(error);
      const b = {
        title: results[0].title,
        description: results[0].description,
        status: results[0].status

      }
      res.json({bugs: b});
    });
  })

});

//ASSIGN A BUG
//CHANGE A BUG TO RESOLVED
//DELETE A BUG
/**
 * Start the server via `npm start`
 */
app.listen(5000, () => {
  console.log('Listening on port 5000...');
});
