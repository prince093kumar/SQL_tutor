const mysql = require('mysql2/promise');

async function test() {
  const db = await mysql.createConnection({host:'localhost', user:'root', password:'root', port:3306});
  
  await db.query("CREATE USER IF NOT EXISTS 'u_test'@'%' IDENTIFIED BY 'sandbox'");
  
  // Try backticks first
  try {
    await db.query("GRANT ALL PRIVILEGES ON `user\\_test\\_%`.* TO 'u_test'@'%'");
    console.log('GRANT with backticks successful');
  } catch(e) {
    console.log('GRANT with backticks failed:', e.message);
  }
  
  // Try connecting as u_test and use the database
  const udb = await mysql.createConnection({host:'localhost', user:'u_test', password:'sandbox', port:3306});
  try {
    await udb.query("CREATE DATABASE IF NOT EXISTS user_test_mydb");
    console.log('CREATE DATABASE successful');
  } catch(e) {
    console.log('CREATE DATABASE failed:', e.message);
  }
  process.exit(0);
}
test();
