const mysql = require('mysql2/promise');

async function Database() {
  var sqlConnection: Object = await mysql.createConnection({
    host: 'localhost',
    user: 'istir',
    password: 'weebtoolspasswd',
    database: 'weebtools',
  });
  var connectionPromise = await sqlConnection.connect(function (err: any) {
    if (err) {
      console.log("Couldn't connect to database.");
      throw err;
    }
    console.log('Connected to database');
  });
  return new Promise((resolve: Function, reject) => {
    resolve(sqlConnection);
    reject('NOTOK');
  });
}

export default Database;
