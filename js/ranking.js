// 저장된 점수를 높은 순서대로 정렬하고 빈 순위에는 안내 문구를 넣음
const showRanking = () => {
  const list = document.getElementById("rank-list");
  const ranks = readData(RANK_KEY, []);
  ranks.sort((a, b) => b.score - a.score);
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

// 확인을 누르면 점수 목록을 비우고 순위 화면을 다시 그림
const clearRecords = () => {
  if (
    confirm("이 브라우저의 연습 기록을 지울까요?") &&
    saveData(RANK_KEY, [])
  ) {
    showRanking();
    showMessage("연습 기록을 지웠어요.");
  }
};

showRanking();
