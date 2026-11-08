const outfit = getOutfit();
const accessories = getAccessories(outfit);
const canvas = document.getElementById("result-model");
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

// 서버 연결 전이라 선택한 항목으로 연습 점수 계산함
const evaluateOutfit = () => {
  score = 60;
  if (outfit.hair !== "기본") {
    score += 7;
  }
  if (accessories.length > 0) {
    score += 8;
  }
  if (outfit.top !== "티셔츠") {
    score += 7;
  }
  if (outfit.bottom !== "청바지") {
    score += 6;
  }
  if (outfit.topColor !== outfit.bottomColor) {
    score += 7;
  }
  for (let stroke of outfit.strokes) {
    if (stroke.tool !== "eraser") {
      score += 5;
      break;
    }
  }
  displayEvaluation(score, "의상과 색, 그림 여부로 계산한 연습 점수예요. 실제 AI 평가는 서버 연결 후 사용할 수 있어요.");
  document.getElementById("save-record").disabled = false;
};

// 점수 목록에 기록을 추가하고 높은 점수 5개만 저장함
const saveRecord = () => {
  if (score === null) {
    return;
  }
  const name = document.getElementById("record-name").value.trim();
  if (name === "") {
    showMessage("기록할 이름을 입력해주세요.");
    return;
  }
  const ranks = readData(RANK_KEY, []);
  ranks.push({name: name, score: score});
  ranks.sort((a, b) => b.score - a.score);
  if (saveData(RANK_KEY, ranks.slice(0, 5))) {
    document.getElementById("save-record").disabled = true;
    showMessage("이 브라우저의 연습 랭킹에 저장했어요.");
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
document.getElementById("outfit-summary").textContent = [outfit.hair, accessories.join(", ") || "없음", outfit.top, outfit.bottom, outfit.shoes ?? "운동화"].join(" · ");
drawResult();
