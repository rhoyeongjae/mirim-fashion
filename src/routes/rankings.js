const express = require("express");
const router = express.Router();
const db = require("../db");

// 점수 높은 순으로 Top 5 조회
router.get("/", async (req, res) => {
  try {
    const fields = `
      c.coordination_id, c.user_id, c.ai_score, c.ai_feedback, c.coordination_code
    `;
    const order = "ORDER BY c.ai_score DESC, c.coordination_id ASC LIMIT 5";

    let rows;
    try {
      [rows] = await db.query(`
        SELECT ${fields}, u.nickname
        FROM coordinations c
        LEFT JOIN users u ON u.user_id = c.user_id
        ${order}
      `);
    } catch (error) {
      // 예전 DB에는 nickname 열이 없어 점수만 조회함
      if (error.code !== "ER_BAD_FIELD_ERROR") throw error;
      [rows] = await db.query(`SELECT ${fields} FROM coordinations c ${order}`);
    }

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
