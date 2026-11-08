// 선택한 캐릭터를 저장하고 꾸미기 화면으로 이동함
const selectPerson = (name) => {
  if (saveData(CURRENT_KEY, newOutfit(name))) {
    location.href = "design.html";
  }
};

renderOutfit(document.getElementById("person-one"), newOutfit("남자 캐릭터"));
renderOutfit(document.getElementById("person-two"), newOutfit("여자 캐릭터"));
