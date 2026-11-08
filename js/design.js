let outfit = getOutfit();
let photo = null;
let tool = "pen";
let drawing = false;
let pointerId = null;
let pointCount = 0;
const canvas = document.getElementById("model");

const drawCharacter = () => {
  renderOutfit(canvas, outfit, photo);
};

// 기본 인물을 먼저 그리고 사진 로딩이 끝나면 얼굴을 넣어서 다시 그림
const loadCharacter = () => {
  photo = null;
  if (outfit.face !== "") {
    photo = new Image();
    photo.onload = drawCharacter;
    photo.src = outfit.face;
  }
  drawCharacter();
};

const saveCurrent = () => {
  return saveData(CURRENT_KEY, outfit);
};

// 선택한 액세서리만 체크하고, 비어 있으면 없음에 체크함
const showAccessories = () => {
  for (const button of document.getElementsByName("acc")) {
    button.checked = button.value === "없음"
      ? outfit.acc.length === 0
      : outfit.acc.includes(button.value);
  }
};

// 현재 코디 값에 맞춰 선택 표시, 색상 입력칸, 그림 점 개수를 맞춤
const showOutfit = () => {
  if (outfit.shoes === undefined) outfit.shoes = "운동화";
  document.getElementById("model-name").textContent = outfit.name;
  outfit.acc = getAccessories(outfit);
  showAccessories();
  for (let key in options) {
    let buttons = document.getElementsByName(key);
    if (key !== "acc") {
      for (let button of buttons) {
        button.checked = button.value === outfit[key];
      }
    }
    // 불러온 코디의 첫 선택지가 줄 밖에 있으면 가로 위치만 맞춤
    const row = document.getElementById(key + "-options");
    const selected = row.querySelector("input:checked");
    if (selected) {
      const item = selected.parentElement.getBoundingClientRect();
      const area = row.getBoundingClientRect();
      if (item.left < area.left + 4) row.scrollLeft += item.left - area.left - 4;
      if (item.right > area.right - 4) row.scrollLeft += item.right - area.right + 4;
    }
  }
  document.getElementById("skin").value = outfit.skin;
  document.getElementById("topColor").value = outfit.topColor;
  document.getElementById("bottomColor").value = outfit.bottomColor;
  pointCount = 0;
  for (let stroke of outfit.strokes) {
    pointCount += stroke.points.length;
  }
  loadCharacter();
};

// 선택한 항목만 바꾸고 다시 그림
const changeOption = (key, value) => {
  outfit[key] = value;
  drawCharacter();
  saveCurrent();
};

// 체크한 액세서리를 추가하고, 체크를 풀면 목록에서 뺌
const changeAccessory = (button) => {
  const name = button.value;
  if (name === "없음") {
    outfit.acc = [];
  } else if (button.checked) {
    // 같은 위치에 겹치는 안경은 마지막에 고른 것만 씀
    if (name === "안경" || name === "선글라스") {
      outfit.acc = outfit.acc.filter(item => item !== "안경" && item !== "선글라스");
    }
    outfit.acc.push(name);
  } else {
    outfit.acc = outfit.acc.filter(item => item !== name);
  }
  showAccessories();
  drawCharacter();
  saveCurrent();
};

// 쓸 도구를 바꾸고 지금 선택된 버튼만 눌린 상태로 표시함
const selectTool = (name) => {
  tool = name;
  const tools = ["pen", "brush", "eraser"];
  for (let item of tools) {
    document.getElementById(item).setAttribute("aria-pressed", item === name);
  }
};

// 화면 크기가 달라도 같은 위치에 그려지도록 비율로 저장함
const getPoint = (event) => {
  const area = canvas.getBoundingClientRect();
  let x = (event.clientX - area.left) / area.width;
  let y = (event.clientY - area.top) / area.height;
  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));
  return [x, y];
};

// 누르는 순간을 한 획의 시작으로 잡고 펜 색, 굵기, 첫 좌표를 저장함
const startDrawing = (event) => {
  if (event.button !== 0 || drawing) {
    return;
  }
  if (outfit.strokes.length >= 500 || pointCount >= 30000) {
    showMessage("그림이 꽉 찼어요. 그리기 전체 지우기를 눌러주세요.");
    return;
  }
  drawing = true;
  pointerId = event.pointerId;
  canvas.setPointerCapture(pointerId);
  let size = Number(document.getElementById("pen-size").value);
  if (tool === "brush") {
    size *= 2;
  }
  if (tool === "eraser") {
    size = 30;
  }
  outfit.strokes.push({
    tool: tool,
    color: document.getElementById("pen-color").value,
    size: size,
    points: [getPoint(event)]
  });
  pointCount++;
  drawCharacter();
};

// 누른 채 움직이는 동안 마지막 획에 좌표를 하나씩 추가함
const moveDrawing = (event) => {
  if (!drawing || event.pointerId !== pointerId || pointCount >= 30000) {
    return;
  }
  let last = outfit.strokes.length - 1;
  outfit.strokes[last].points.push(getPoint(event));
  pointCount++;
  drawCharacter();
};

// 그리기를 시작한 손가락이나 마우스가 떨어졌을 때 코디를 저장함
const endDrawing = (event) => {
  if (drawing && event.pointerId === pointerId) {
    drawing = false;
    pointerId = null;
    saveCurrent();
  }
};

