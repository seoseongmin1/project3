const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL 연결 설정
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
});

// 미들웨어 설정
app.use(bodyParser.json());



app.get("/", (req, res) => {
  res.sendFile(__dirname + "/main.html");
});
// /signiup 엔드포인트 핸들러
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

// 회원가입 엔드포인트
app.post('/signup', (req, res) => {
  const { name, username, password,phone, email } = req.body;

  // 간단한 유효성 검사 (필요한 경우 더 강력한 검사 수행)
  if (!name || !username || !password || !phone || !email) {
    return res.status(400).send('모든 필드를 입력하세요.');
  }

  // 데이터베이스에 데이터 삽입
  const insertQuery = `INSERT INTO board (name, id, password,phone, email) VALUES (?, ?, ?, ?, ?)`;
  connection.query(insertQuery, [name, username, password, phone, email], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('회원가입 중 오류가 발생했습니다.');
    }
    console.log('Registration successful');
    return res.status(200).send('회원가입이 완료되었습니다.');
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
