const mysql = require('mysql2/promise');

async function Database() {
  const sqlConnection = await mysql.createConnection({
    host: 'localhost',
    user: 'istir',
    password: 'weebtoolspasswd',
    database: 'weebtools',
  });
  await sqlConnection.connect((err) => {
    if (err) {
      throw err;
    }
  });
  return new Promise((resolve, reject) => {
    resolve(sqlConnection);
    reject(new Error("Couldn't resolve database connection"));
    throw new Error("Couldn't resolve database connection");
  });
}

export default Database;