// 마지막 획을 빼고 그 획에 들어 있던 점 개수도 뺌
const undoDrawing = () => {
  let removed = outfit.strokes.pop();
  if (removed) {
    pointCount -= removed.points.length;
  }
  drawCharacter();
  saveCurrent();
};

// 그림 목록과 점 개수만 비우고 인물과 옷은 유지함
const clearDrawing = () => {
  outfit.strokes = [];
  pointCount = 0;
  drawCharacter();
  saveCurrent();
};

// 현재 인물과 얼굴 사진을 유지한 채 옷과 그림을 초기화함
const resetOutfit = () => {
  if (confirm("의상과 그림을 초기화할까요?")) {
    outfit = newOutfit(outfit.name, outfit.face);
    showOutfit();
    saveCurrent();
    showMessage("기본 코디로 초기화했어요.");
  }
};

// 붙여넣은 JSON을 객체로 바꾸고 유효한 코디일 때 화면에 적용함
const applyCode = () => {
  try {
    let text = document.getElementById("code").value.trim();
    if (text.length > 1500000) {
      showMessage("공유 코드가 너무 길어요.");
      return;
    }
    let data = JSON.parse(text);
    if (!validOutfit(data)) {
      showMessage("코디 정보를 확인해주세요.");
      return;
    }
    if (saveData(CURRENT_KEY, data)) {
      outfit = data;
      showOutfit();
      showMessage("공유받은 코디를 적용했어요.");
    }
  } catch (error) {
    showMessage("공유 코드를 처음부터 끝까지 복사해주세요.");
  }
};

// 결과 화면에서 같은 코디를 불러올 수 있도록 저장 후 이동함
const finishOutfit = () => {
  if (saveCurrent()) {
    location.href = "result.html";
  }
};

// 저장 목록에서 코디 이름을 읽고 각 줄에 불러오기와 삭제 버튼을 붙임
const showSaved = () => {
  const list = document.getElementById("saved-list");
  const saved = readData(SAVED_KEY, []);
  list.innerHTML = "";
  if (saved.length === 0) {
    list.textContent = "저장한 코디가 없어요.";
  }
  for (let i = 0; i < saved.length; i++) {
    const row = document.createElement("li");
    row.innerHTML = `<span></span>
      <button onclick="loadSaved(${i})">불러오기</button>
      <button onclick="deleteSaved(${i})">삭제</button>`;
    row.children[0].textContent = saved[i].title;
    list.appendChild(row);
  }
};

// 현재 코디를 입력한 이름과 묶어서 저장 목록에 추가함
const saveOutfit = () => {
  let title = document.getElementById("outfit-title").value.trim();
  const saved = readData(SAVED_KEY, []);
  if (saved.length >= 10) {
    showMessage("코디는 10개까지 저장할 수 있어요.");
    return;
  }
  if (title === "") {
    title = outfit.name + "의 코디";
  }
  saved.push({title: title, outfit: outfit});
  if (saveData(SAVED_KEY, saved)) {
    showSaved();
    showMessage("코디를 저장했어요.");
  }
};

// 누른 줄의 번호로 코디를 찾아 현재 코디에 적용함
const loadSaved = (index) => {
  const saved = readData(SAVED_KEY, []);
  if (validOutfit(saved[index].outfit) && saveData(CURRENT_KEY, saved[index].outfit)) {
    outfit = saved[index].outfit;
    showOutfit();
    showMessage("저장한 코디를 불러왔어요.");
  }
};

// 누른 줄의 번호에 해당하는 코디 한 개만 목록에서 뺌
const deleteSaved = (index) => {
  const saved = readData(SAVED_KEY, []);
  saved.splice(index, 1);
  if (saveData(SAVED_KEY, saved)) {
    showSaved();
  }
};

// 터치는 브라우저 기본 스크롤을 쓰고 마우스로 끄는 동작만 추가함
for (const row of document.querySelectorAll(".items")) {
  let startX = 0;
  let startScroll = 0;
  let mouseId = null;

  row.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if (row.scrollWidth <= row.clientWidth) return;
    if (event.clientY >= row.getBoundingClientRect().top + row.clientHeight) return;
    startX = event.clientX;
    startScroll = row.scrollLeft;
    mouseId = event.pointerId;
  });

  row.addEventListener("pointermove", (event) => {
    if (event.pointerId !== mouseId) return;
    const distance = event.clientX - startX;

    // 조금만 움직였으면 클릭으로 두고, 드래그가 시작되면 줄이 입력을 받음
    if (!row.hasPointerCapture(mouseId)) {
      if (Math.abs(distance) < 6) return;
      row.setPointerCapture(mouseId);
      row.classList.add("is-dragging");
    }
    row.scrollLeft = startScroll - distance;
  });

  const endDrag = () => {
    mouseId = null;
    row.classList.remove("is-dragging");
  };

  row.addEventListener("pointerup", endDrag);
  row.addEventListener("lostpointercapture", endDrag);
  row.addEventListener("pointercancel", endDrag);
  row.addEventListener("pointerleave", () => {
    if (mouseId !== null && !row.hasPointerCapture(mouseId)) endDrag();
  });
}

showOutfit();
showSaved();
