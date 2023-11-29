const express = require('express');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const session = require('express-session');

const app = express();

// 세션을 사용하여 로그인 상태 유지
app.use(
  session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// 'YOUR_KAKAO_REST_API_KEY'를 실제 Kakao API 키로 바꿉니다.
passport.use(
  new KakaoStrategy(
    {
      clientID: 'd7b5a60465ad3dd063d7983eb52d4ae9',
      callbackURL: 'http://localhost:3000/auth/kakao/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // 실제 애플리케이션에서는 데이터베이스에서 사용자가 있는지 확인하고
      // 없으면 새로운 사용자 레코드를 만들어야 합니다.
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// 라우트
app.get('/auth/kakao', passport.authenticate('kakao'));

app.get(
  '/auth/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/' }),
  (req, res) => {
    // 성공적인 인증, 홈 또는 원하는 페이지로 리디렉션
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// 사용자가 인증되었는지 확인하는 미들웨어
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// 예제 보호된 라우트
app.get('/profile', isAuthenticated, (req, res) => {
  res.send(`<h1>안녕하세요, ${req.user.username}</h1><a href="/logout">로그아웃</a>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});
