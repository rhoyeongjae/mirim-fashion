# 미림패션쇼

미림패션쇼 프로젝트의 백엔드 및 데이터베이스 아키텍처입니다.

---

## Tech Stack & Environment
* **Language & Runtime:** JavaScript (Node.js)
* **Database:** MySQL
  
---

## Key Features (백엔드 주요 기능)


### 1. Database & Schema Design
* 의상 정보, 유저 랭킹, 그리고 코디 데이터 저장을 위한 효율적인 **MySQL 데이터베이스 구조 설계 및 연동**

### 2. Character Data Management
* 배열 및 객체 형태로 정의된 인물 데이터를 서버를 통해 안전하게 로드하고 처리하는 로직 구현

### 3. AI Evaluation API Integration
* 사용자가 꾸민 패션 데이터를 외부 AI 서버로 전송
* 반환된 점수와 피드백 데이터를 가공하여 클라이언트로 응답

### 4. Ranking System
* 데이터베이스와 연동하여 AI 평가 최고 득점자 **상위 5인의 랭킹 데이터**를 조회 및 가공하여 전달


## Key Features (프론트앤드 주요 기능)
