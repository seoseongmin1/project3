const express = require('express');
const multer = require("multer");
const upload = multer({ dest: "/uploadFile" });
const bodyParser = require('body-parser');
const mysql = require('mysql');



const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// MySQL 연결 설정
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "tj26484827!!",
    database: "db_test",
  });

// MySQL 연결
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// 구글연동
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(require('express-session')({ secret: 'tj26484827!', resave: true, saveUninitialized: true }));
// 사용자 정보를 세션에 저장
// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// // 세션에서 사용자 정보 가져오기
// passport.deserializeUser((obj, done) => {
//     done(null, obj);
// });

// passport.use(new GoogleStrategy({
//     clientID: 'tjtjdals4827@gmail.com',
//     clientSecret: 'tj26484827!',
//     callbackURL: 'http://localhost:3000/auth/google/callback',
// },
//     (accessToken, refreshToken, profile, done) => {
//         // Google 로그인 성공 시의 동작
//         return done(null, profile);
//     }));

// // Google 로그인 요청 처리
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// // Google 로그인 후 콜백 처리
// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/' }),
//     (req, res) => {
//         res.redirect('/');
//     }
// );
// 로그인된 사용자 정보 확인(구글연동)
// app.get('/nowUser', (req, res) => {
//     if (req.isAuthenticated()) {
//         res.send(`Hello, ${req.user.displayName}!`);
//     } else {
//         res.send('Hello, guest!');
//     }
// });

// 로그아웃
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// /Main,.HTML 폼 페이지 렌더링
app.get("/main.html", (req, res) => {
    res.sendFile(__dirname + "/main.html");
});
// /Main,.HTML 폼 페이지 렌더링
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/main.html");
});
app.get("/main2.html", (req, res) => {
  res.sendFile(__dirname + "/main2.html");
});

// /serach.do 엔드포인트 핸들러
app.post('/search.do', (req, res) => {
    const searchKeyword = req.body.title;
  
    // MySQL 쿼리 실행
    const query = `SELECT * FROM touristspots WHERE spot_name LIKE '%${searchKeyword}%'`;
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error('MySQL query error: ', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(results);
      }
    });
  });

// /login html 폼 페이지 렌더링
app.get("/login.html", (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

// 로그인 API
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const selectQuery = 'SELECT username FROM board WHERE username = ? AND password = ?';
    connection.query(selectQuery, [username, password], (err, result) => {
        if (err) {
            console.error('Error querying user:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            if (result.length > 0) {
                console.log('Login successful');
                res.json({ message: '로그인 성공', userId: result[0].username });
            } else {
                console.log('Login failed');
                res.status(401).json({ message: '로그인 실패' });
            }
        }
    });
});

// 아이디 찾기 API
app.get("/findid", (req, res) => {
    res.sendFile(__dirname + "/findid.html");
});

// 아이디 찾기 API
app.post('/findid', (req, res) => {
    console.log('아이디 찾기 요청 받음');
    const { name, phone } = req.body;

    // 실제로는 데이터베이스에서 조회하는 쿼리를 사용해야 합니다.
    // 여기서는 가상의 데이터베이스로 대체합니다.
    const selectQuery = 'SELECT username FROM board WHERE name = ? AND phone = ?';
    connection.query(selectQuery, [name, phone], (err, result) => {
        if (err) {
            console.error('Error querying user:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            if (result.length > 0) {
                console.log('아이디 찾기 성공');
                res.json({ message: '아이디 찾기 성공', username: result[0].username });
            } else {
                console.log('아이디 찾기 실패');
                res.status(404).json({ message: '일치하는 사용자를 찾을 수 없습니다.' });
            }
        }
    });
});

// 비밀번호 찾기 API
app.get("/findpw", (req, res) => {
    res.sendFile(__dirname + "/findpw.html");
});

