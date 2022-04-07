![readme](https://imagedelivery.net/v7-TZByhOiJbNM9RaUdzSA/ff671ecb-6cbe-443b-9f63-f589ae677000/public)
<br>

⌨️ Tying (타잉)
=============
## 🙌 Introduce Tying
>“영어타자, 빠르지 않아도 괜찮아.”
<br>타잉은 컴퓨터 기반 영어 시험 준비를 위한 영타 연습 서비스입니다.

[![바로가기](https://imagedelivery.net/v7-TZByhOiJbNM9RaUdzSA/8d36b691-b8d4-48a2-b021-54b481b3ab00/public)](https://ty-ing.com/)


* * *

## 📣 Project
### 📆 Project Timeline
- 총 기간: 2022/02/25 ~ 2022/04/08
- 배포: 2022/03/29

### 👨‍💻👩‍💻 BE Team
|                                                         [용주성🔰](https://github.com/Tacocat3)                                            |                                                         [이노규](https://github.com/nklee6300)                                                          |                                                      [김민정](https://github.com/minkimhere)                                                       |                                                                                                            
| :----------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: |
| <img src="https://user-images.githubusercontent.com/97423609/161721943-26ea30bc-5b92-413d-8554-5afebe68983a.png" alt="프로필 이미지" width="200px"/> |  <img src="https://user-images.githubusercontent.com/97423609/161720786-2b1c844a-35e8-445c-bc8e-b0f4406eaf82.png" alt="프로필 이미지" width="200px"/> | <img src="https://user-images.githubusercontent.com/97423609/161721877-c186735f-ae53-4f73-a0b4-b2627c4f6643.jpg" alt="프로필 이미지" width="200px" /> |
|                                                                      `Back-End`                                               |                                                                      `Back-End`                                                                       |                                                                      `Back-End`                                                                          |
#### 용주성

`스크립트 관련 기능` `CI/CD 세팅(w/ jenkins)` `서버 부하 테스트`

#### 이노규

`로그인` `회원가입` `마이페이지`

#### 김민정

`오픈사전 단어장` `나만의 단어장` `서버 환경 구축` `서버 부하 테스트` 

* * *

## 🛠 Tech Stack & Platform
### **Tech**
<p>
<img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white">
<img alt="Express.js" src ="https://img.shields.io/badge/express-000000.svg?&style=for-the-badge&logo=express&logoColor=white"/>
<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
<img src="https://img.shields.io/badge/passport-33D875?style=for-the-badge&logo=passport&logoColor=white">
<img src="https://img.shields.io/badge/mongoDB-47A248?style=for-the-badge&logo=MongoDB&logoColor=white">
<img alt="mongoose" src ="https://img.shields.io/badge/mongoose-47A248.svg?&style=for-the-badge&logo=mongoose&logoColor=white"/>
</br>
<img src="https://img.shields.io/badge/route53-F7A81B?style=for-the-badge&logo=route53&logoColor=white">
<img src="https://img.shields.io/badge/Load Balancer-FF9E0F?style=for-the-badge&logo=Load Balancer&logoColor=white">
<img src="https://img.shields.io/badge/AWS Ec2-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white"> 
<img src="https://img.shields.io/badge/AWS CloudWatch-EC3750?style=for-the-badge&logo=amazonaws&logoColor=white"> 
<img src="https://img.shields.io/badge/jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white"> 
<img src="https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=PM2&logoColor=white">
<br>
</p>

### **Tools**
<p>
<img src="https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=Visual Studio Code&logoColor=white"/>
<img src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=Slack&logoColor=white"/>
<img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white"/>
<img src="https://img.shields.io/badge/Github-181717?style=for-the-badge&logo=github&logoColor=white">
<br>
</p>



* * *

## 📚 Library
|Name|Appliance|Version|
|:---:|:---:|:---:|
|bcrypt|암호화 해시 라이브러리|5.0.1|
|cors|cors 미들웨어|2.8.5|
|dotenv|환경변수 설정|16.0.0|
|ejs|자바스크립트 템플릿|3.1.6|
|express|node.js 프레임워크|4.17.3|
|fs|파일시스템 모듈|0.0.1-security|
|helmet|HTTP header 보안|5.0.2|
|hpp|HTTP parameter 보호|0.2.3|
|joi|validator|17.6.0|
|jsonwebtoken|jsonwebtoken 패키지|8.5.1|
|mongoose|MongoDB ODM|6.2.4|
|mongoose-sequence|autoincrement 플러그인|5.3.1|
|passport|node.js authentication|0.5.2|
|passport-kakao|카카오 로그인 모듈|1.0.1|
|artillery|퍼포먼스 테스팅 툴|2.0.0-14|
|nodemon|자동 재시작 툴|2.0.15|

* * *

## 🔥 Trouble Shooting
<details>
<summary><strong>부하테스트 및 성능개선</strong></summary>
  <br/>
  <ul>
<li><strong>도입이유</strong>
<p>- 안정적인 서버를 위해 부하테스트 및 성능개선 시도
  <br/>
<li><strong>문제상황1</strong>
<p>- 일정 이상의 요청이 동시에 서버로 오면 서버가 버티지 못하고 정상적으로 명령을 수행하지 못함
<p>- 총 900회의 요청 중 302회만 성공
<p>- http.response_time이 지연되는 경우 응답까지 약 9초의 시간 발생
<li><strong>해결방안</strong>
<p>- 서버 성능 개선을 위해 한 단계 높은 사양의 인스턴스를 사용하여 테스트 시도
<li><strong>의견결정</strong>
<p>- 기존 사용하던 micro 등급의 윗 단계인 small 등급의 인스턴스들 중에서 t3a 인스턴스가 동급의 타 인스턴스 대비 비용 및 cpu사양에서 우위를 점하고 있어 t3a를 사용하여 테스트
  <br/>
<li><strong>문제상황2</strong>
<p>- t3a 인스턴스 변경 이후 서버 connection 문제 발생
<li><strong>해결방안</strong>
<p>- 연결, 방화벽 문제의 원인이 무엇인지 탐색
<p>- port forwarding 관련해서 기존 iptables 설정이 t2인스턴스에서는 가능했으나, t3a에 네트워크 설정에 문제를 일으키는 것으로 확인
<li><strong>의견결정</strong>
<p>- iptables eth설정을 전체 허용으로 변경하여 서버 연결 성공
  <br/>
<li><strong>결과1</strong>
<p>- Artillery 테스트 재진행 결과, 기존에는 ‘900명 중 302명이 성공, 총 80초’가 걸렸다면, 개선 이후 ‘900명 중 900명이 성공, 총 70초’로 개선
<p>- http:response_time의 경우 기존 대비 응답 지연시간 60% 감소
  <br/>
<li><strong>결과2</strong>
<p>- 기존 CPU core 1개 -> 2개로 core수 증가하여 CPU core를 활용할 수 있게 됨  
<p>- PM2 Cluster mode를 도입하여 서버 성능 개선 및 무중단 서비스를 지속 중
  </ul>
</details>

  
  
<details>
<summary><strong>욕설 필터링 간소화</strong></summary>
  <br/>
  <ul>
<li><strong>도입이유</strong>
<p>- 새로운 욕설이 추가될 시 욕설 관리에 대한 문제
<li><strong>문제상황</strong>
<p>- DB에 욕설 collection을 생성하여 만들게 된다면 욕설 추가시마다 collection 자체에 욕설을 추가해야는 번거로움 발생
<li><strong>해결방안</strong>
<p>- fs(file system package)를 사용하여 욕설 파일을 불러오고 불러온 파일로 욕설 필터링 시도
<li><strong>의견결정 및 결과</strong>
<p>- 욕설이 추가될 경우 해당 파일만 간단히 변경하여 욕설 추가 가능하게 함
<p>- DB에 대한 전문지식이 없는 운영인력도 쉽게 욕설 관련 내용을 파악하고 내용을 변경할 수 있게 됨
  </ul>
</details>

<details>
<summary><strong>검색 시 내가 저장한 스크립트 여부 확인</strong></summary>
  <br/>
  <ul>
<li><strong>도입이유</strong>
<p>-  검색 시 유저가 저장한 스크립트인지(북마크) 프론트에 전달하기 위해서
<li><strong>문제상황</strong>
<p>-  검색 결과를 전달할 때 유저가 저장한 스크립트인지 분간이 되지 않음
<li><strong>해결방안</strong>
<p>-  MongoDB의 lookup을 활용
<li><strong>의견결졍 및 결과</strong>
<p>- 유저가 저장한 스크립트에 대한 데이터가 저장되는 테이블인 Myscript에서 userId가 일치하는 데이터에 addFields로 “exist”: “true” 값을 담아 전달함으로써 해결
  </ul>
</details>

* * *

