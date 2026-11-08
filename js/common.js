// 브라우저에 저장할 때 현재 코디, 저장 목록, 점수를 서로 다른 이름으로 구분함
const CURRENT_KEY = "mirim-current-v1";
const SAVED_KEY = "mirim-saved-v1";
const RANK_KEY = "mirim-rank-v1";

const options = {
  hair: ["기본", "단발", "장발", "곱슬", "포니테일", "가르마", "번 헤어", "투블럭"],
  acc: ["없음", "안경", "모자", "목걸이", "선글라스", "귀걸이", "크로스백", "헤드폰", "손목시계"],
  top: ["티셔츠", "후드티", "셔츠", "재킷", "니트", "베스트", "롱코트"],
  bottom: ["청바지", "슬랙스", "반바지", "카고팬츠", "플리츠 스커트", "와이드 팬츠", "조거팬츠"],
  shoes: ["운동화", "하이탑", "로퍼", "부츠", "샌들", "메리제인"]
};

// 인물 이름과 사진을 받아 기본 옷과 빈 그림 목록을 넣어 줌
const newOutfit = (name = "남자 캐릭터", face = "") => {
  return {
    name: name,
    face: face,
    hair: "기본",
    acc: [],
    top: "티셔츠",
    bottom: "청바지",
    shoes: "운동화",
    skin: "#f3d2b4",
    topColor: "#5f806c",
    bottomColor: "#435d83",
    strokes: []
  };
};

// 객체를 문자열로 바꿔 브라우저에 저장함
const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    alert("저장 공간이 부족하거나 저장이 차단되어 있음");
    return false;
  }
};

// 저장된 문자열을 JSON으로 읽고 없거나 잘못됐으면 기본값을 돌려줌
const readData = (key, defaultValue) => {
  try {
    let text = localStorage.getItem(key);
    if (text === null) {
      return defaultValue;
    }
    let data = JSON.parse(text);
    if (Array.isArray(defaultValue) && !Array.isArray(data)) {
      return defaultValue;
    }
    return data;
  } catch (error) {
    return defaultValue;
  }
};

const showMessage = (text) => {
  document.getElementById("message").textContent = text;
};

// # 뒤에 0~9 또는 a~f가 6개 있는지 검사함
const isColor = (color) => {
  if (typeof color !== "string" || color.length !== 7 || color[0] !== "#") {
    return false;
  }
  for (let i = 1; i < color.length; i++) {
    if (!"0123456789abcdef".includes(color[i].toLowerCase())) {
      return false;
    }
  }
  return true;
};

// 예전 코디는 액세서리 하나를 문자열로 저장해서 목록으로 바꿔 읽음
const getAccessories = (outfit) => {
  if (Array.isArray(outfit.acc)) return outfit.acc;
  return outfit.acc === "없음" ? [] : [outfit.acc];
};

// 공유 코드나 저장 데이터에 필요한 값이 있는지 확인함
const validOutfit = (data) => {
  if (!data || typeof data.name !== "string" || data.name.trim() === "" || data.name.length > 20) {
    return false;
  }
  if (Array.isArray(data.acc)) {
    if (data.acc.length >= options.acc.length) 
      return false;
    if (data.acc.some(item => item === "없음" || !options.acc.includes(item))) 
      return false;
    if (new Set(data.acc).size !== data.acc.length) 
      return false;
    if (data.acc.includes("안경") && data.acc.includes("선글라스")) 
      return false;
  } else if (!options.acc.includes(data.acc)) {
    return false;
  }
  for (let key in options) {
    if (key === "acc") continue;
    // 신발 항목이 생기기 전에 저장한 코디는 운동화로 표시함
    if (key === "shoes" && data.shoes === undefined) continue;
    if (!options[key].includes(data[key])) {
      return false;
    }
  }
  if (!isColor(data.skin) || !isColor(data.topColor) || !isColor(data.bottomColor)) {
    return false;
  }
  if (typeof data.face !== "string" || data.face.length > 180000) {
    return false;
  }
  if (data.face !== "" && !data.face.startsWith("data:image/jpeg;base64,")) {
    return false;
  }
  if (!Array.isArray(data.strokes) || data.strokes.length > 500) {
    return false;
  }
  let pointCount = 0;
  for (let stroke of data.strokes) {
    if (!stroke || !["pen", "brush", "eraser"].includes(stroke.tool) || !isColor(stroke.color)) {
      return false;
    }
    if (!Number.isFinite(stroke.size) || stroke.size < 1 || stroke.size > 30 || !Array.isArray(stroke.points) || stroke.points.length === 0) {
      return false;
    }
    pointCount += stroke.points.length;
    for (let point of stroke.points) {
      if (!Array.isArray(point) || point.length !== 2) {
        return false;
      }
      if (!Number.isFinite(point[0]) || !Number.isFinite(point[1]) || point[0] < 0 || point[0] > 1 || point[1] < 0 || point[1] > 1) {
        return false;
      }
    }
  }
  return pointCount <= 30000;
};

// 저장된 코디가 정상일 때만 불러오고 아니면 기본 코디로 시작함
const getOutfit = () => {
  let data = readData(CURRENT_KEY, null);
  if (validOutfit(data)) {
    return data;
  }
  return newOutfit();
};
