const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db");
const axios = require("axios");

// NVIDIA AI로 코디 평가
async function evaluateWithNVIDIA(image, outfit) {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY가 설정되지 않았습니다.");
  }

  if (
    typeof image !== "string" ||
    !/^data:image\/(png|jpeg|webp);base64,/.test(image)
  ) {
    throw new Error("올바른 코디 이미지가 전달되지 않았습니다.");
  }

  const response = await axios.post(
    "https://integrate.api.nvidia.com/v1/chat/completions",
    {
      model: "mistralai/mistral-large-4-1t-a52b",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `다음 코디를 패션 전문가 관점에서 평가해 주세요.
상의: ${outfit.top}
하의: ${outfit.bottom}
신발: ${outfit.shoes || "운동화"}
머리: ${outfit.hair}
상의 색상: ${outfit.topColor}
하의 색상: ${outfit.bottomColor}

이미지를 보고 전체적인 조화, 색상, 스타일을 평가하세요.
점수는 0~100 사이의 정수로 주세요.
한국어로 구체적인 피드백을 작성하세요.
반드시 다음 JSON 형식만 출력하세요.
{"score":85,"feedback":"코디에 대한 평가"}`,
            },
            {
              type: "image_url",
              image_url: { url: image },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      stream: false,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 60000,
    },
  );

  const message = response.data.choices?.[0]?.message;

  console.log("NVIDIA 전체 응답:", JSON.stringify(response.data, null, 2));

  const content = message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("NVIDIA가 텍스트 응답을 반환하지 않았습니다.");
  }

  const jsonText = content.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonText) {
    throw new Error("AI 평가 결과를 읽을 수 없습니다.");
  }

  const result = JSON.parse(jsonText);
  const score = Number(result.score);

  if (
    !Number.isInteger(score) ||
    score < 0 ||
    score > 100 ||
    typeof result.feedback !== "string"
  ) {
    throw new Error("AI 평가 결과 형식이 올바르지 않습니다.");
  }

  return { score, feedback: result.feedback };
}

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

// AI 코디 평가 전용 API
router.post("/evaluate", async (req, res) => {
  const { outfit, image } = req.body;

  if (
    !outfit ||
    typeof outfit !== "object" ||
    Array.isArray(outfit) ||
    typeof image !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "코디 정보와 이미지가 필요합니다.",
    });
  }

  try {
    const safeOutfit = { ...outfit };
    delete safeOutfit.face;

    const result = await evaluateWithNVIDIA(image, safeOutfit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI 평가 오류:", error.message);

    res.status(500).json({
      success: false,
      message: "AI 코디 평가에 실패했습니다.",
    });
  }
});

// 코디 전체 정보 저장
router.post("/", async (req, res) => {
  const { user_id, nickname, outfit, score, feedback } = req.body;

  if (
    !user_id ||
    typeof user_id !== "string" ||
    !outfit ||
    typeof outfit !== "object" ||
    Array.isArray(outfit) ||
    !Number.isInteger(Number(score)) ||
    Number(score) < 0 ||
    Number(score) > 100 ||
    typeof feedback !== "string" ||
    !feedback.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "사용자, 코디, AI 평가 정보가 필요합니다.",
    });
  }

  let connection;

  try {
    const safeOutfit = { ...outfit };
    delete safeOutfit.face;

    const aiResult = {
      score: Number(score),
      feedback: feedback,
    };

    connection = await db.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO users (user_id, nickname)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE nickname = VALUES(nickname)`,
      [user_id, nickname || "패션피플"],
    );

    const coordination_code = crypto
      .randomBytes(4)
      .toString("hex")
      .substring(0, 6)
      .toUpperCase();

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
