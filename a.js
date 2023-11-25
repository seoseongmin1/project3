const mysql = require('mysql');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'tj26484827!!',
  database: 'db_test',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');

  // 사용자로부터 입력 받기
  rl.question('Enter your name: ', (userName) => {
    rl.question('Enter title: ', (title) => {
      rl.question('Enter content: ', (content) => {
        // 데이터베이스에 데이터 삽입
        const insertQuery = `INSERT INTO BOARD (ID, TITLE, CONTENT, WDATE) VALUES ('${userName}', '${title}', '${content}', NOW())`;

        connection.query(insertQuery, (err, result) => {
          if (err) {
            console.error('Error inserting data:', err);
            return;
          }
          console.log('Data inserted successfully');

          // 사용자 입력 완료 후 연결 종료
          connection.end();
          rl.close();
        });
      });
    });
  });
});