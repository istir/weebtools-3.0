const mysql = require('mysql2/promise');

async function Database() {
  var sqlConnection = await mysql.createConnection({
    host: 'localhost',
    user: 'istir',
    password: 'weebtoolspasswd',
    database: 'weebtools',
  });
  var connectionPromise = await sqlConnection.connect(function (err) {
    if (err) {
      console.log("Couldn't connect to database.");
      throw err;
    }
    console.log('Connected to database');
  });
  return new Promise((resolve, reject) => {
    resolve(sqlConnection);
    reject('NOTOK');
  });
}

export default Database;
