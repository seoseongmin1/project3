// /signup 엔드포인트 핸들러
app.get("/signup.html", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
  });
  
  // 회원가입 엔드포인트
  app.post("/signup", (req, res) => {
      const { name, username, password, phone, email } = req.body;
  
      // 중복 확인 API를 호출하여 아이디 중복 여부를 확인
      const checkUsernameUrl = "http://localhost:3000/check-username";
  
      // 중복 확인 API에 POST 요청을 보내어 응답을 받음
      fetch(checkUsernameUrl, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
      })
      .then(response => response.json())
      .then(data => {
          if (!data.isUsernameAvailable) {
              // 아이디가 이미 존재하는 경우
              res.status(400).json({ error: "아이디가 이미 존재합니다." });
          } else {
              // 아이디가 사용 가능한 경우, 회원가입 진행
              const insertQuery = `INSERT INTO board (name, username, password, phone, email) VALUES (?, ?, ?, ?, ?)`;
              connection.query(insertQuery, [name, username, password, phone, email], (err, result) => {
                  if (err) {
                      console.error('Error inserting data:', err);
                      res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
                  } else {
                      console.log('Registration successful');
                      res.status(200).json({ message: '회원가입이 완료되었습니다.' });
                  }
              });
          }
      })
      .catch(error => {
          console.error('Error checking username:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      });
  });
  
  // 사용자 이름 중복 확인 엔드포인트
  // 사용자 이름 중복 확인 엔드포인트
  app.post("/check-username", (req, res) => {
    const { username } = req.body;
  
    // 데이터베이스에서 사용자 이름 확인
    const query = "SELECT * FROM board WHERE username = ?";
    connection.query(query, [username], (error, results) => {
        if (error) {
            console.error("MySQL query error: ", error);
            res.status(500).json({ available: false });
        } else {
            if (results.length > 0) {
                // 중복된 사용자 이름이 존재
                res.json({ available: false });
            } else {
                // 사용 가능한 사용자 이름
                res.json({ available: true });
            }
        }
    });
  });
