const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "/uploadFile" });
const bodyParser = require("body-parser");
const mysql = require("mysql");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(
  session({
    secret: "node-session", // 세션 암호화에 사용되는 비밀키
    resave: false,
    saveUninitialized: true,
  })
);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    key: "loginData",
    secret: "testSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "skagk2fl",
  database: "my_db",
});

// MySQL 연결
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
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

// /Main,.HTML 폼 페이지 렌더링
// app.get("/main.html", (req, res) => {
//   // 사용자 세션 정보를 EJS 템플릿에 전달
//   res.render("main", { userLoggedIn: req.session.userLoggedIn });
// });

// /Main,.HTML 폼 페이지 렌더링
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/main.html");
});
app.get("/main.html", (req, res) => {
  res.sendFile(__dirname + "/main.html");
});

app.get("/cs.html", (req, res) => {
  res.sendFile(__dirname + "/cs.html");
});

// /submit_inquiry 엔드포인트 핸들러
app.post("/submit_inquiry", (req, res) => {
  const { username, email, subject, message } = req.body;

  // qna 테이블에 데이터 삽입
  const insertQuery = `INSERT INTO qna (username, email, subject, message) VALUES (?, ?, ?, ?)`;
  connection.query(
    insertQuery,
    [username, email, subject, message],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("문의 제출 중 오류가 발생했습니다.");
      } else {
        res.json({ success: true });
      }
    }
  );
});

// /MyPage html 폼 페이지 렌더링
app.get("/myPage.html", (req, res) => {
  const user = req.session.user;

  if (user) {
    // 로그인된 사용자인 경우
    res.sendFile(__dirname + "/mypage.html");
  } else {
    // 로그인되지 않은 사용자인 경우
    res.redirect("/login.html"); // 또는 다른 로그인 페이지로 이동
  }
});

// /wishlist html 폼 페이지 렌더링
app.get("/wishlist.html", (req, res) => {
  res.sendFile(__dirname + "/wishlist.html");
});

// wishlist 추가 API
app.post("/addToWishlist", (req, res) => {
  const { username, spot_name } = req.body;

  // 이미 Wishlist에 추가되어 있는지 확인
  const checkQuery = `SELECT * FROM Wishlist WHERE username = ? AND spot_name = ?`;
  connection.query(
    checkQuery,
    [username, spot_name],
    (checkError, checkResults) => {
      if (checkError) {
        console.error("Error checking wishlist:", checkError);
        res.status(500).json({ success: false });
      } else {
        if (checkResults.length > 0) {
          // 이미 추가된 경우
          res.json({
            success: false,
            message: "이미 Wishlist에 추가된 관광지입니다.",
          });
        } else {
          // Wishlist에 추가
          const insertQuery = `INSERT INTO Wishlist (username,spot_name) VALUES (?, ?)`;
          connection.query(
            insertQuery,
            [username, spot_name],
            (insertError, insertResults) => {
              if (insertError) {
                console.error("Error adding to wishlist:", insertError);
                res.status(500).json({ success: false });
              } else {
                res.json({ success: true });
              }
            }
          );
        }
      }
    }
  );
});

// wishlist 불러오기 API
app.get("/wishlist/:username", (req, res) => {
  const username = req.params.username;

  const selectQuery = `
    SELECT w.username, t.spot_name
    FROM Wishlist w
    INNER JOIN TouristSpots t ON w.spot_name = t.spot_name
    WHERE w.username = ?
  `;

  connection.query(selectQuery, [username], (error, results) => {
    if (error) {
      console.error("Error getting wishlist:", error);
      res.status(500).json([]);
    } else {
      res.json(results);
    }
  });
});

// wishlist 항목 제거 API
app.delete("/removeFromWishlist", (req, res) => {
  const { spot_name } = req.body;

  // Wishlist에서 제거
  const deleteQuery = `DELETE FROM Wishlist WHERE spot_name = ?`;
  connection.query(deleteQuery, [spot_name], (error, results) => {
    if (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ success: false });
    } else {
      res.json({ success: true });
    }
  });
});

