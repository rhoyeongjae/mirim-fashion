const express = require("express");
const router = express.Router();
const db = require("../db");

// 점수 높은 순으로 Top 5 조회
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT coordination_id, user_id, ai_score,
             ai_feedback, coordination_code
      FROM coordinations
      ORDER BY ai_score DESC
      LIMIT 5
    `;

    const [rows] = await db.query(sql);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("랭킹 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "랭킹 조회 실패",
    });
  }
});

module.exports = router;
