const outfit = getOutfit();
const accessories = getAccessories(outfit);
const canvas = document.getElementById("result-model");

const getUserId = () => {
  let userId = localStorage.getItem("mirim-user-id-v1");

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("mirim-user-id-v1", userId);
  }

  return userId;
};

let photo = null;
let score = null;
let photoReady = true;

const drawResult = () => {
  renderOutfit(canvas, outfit, photo);
};

// 받은 점수와 평가 문장을 각각의 화면 칸에 표시함
const displayEvaluation = (point, comment) => {
  document.getElementById("score").textContent = point;
  document.getElementById("evaluation").textContent = comment;
};

// 예전 코디에 저장된 얼굴 사진을 빼고 서버에 보낼 코디를 만듦
const getEvaluationInput = () => {
  const safeOutfit = { ...outfit };
  delete safeOutfit.face;
  let imageCanvas = canvas;
  if (outfit.face !== "") {
    imageCanvas = document.createElement("canvas");
    imageCanvas.width = canvas.width;
    imageCanvas.height = canvas.height;
    renderOutfit(imageCanvas, safeOutfit);
  }
  return { outfit: safeOutfit, image: imageCanvas.toDataURL("image/png") };
};

// 완성된 코디 이미지를 서버에 보내고 AI 점수와 평가문을 표시함
const evaluateOutfit = async () => {
  const button = document.getElementById("evaluate-outfit");
  const recordButton = document.getElementById("save-record");
  if (button.disabled) return;

  button.disabled = true;
  recordButton.disabled = true;
  score = null;
  displayEvaluation("—", "AI가 코디를 평가하는 중이에요.");
  showMessage("");

  try {
    const response = await fetch("http://localhost:5001/api/coordinations/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getEvaluationInput()),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      displayEvaluation("—", data.message || "AI 평가를 받지 못했어요.");
      return;
    }

    score = data.data.score;
    displayEvaluation(score, data.data.feedback);
    recordButton.disabled = false;
  } catch (error) {
    displayEvaluation("—", "AI 평가 서버에 연결하지 못했어요.");
  } finally {
    button.disabled = false;
  }
};

// 점수 목록에 기록을 추가하고 높은 점수 5개만 저장함
const saveRecord = async () => {
  if (score === null) {
    return;
  }

  const name = document.getElementById("record-name").value.trim();

  if (name === "") {
    showMessage("기록할 이름을 입력해주세요.");
    return;
  }

  // 기존 브라우저 저장 기능 유지
  const ranks = readData(RANK_KEY, []);
  ranks.push({ name: name, score: score });
  ranks.sort((a, b) => b.score - a.score);

  if (!saveData(RANK_KEY, ranks.slice(0, 5))) {
    showMessage("브라우저 저장에 실패했어요.");
    return;
  }

  // 추가된 서버 통신 코드
  try {
    const response = await fetch("http://localhost:5001/api/coordinations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: getUserId(),
        nickname: name,
        ...getEvaluationInput(),
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "서버 저장 실패");
    }

    document.getElementById("save-record").disabled = true;

    showMessage("브라우저와 서버에 모두 저장했어요.");
  } catch (error) {
    console.error("서버 저장 오류:", error);

    document.getElementById("save-record").disabled = true;

    showMessage("브라우저에는 저장됐지만 서버 저장에는 실패했어요.");
  }
};
// 캔버스에 그려진 결과를 PNG 주소로 바꿔 다운로드함
const downloadImage = () => {
  if (!photoReady) {
    showMessage("사진을 읽는 중이에요. 잠시 후 다시 눌러주세요.");
    return;
  }
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "미림패션쇼.png";
  link.click();
};

// 코디 객체를 그대로 문자열로 만들어 공유함
const shareCode = () => {
  document.getElementById("share-box").hidden = false;
  document.getElementById("share-code").value = JSON.stringify(outfit);
  showMessage("공유 코드에는 얼굴 사진과 그림도 포함돼요.");
};

// 복사가 막히면 입력칸의 코드를 선택해서 직접 복사할 수 있게 함
const copyCode = async () => {
  const input = document.getElementById("share-code");
  try {
    await navigator.clipboard.writeText(input.value);
    showMessage("코드를 복사했어요.");
  } catch (error) {
    input.focus();
    input.select();
    showMessage("선택된 코드를 직접 복사해주세요.");
  }
};

if (outfit.face !== "") {
  photoReady = false;
  photo = new Image();
  photo.onload = () => {
    photoReady = true;
    drawResult();
  };
  photo.onerror = () => {
    photoReady = true;
    showMessage("사진을 읽지 못해 기본 얼굴로 표시했어요.");
  };
  photo.src = outfit.face;
}
document.getElementById("result-name").textContent = outfit.name + "의 코디";
document.getElementById("outfit-summary").textContent = [
  outfit.hair,
  accessories.join(", ") || "없음",
  outfit.top,
  outfit.bottom,
  outfit.shoes ?? "운동화",
].join(" · ");
drawResult();
