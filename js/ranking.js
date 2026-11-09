// 서버 순위와 브라우저 순위를 각각 같은 방식으로 그려 줌
const renderRanking = (list, ranks) => {
  list.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const row = document.createElement("li");
    row.innerHTML = `<strong>${i + 1}위</strong><span></span><em></em>`;
    if (ranks[i]) {
      row.children[1].textContent = ranks[i].name;
      row.children[2].textContent = ranks[i].score + "점";
    } else {
      row.children[1].textContent = "등록된 기록 없음";
      row.children[2].textContent = "— 점";
    }
    list.appendChild(row);
  }
};

// 서버에서 내려준 TOP 5를 별도로 표시함
const showServerRanking = async () => {
  const status = document.getElementById("ranking-status");
  const list = document.getElementById("rank-list");
  status.textContent = "서버 순위를 불러오는 중이에요.";

  try {
    const response = await fetch("http://localhost:5001/api/rankings", {
      signal: AbortSignal.timeout(8000),
    });
    const result = await response.json();
    if (!response.ok || !result.success || !Array.isArray(result.data)) {
      throw new Error("랭킹 조회 실패");
    }
    const ranks = result.data.map(row => ({
      name: row.nickname || "패션피플",
      score: Number(row.ai_score),
    }));
    renderRanking(list, ranks);
    status.textContent = ranks.length ? "" : "서버에 등록된 점수가 아직 없어요.";
  } catch {
    status.textContent = "서버 순위를 불러오지 못했어요. 백엔드와 DB가 켜져 있는지 확인해주세요.";
  }
};

const showLocalRanking = () => {
  const ranks = readData(RANK_KEY, []);
  ranks.sort((a, b) => b.score - a.score);
  renderRanking(document.getElementById("local-rank-list"), ranks);
};

// 확인을 누르면 이 브라우저에 저장된 기록만 비움
const clearRecords = () => {
  if (
    confirm("이 브라우저의 연습 기록을 지울까요?") &&
    saveData(RANK_KEY, [])
  ) {
    showLocalRanking();
    showMessage("연습 기록을 지웠어요.");
  }
};

showLocalRanking();
showServerRanking();
