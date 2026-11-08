// 인물과 의상을 그리는 부분 좌표 420, 560 기준
const renderOutfit = (canvas, outfit, photo) => {
  const ctx = canvas.getContext("2d");
  // 사각형 부분 채우기
  const rect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  // 원형 부분 채우기
  const oval = (x, y, rx, ry, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  // 시작 좌표부터 끝 좌표까지 지정한 색과 굵기로 선 그리기
  const line = (x1, y1, x2, y2, color, size) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // 곡선으로 머리와 옷의 윤곽을 그리고 얇은 선으로 디테일을 넣음
  const shape = (outline, color) => {
    ctx.fillStyle = color;
    ctx.fill(new Path2D(outline));
  };
  const hair = "#30252b";
  const isFemale = outfit.name === "여자 캐릭터";
  const bob = outfit.hair === "단발" || (isFemale && outfit.hair === "기본");

  rect(0, 0, 420, 560, "#f5f3e9");
  oval(210, 512, 112, 16, "#e1e7dd");
  if (outfit.hair === "포니테일") {
    shape(
      "M250 91 Q281 73 286 108 Q292 133 277 165 Q270 183 284 200 Q253 196 251 171 Q244 141 260 113 Z",
      hair,
    );
    line(265, 100, 279, 108, "#c38287", 5);
  }
  // 묶은 머리 윗부분을 얼굴보다 먼저 그림
  if (outfit.hair === "번 헤어") {
    oval(213, 52, 24, 21, hair);
    shape("M195 52 Q200 35 221 38 Q205 42 195 52 Z", "#74546385");
    line(200, 65, 224, 65, "#bc7981", 5);
  }
  if (outfit.hair === "장발") {
    shape(
      "M148 106 Q154 58 210 62 Q267 62 274 112 L281 233 Q252 252 222 232 L195 235 Q169 254 139 233 Z",
      hair,
    );
  } else if (bob) {
    shape(
      "M148 111 Q145 62 207 61 Q266 59 272 110 L276 172 Q258 194 232 186 L182 186 Q158 193 143 174 Z",
      hair,
    );
  }

  // 팔과 다리를 먼저 그려 반바지나 반팔 아래로 보이게 함
  line(162, 230, 135, 323, outfit.skin, 24);
  line(258, 230, 285, 323, outfit.skin, 24);
  oval(134, 331, 13, 17, outfit.skin);
  oval(286, 331, 13, 17, outfit.skin);
  line(181, 357, 176, 482, outfit.skin, 27);
  line(239, 357, 244, 482, outfit.skin, 27);

  const hem = outfit.bottom === "반바지" ? 409 : 480;
  const cuff = outfit.bottom === "슬랙스" ? 153 : 157;
  if (outfit.bottom === "플리츠 스커트") {
    shape(
      "M158 317 Q210 326 262 317 L285 402 Q210 424 135 402 Z",
      outfit.bottomColor,
    );
    for (let x = 163; x <= 260; x += 16) {
      line(x, 328, 210 + (x - 210) * 1.32, 403, "#19182d45", 2);
    }
  } else if (outfit.bottom === "와이드 팬츠") {
    // 양쪽 밑단을 넓게 벌려 통이 큰 바지를 그림
    shape(
      "M156 317 Q210 325 264 317 L285 481 Q251 490 216 481 L210 368 L204 481 Q169 490 135 481 Z",
      outfit.bottomColor,
    );
    line(167, 347, 150, 472, "#ffffff55", 2);
    line(253, 347, 270, 472, "#ffffff55", 2);
  } else if (outfit.bottom === "조거팬츠") {
    shape(
      "M156 317 Q210 325 264 317 Q274 371 261 439 L257 474 H230 L210 369 L190 474 H163 L159 439 Q146 371 156 317 Z",
      outfit.bottomColor,
    );
    shape(
      "M163 469 H191 V481 H164 Z M229 469 H257 L256 481 H229 Z",
      outfit.bottomColor,
    );
    line(165, 473, 189, 473, "#22203666", 4);
    line(231, 473, 255, 473, "#22203666", 4);
  } else {
    shape(
      "M156 317 Q210 325 264 317 L269 " +
        hem +
        " Q244 " +
        (hem + 6) +
        " 221 " +
        hem +
        " L210 367 L199 " +
        hem +
        " Q174 " +
        (hem + 6) +
        " " +
        cuff +
        " " +
        hem +
        " Z",
      outfit.bottomColor,
    );
    line(210, 328, 210, 354, "#171b374d", 2);
    if (outfit.bottom === "청바지") {
      shape(
        "M159 329 L184 331 Q179 349 159 350 Z M261 329 L236 331 Q241 349 261 350 Z",
        "#ffffff35",
      );
      line(167, 354, 165, 471, "#ffffff60", 2);
      line(253, 354, 255, 471, "#ffffff60", 2);
    } else if (outfit.bottom === "슬랙스") {
      line(177, 357, 174, 472, "#12172e60", 2);
      line(243, 357, 246, 472, "#12172e60", 2);
    } else if (outfit.bottom === "카고팬츠") {
      shape(
        "M153 363 L187 365 L186 400 L156 397 Z M267 363 L233 365 L234 400 L264 397 Z",
        "#19182d40",
      );
      line(155, 371, 185, 373, "#fff5e466", 3);
      line(235, 373, 265, 371, "#fff5e466", 3);
    } else {
      line(157, 401, 198, 402, "#ffffff66", 3);
      line(222, 402, 263, 401, "#ffffff66", 3);
    }
  }

  // 신발 종류에 따라 발목 높이와 밑창을 다르게 그림
  const shoe = outfit.shoes ?? "운동화";
  if (shoe === "샌들") {
    // 발 모양 위에 끈과 밑창을 따로 그림
    shape(
      "M163 474 H189 L196 496 Q200 505 185 506 H144 Q133 504 139 497 Q146 490 164 484 Z M257 474 H231 L224 496 Q220 505 235 506 H276 Q287 504 281 497 Q274 490 256 484 Z",
      outfit.skin,
    );
    line(143, 504, 193, 504, "#5d4137", 5);
    line(227, 504, 277, 504, "#5d4137", 5);
    line(150, 494, 155, 502, "#96543d", 7);
    line(165, 484, 178, 500, "#96543d", 8);
    line(270, 494, 265, 502, "#96543d", 7);
    line(255, 484, 242, 500, "#96543d", 8);
  } else if (shoe === "메리제인") {
    shape(
      "M164 483 Q177 494 190 481 L199 497 Q203 506 188 507 H145 Q133 506 137 496 Q142 487 156 489 Z M256 483 Q243 494 230 481 L221 497 Q217 506 232 507 H275 Q287 506 283 496 Q278 487 264 489 Z",
      "#59303c",
    );
    line(160, 484, 189, 488, "#59303c", 6);
    line(260, 484, 231, 488, "#59303c", 6);
    oval(162, 484, 3, 3, "#e4b65c");
    oval(258, 484, 3, 3, "#e4b65c");
    line(142, 504, 194, 504, "#281c27", 4);
    line(226, 504, 278, 504, "#281c27", 4);
  } else {
    const shoeColor = shoe === "로퍼" ? "#633c33" : "#292739";
    if (shoe === "부츠" || shoe === "하이탑") {
      const ankle = shoe === "부츠" ? 446 : 464;
      shape(
        "M160 " +
          ankle +
          " H194 V493 H156 Z M226 " +
          ankle +
          " H260 L264 493 H226 Z",
        shoeColor,
      );
      line(162, ankle + 4, 191, ankle + 4, "#ffffff45", 2);
      line(229, ankle + 4, 258, ankle + 4, "#ffffff45", 2);
    }
    shape(
      "M163 477 Q177 481 191 476 L200 496 Q201 506 188 507 L145 507 Q133 505 137 497 Q143 489 163 484 Z",
      shoeColor,
    );
    shape(
      "M257 477 Q243 481 229 476 L220 496 Q219 506 232 507 L275 507 Q287 505 283 497 Q277 489 257 484 Z",
      shoeColor,
    );
    const sole = shoe === "부츠" || shoe === "로퍼" ? "#201c25" : "#f3e8d5";
    line(140, 503, 196, 503, sole, 5);
    line(224, 503, 280, 503, sole, 5);
    if (shoe === "로퍼") {
      line(157, 487, 179, 490, "#d3a376", 4);
      line(241, 490, 263, 487, "#d3a376", 4);
    } else {
      line(161, 489, 175, 491, "#f3e8d5", 2);
      line(167, 485, 181, 487, "#f3e8d5", 2);
      line(259, 489, 245, 491, "#f3e8d5", 2);
      line(253, 485, 239, 487, "#f3e8d5", 2);
    }
  }

  shape("M194 171 L226 171 L227 202 Q210 218 193 202 Z", outfit.skin);
  shape("M194 179 Q210 194 226 179 L225 193 Q211 206 194 192 Z", "#7c37483b");

  const longSleeve = outfit.top !== "티셔츠";
  if (outfit.top === "베스트") {
    // 베스트 아래로 흰 셔츠 소매가 보이게 그림
    shape(
      "M165 204 Q147 206 137 229 L128 256 Q143 268 158 263 L174 232 Z M255 204 Q273 206 283 229 L292 256 Q277 268 262 263 L246 232 Z",
      "#f4e8d9",
    );
  } else if (longSleeve) {
    shape(
      "M165 204 Q142 206 137 232 L119 310 Q134 321 150 315 L176 234 Z M255 204 Q278 206 283 232 L301 310 Q286 321 270 315 L244 234 Z",
      outfit.topColor,
    );
    line(125, 307, 146, 312, "#27213448", 3);
    line(274, 312, 295, 307, "#27213448", 3);
  } else {
    shape(
      "M165 204 Q147 206 137 229 L128 256 Q143 268 158 263 L174 232 Z M255 204 Q273 206 283 229 L292 256 Q277 268 262 263 L246 232 Z",
      outfit.topColor,
    );
    line(133, 251, 152, 258, "#ffffff65", 3);
    line(268, 258, 287, 251, "#ffffff65", 3);
  }
  shape(
    "M158 211 Q176 200 193 197 Q210 212 227 197 Q247 200 262 211 L254 264 L266 321 Q210 336 154 321 L166 264 Z",
    outfit.topColor,
  );
  shape(
    "M165 238 Q171 259 171 274 L164 317 L155 320 L164 266 Z M255 238 Q249 259 249 274 L256 317 L265 320 L256 266 Z",
    "#1a193342",
  );
  line(162, 319, 257, 319, "#201d3438", 2);

  if (outfit.top === "베스트") {
    shape("M180 201 L193 196 L210 205 L227 196 L240 201 L210 246 Z", "#f4e8d9");
    line(182, 204, 210, 245, "#35294055", 3);
    line(238, 204, 210, 245, "#35294055", 3);
    line(162, 315, 258, 315, "#35294055", 5);
  } else if (outfit.top === "롱코트") {
    // 바지 위까지 내려오는 코트 자락과 단추를 그림
    shape(
      "M154 306 Q210 318 266 306 L280 398 Q242 407 215 403 L210 380 L205 403 Q178 407 140 398 Z",
      outfit.topColor,
    );
    shape(
      "M178 204 L194 197 L210 218 L226 197 L242 204 L229 229 L234 235 L210 268 L186 235 L191 229 Z",
      "#35294055",
    );
    line(210, 268, 210, 380, "#35294070", 2);
    line(158, 320, 181, 330, "#f3e8d588", 4);
    line(262, 320, 239, 330, "#f3e8d588", 4);
    for (let y = 276; y <= 351; y += 25) oval(219, y, 3, 3, "#f3e8d5");
  } else if (outfit.top === "후드티") {
    shape(
      "M172 208 Q182 188 194 193 L210 207 L226 193 Q240 188 248 208 L210 233 Z",
      "#23233742",
    );
    line(193, 216, 193, 254, "#eee5d7", 3);
    line(227, 216, 227, 254, "#eee5d7", 3);
    shape("M190 278 L230 278 L242 300 Q210 307 178 300 Z", "#ffffff30");
  } else if (outfit.top === "재킷") {
    shape("M193 197 L210 219 L227 197 L217 321 H203 Z", "#eee5d7");
    shape(
      "M180 202 L198 197 L207 248 L185 228 Z M240 202 L222 197 L213 248 L235 228 Z",
      "#26253955",
    );
    line(166, 284, 190, 284, "#e7e0d8a0", 3);
    line(230, 284, 254, 284, "#e7e0d8a0", 3);
  } else if (outfit.top === "니트") {
    for (let y = 241; y <= 301; y += 14) {
      line(175, y, 245, y, "#ffffff45", 3);
    }
    line(163, 315, 257, 315, "#25243e55", 5);
  } else if (outfit.top === "셔츠") {
    line(210, 219, 210, 322, "#25243e60", 2);
    shape(
      "M191 195 L210 210 L194 232 L180 205 Z M229 195 L210 210 L226 232 L240 205 Z",
      "#ffffff78",
    );
    for (let y = 233; y < 317; y += 19) oval(215, y, 2.5, 2.5, "#fff7e8");
  } else {
    line(196, 207, 210, 214, "#ffffff70", 3);
    line(210, 214, 224, 207, "#ffffff70", 3);
    shape("M226 230 L244 230 L244 247 L235 252 L226 247 Z", "#ffffff32");
  }

  // 귀와 턱선을 둥글게 그려 얼굴 표정을 살림
  oval(154, 127, 8, 13, outfit.skin);
  oval(266, 127, 8, 13, outfit.skin);
  shape(
    "M156 100 Q161 67 210 68 Q259 67 264 100 L262 140 Q257 176 223 189 Q210 194 197 189 Q163 176 158 140 Z",
    outfit.skin,
  );
  if (photo && photo.complete && photo.naturalWidth > 0) {
    // 얼굴 사진의 가로세로 비율을 유지하고 가장자리를 피부색에 섞음
    const faceLayer = document.createElement("canvas");
    faceLayer.width = 112;
    faceLayer.height = 130;
    const faceCtx = faceLayer.getContext("2d");
    const scale = Math.max(112 / photo.naturalWidth, 130 / photo.naturalHeight);
    const width = photo.naturalWidth * scale;
    const height = photo.naturalHeight * scale;
    faceCtx.drawImage(
      photo,
      (112 - width) / 2,
      (130 - height) / 2,
      width,
      height,
    );
    faceCtx.globalCompositeOperation = "destination-in";
    faceCtx.translate(56, 65);
    faceCtx.scale(56, 65);
    const edge = faceCtx.createRadialGradient(0, 0, 0.77, 0, 0, 1);
    edge.addColorStop(0, "#000");
    edge.addColorStop(1, "transparent");
    faceCtx.fillStyle = edge;
    faceCtx.fillRect(-1, -1, 2, 2);
    ctx.drawImage(faceLayer, 154, 61);
  } else {
    line(179, 112, 194, 110, hair, 3);
    line(226, 110, 241, 112, hair, 3);
    oval(190, 127, 5, 7, "#352b35");
    oval(230, 127, 5, 7, "#352b35");
    oval(191, 125, 1.6, 1.6, "#fff8ec");
    oval(231, 125, 1.6, 1.6, "#fff8ec");
    oval(176, 144, 9, 4, "#d778723f");
    oval(244, 144, 9, 4, "#d778723f");
    line(210, 135, 208, 141, "#8b4c4b72", 2);
    ctx.strokeStyle = "#965259";
    ctx.lineWidth = 2.5;
    ctx.stroke(new Path2D("M201 155 Q210 163 219 155"));
  }

  if (bob || outfit.hair === "장발") {
    shape(
      "M154 133 Q144 104 158 82 Q173 60 203 62 Q243 50 264 87 Q276 108 264 137 L255 111 Q231 101 219 78 Q196 109 163 115 Z",
      hair,
    );
    shape("M162 96 Q182 69 213 69 Q196 87 162 96 Z", "#74546385");
  } else if (outfit.hair === "번 헤어") {
    shape(
      "M153 127 Q143 99 157 79 Q176 56 210 60 Q245 56 263 79 Q277 99 267 127 L256 105 Q229 98 218 75 Q196 98 164 106 Z",
      hair,
    );
    shape("M162 88 Q184 65 213 68 Q195 82 162 88 Z", "#74546385");
  } else if (outfit.hair === "투블럭") {
    shape(
      "M152 126 Q145 101 155 83 L170 80 L172 107 L162 128 Z M268 126 Q275 101 265 83 L250 80 L248 107 L258 128 Z",
      "#694d57",
    );
    shape(
      "M152 98 Q144 68 176 61 Q196 45 220 60 Q251 49 265 73 Q277 87 264 101 L246 101 Q234 97 225 83 Q198 102 152 98 Z",
      hair,
    );
    shape("M158 84 Q180 59 216 66 Q192 69 178 83 Z", "#74546385");
  } else if (outfit.hair === "가르마" || outfit.hair === "포니테일") {
    shape(
      "M153 129 Q143 103 155 82 Q176 53 211 64 Q239 54 261 80 Q276 99 266 128 L255 104 Q224 97 211 76 Q194 105 164 109 Z",
      hair,
    );
    line(180, 84, 202, 73, "#735262", 3);
    line(222, 74, 241, 84, "#735262", 3);
  } else if (outfit.hair === "곱슬") {
    for (let x = 158; x <= 262; x += 15) {
      oval(x, 89 + Math.abs(x - 210) / 6, 13, 17, hair);
    }
    oval(208, 77, 41, 17, hair);
  } else {
    shape(
      "M154 128 L151 103 Q145 84 160 76 Q168 57 192 61 Q207 49 226 61 Q250 57 263 77 Q276 91 265 125 L257 107 Q242 107 226 89 Q205 104 167 104 Z",
      hair,
    );
    shape(
      "M158 87 Q171 63 196 69 Q213 59 232 68 Q207 71 193 80 Q175 83 158 87 Z",
      "#74546385",
    );
  }
  const accessories = getAccessories(outfit);
  if (accessories.includes("헤드폰")) {
    ctx.strokeStyle = "#463c52";
    ctx.lineWidth = 7;
    ctx.stroke(new Path2D("M146 121 Q139 56 210 54 Q281 56 274 121"));
    oval(147, 126, 11, 20, "#463c52");
    oval(273, 126, 11, 20, "#463c52");
    oval(144, 126, 6, 14, "#9f7d9a");
    oval(276, 126, 6, 14, "#9f7d9a");
  }
  if (accessories.includes("손목시계")) {
    line(124, 324, 144, 329, "#593f49", 7);
    oval(135, 326, 7, 7, "#c99455");
    oval(135, 326, 5, 5, "#fff0d2");
    line(135, 326, 135, 323, "#593f49", 1.5);
    line(135, 326, 138, 327, "#593f49", 1.5);
  }
  if (accessories.includes("선글라스")) {
    shape(
      "M168 115 H206 L202 134 Q185 146 173 133 Z M214 115 H252 L247 133 Q235 146 218 134 Z",
      "#242537",
    );
    line(205, 120, 215, 120, "#242537", 4);
    line(177, 121, 193, 121, "#888caf", 2);
    line(223, 121, 239, 121, "#888caf", 2);
  }
  if (accessories.includes("귀걸이")) {
    oval(153, 142, 5, 8, "#bd8741");
    oval(267, 142, 5, 8, "#bd8741");
    oval(153, 142, 2, 4, "#fff0c6");
    oval(267, 142, 2, 4, "#fff0c6");
  }
  if (accessories.includes("크로스백")) {
    line(175, 207, 248, 310, "#44343b", 8);
    shape("M225 287 Q247 282 272 287 L278 318 Q252 329 225 320 Z", "#594353");
    line(231, 297, 266, 295, "#e1b783", 2);
    oval(251, 300, 3, 4, "#e1b783");
  }
  if (accessories.includes("안경")) {
    ctx.strokeStyle = "#303630";
    ctx.lineWidth = 4;
    ctx.strokeRect(173, 114, 30, 25);
    ctx.strokeRect(217, 114, 30, 25);
    line(203, 123, 217, 123, "#303630", 3);
  }
  if (accessories.includes("모자")) {
    rect(157, 62, 106, 33, outfit.topColor);
    line(149, 96, 277, 96, outfit.topColor, 12);
  }
  if (accessories.includes("목걸이")) {
    line(187, 206, 210, 245, "#dbb765", 4);
    line(210, 245, 233, 206, "#dbb765", 4);
    oval(210, 247, 6, 8, "#dbb765");
  }

  // 낙서를 따로 그려서 지우개가 인물까지 지우지 않게 함
  const drawing = document.createElement("canvas");
  drawing.width = 420;
  drawing.height = 560;
  const pen = drawing.getContext("2d");
  for (let stroke of outfit.strokes) {
    pen.globalCompositeOperation = "source-over";
    if (stroke.tool === "eraser") {
      pen.globalCompositeOperation = "destination-out";
    }
    pen.strokeStyle = stroke.color;
    pen.lineWidth = stroke.size;
    pen.lineCap = "round";
    pen.lineJoin = "round";
    pen.beginPath();
    pen.moveTo(stroke.points[0][0] * 420, stroke.points[0][1] * 560);
    for (let point of stroke.points) {
      pen.lineTo(point[0] * 420, point[1] * 560);
    }
    if (stroke.points.length === 1) {
      pen.lineTo(
        stroke.points[0][0] * 420 + 0.1,
        stroke.points[0][1] * 560 + 0.1,
      );
    }
    pen.stroke();
  }
  ctx.drawImage(drawing, 0, 0);
};
