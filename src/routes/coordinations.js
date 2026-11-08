const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db");

// 임시 코디 평가 함수
// 실제 AI 평가 기능은 나중에 연결할 예정
function generateAIFeedback() {
  const score = Math.floor(Math.random() * 26) + 75;

  const feedbacks = [
    "트렌디하면서도 색상 조합이 완벽한 룩이네요. 당신은 혹시 패셔니스타 ?",
    "개성이 돋보이는 개성파 스트릿 패션이네요. 유후~",
    "깔끔하고 과하지 않은 데일리 코디네요. 짱입니다 ! !",
    "시선을 사로잡는 화려하고 임팩트 있는 조합입니다 ! !",
    "시즌 분위기에 딱 맞는 센스 있는 코디네요. 역시는 역시 ! !",
  ];

  const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];

  return {
    score,
    feedback: `[연습용 점수: ${score}점] ${feedback}`,
  };
}

// 코디 전체 정보 저장
router.post("/", async (req, res) => {
  const { user_id, nickname, outfit, score } = req.body;

  if (
    !user_id ||
    typeof user_id !== "string" ||
    !outfit ||
    typeof outfit !== "object" ||
    Array.isArray(outfit)
  ) {
    return res.status(400).json({
      success: false,
      message: "user_id와 outfit 정보가 필요합니다.",
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 사용자가 DB에 없으면 생성
    await connection.query(
      `INSERT INTO users (user_id, nickname)
   VALUES (?, ?)
   ON DUPLICATE KEY UPDATE nickname = VALUES(nickname)`,
      [user_id, nickname || "패션피플"],
    );

    // 얼굴 이미지 데이터는 서버에 저장하지 않음
    const safeOutfit = { ...outfit };
    delete safeOutfit.face;

    // 점수가 전달되지 않으면 임시 점수 생성
    const aiResult =
      Number.isFinite(Number(score)) && score !== undefined
        ? {
            score: Number(score),
            feedback: "코디 점수가 저장되었습니다.",
          }
        : generateAIFeedback();

    if (aiResult.score < 0 || aiResult.score > 100) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "점수는 0~100 사이여야 합니다.",
      });
    }

    // 공유 코드 생성
    const coordination_code = crypto
      .randomBytes(4)
      .toString("hex")
      .substring(0, 6)
      .toUpperCase();

    // 코디 전체 정보를 JSON으로 저장
    const sql = `
      INSERT INTO coordinations
      (user_id, coordination_code, ai_score, ai_feedback, outfit_data)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(sql, [
      user_id,
      coordination_code,
      aiResult.score,
      aiResult.feedback,
      JSON.stringify(safeOutfit),
    ]);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "코디 저장 완료!",
      data: {
        coordination_id: result.insertId,
        coordination_code,
        ai_score: aiResult.score,
        ai_feedback: aiResult.feedback,
        outfit_data: safeOutfit,
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("코디 저장 오류:", error);

    res.status(500).json({
      success: false,
      message: "코디 저장 실패",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// 공유 코드로 코디 조회
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const sql = `
      SELECT
        coordination_id,
        user_id,
        coordination_code,
        ai_score,
        ai_feedback,
        outfit_data,
        created_at
      FROM coordinations
      WHERE coordination_code = ?
    `;

    const [rows] = await db.query(sql, [code]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 코드를 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("코디 조회 오류:", error);

    res.status(500).json({
      success: false,
      message: "코디 조회 실패",
    });
  }
});

module.exports = router;