// /serach.do 엔드포인트 핸들러
app.post("/search.do", (req, res) => {
  const searchKeyword = req.body.title;

  // MySQL 쿼리 실행
  const query = `SELECT * FROM touristspots WHERE spot_name LIKE '%${searchKeyword}%'`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("MySQL query error: ", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

// /login html 폼 페이지 렌더링
app.get("/login.html", async function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

// 로그인 API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const selectQuery =
    "SELECT username FROM board WHERE username = ? AND password = ?";
  connection.query(selectQuery, [username, password], (err, result) => {
    if (err) {
      console.error("Error querying user:", err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      if (result.length > 0) {
        console.log("Login successful");
        req.session.loginData = //유저데이터
          req.session.save((error) => {
            if (error) console.log(error);
          });
        req.session.user = { username: result[0].username };

        res.json({ message: "로그인 성공", userId: result[0].username });
      } else {
        console.log("Login failed");
        res.status(401).json({ message: "로그인 실패" });
      }
    }
  });
});

app.get("/loginCheck", (req, res) => {
  if (req.session.loginData) {
    res.send({ loggedIn: true, loginData: req.session.loginData });
  } else {
    res.send({ loggedIn: false });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// 현재 로그인된 사용자 정보 확인
app.get("/currentUser", (req, res) => {
  const user = req.session.user;

  if (user) {
    res.json({ username: user.username });
  } else {
    res.json({ message: "No user logged in" });
  }
});

// 아이디 찾기 API
app.get("/findid", (req, res) => {
  res.sendFile(__dirname + "/findid.html");
});

// 아이디 찾기 API
app.post("/findid", (req, res) => {
  console.log("아이디 찾기 요청 받음");
  const { name, phone } = req.body;

  // 실제로는 데이터베이스에서 조회하는 쿼리를 사용해야 합니다.
  // 여기서는 가상의 데이터베이스로 대체합니다.
  const selectQuery = "SELECT username FROM board WHERE name = ? AND phone = ?";
  connection.query(selectQuery, [name, phone], (err, result) => {
    if (err) {
      console.error("Error querying user:", err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      if (result.length > 0) {
        console.log("아이디 찾기 성공");
        res.json({ message: "아이디 찾기 성공", username: result[0].username });
      } else {
        console.log("아이디 찾기 실패");
        res
          .status(404)
          .json({ message: "일치하는 사용자를 찾을 수 없습니다." });
      }
    }
  });
});

// 비밀번호 찾기 API
app.get("/findpw", (req, res) => {
  res.sendFile(__dirname + "/findpw.html");
});

// 비밀번호 찾기 API
app.post("/findpw", (req, res) => {
  console.log("비밀번호 찾기 요청 받음");
  const { username } = req.body;
  const selectQuery = "SELECT password FROM board WHERE username=?";
  connection.query(selectQuery, [username], (err, result) => {
    if (err) {
      console.error("Error querying user:", err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      if (result.length > 0) {
        console.log("비밀번호 찾기 성공");
        res.json({
          message: "비밀번호 찾기 성공",
          password: result[0].password,
        });
      } else {
        console.log("비밀번호 찾기 실패");
        res
          .status(404)
          .json({ message: "일치하는 사용자를 찾을 수 없습니다." });
      }
    }
  });
});

// /signup 엔드포인트 핸들러
app.get("/signup.html", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

// 회원가입 엔드포인트
app.post("/signup", (req, res) => {
  const { name, username, password, phone, email } = req.body;

  // 데이터베이스에 데이터 삽입
  const insertQuery = `INSERT INTO board (name, username, password, phone, email) VALUES (?, ?, ?, ?, ?)`;
  connection.query(
    insertQuery,
    [name, username, password, phone, email],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send("회원가입 중 오류가 발생했습니다.");
      }
      console.log("Registration successful");
      res.sendFile(__dirname + "/main.html");
    }
  );
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
