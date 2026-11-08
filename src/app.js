const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// 라우터 불러오기
const itemRouter = require("./routes/items");
const coordinationRouter = require("./routes/coordinations");
const userRouter = require("./routes/users");
const rankingRouter = require("./routes/rankings");

// 기본 테스트 라우트
app.get("/", (req, res) => {
  res.send("Fashion Backend Server is running!");
});

// API 경로 연결
app.use("/api/items", itemRouter);
app.use("/api/coordinations", coordinationRouter);
app.use("/api/users", userRouter);
app.use("/api/rankings", rankingRouter);

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