// 비밀번호 찾기 API
app.post('/findpw', (req, res) => {
    console.log('비밀번호 찾기 요청 받음');
    const { username } = req.body;




    const selectQuery = 'SELECT password FROM board WHERE username=?';
    connection.query(selectQuery, [username], (err, result) => {
        if (err) {
            console.error('Error querying user:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            if (result.length > 0) {
                console.log('비밀번호 찾기 성공');
                res.json({ message: '비밀번호 찾기 성공', password: result[0].password });
            } else {
                console.log('비밀번호 찾기 실패');
                res.status(404).json({ message: '일치하는 사용자를 찾을 수 없습니다.' });
            }
        }
    });
});

// /signup 엔드포인트 핸들러
app.get("/signup.html", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

// 회원가입 엔드포인트
app.post('/signup', (req, res) => {
    const { name, username, password, phone, email } = req.body;

    // 간단한 유효성 검사 (필요한 경우 더 강력한 검사 수행)
    if (!name || !username || !password || !phone || !email) {
        return res.status(400).send('모든 필드를 입력하세요.');
    }

    // 데이터베이스에 데이터 삽입
    const insertQuery = `INSERT INTO board (name, username, password, phone, email) VALUES (?, ?, ?, ?, ?)`;
    connection.query(insertQuery, [name, username, password, phone, email], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('회원가입 중 오류가 발생했습니다.');
        }
        console.log('Registration successful');
        return res.status(200).send('회원가입이 완료되었습니다.');
    });
});

// /touristspots 엔드포인트 핸들러
app.get("/touristspots", (req, res) => {
    // MySQL 쿼리: TouristSpots 테이블의 모든 정보를 선택
    const query = "SELECT * FROM TouristSpots";
    
    // 쿼리 실행
    connection.query(query, (error, results) => {
      if (error) {
        res.status(500).send("Internal Server Error");
        throw error;
      }
      
      // 쿼리 결과를 JSON 형태로 응답
      res.json(results);
    });
  });

// addspot HTML 폼 페이지 렌더링
app.get("/addspot.html", (req, res) => {
    res.sendFile(__dirname + "/addspot.html");
  });
  
  // /addspot 엔드포인트 핸들러
  app.post("/addspot", upload.single("image_data"), (req, res) => {
    const {
      spot_name,
      location,
      phone_number,
      description,
      category,
      rating,
      opening_hours,
      entry_fee,
      website_url,
    } = req.body;
  
    const image_data = req.file.path; // 이미지 파일의 경로
  
    const query = `INSERT INTO TouristSpots (spot_name, location, phone_number, description, 
          category, rating, opening_hours, entry_fee, website_url, image_data) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`; 
  
    connection.query(
      query,
      [
        spot_name,
        location,
        phone_number,
        description,
        category,
        rating,
        opening_hours,
        entry_fee,
        website_url,
        image_data,
      ],
      (error, results) => {
        if (error) {
          res.status(500).send("Internal Server Error");
          throw error;
        }
  
        res.send("Spot added successfully!");
      }
    );
  });

// /spot/:spot_id 엔드포인트 핸들러
app.get("/spot/:spot_id", (req, res) => {
    const spot_id = req.params.spot_id;
  
    // MySQL 쿼리: 특정 spot_id에 대한 정보를 선택
    const query = "SELECT * FROM TouristSpots WHERE spot_id = ?";
  
    // 쿼리 실행
    connection.query(query, [spot_id], (error, results) => {
      if (error) {
        res.status(500).send("Internal Server Error");
        throw error;
      }
  
      // 결과가 없는 경우 404 에러를 보냄
      if (results.length === 0) {
        res.status(404).send("Spot not found");
        return;
      }
  
      // EJS 템플릿을 렌더링하여 HTML로 응답
      res.render("spotdetails", { spot: results[0] });
    });
  });
  
// EJS 설정
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

  // 서버 리스닝
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}/main.html 에서 실행 중입니다.`);
});
