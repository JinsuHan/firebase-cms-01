# Firebase Cms 01

##CMS firebase 적용 방법


##적용 순서

###1) 구글 firebase 프로젝트 생성
>https://firebase.google.com/
>프로젝트명은 4자 이상 중복 불가

###2) 기본
>이메일/비밀번호, google 가입 가능 설정
>데이터 베이스 읽기 쓰기 권한을 수정 한다.
>{  "rules": { ".read": true, ".write": true }}

###3) hosting 
firebase console 도구 설치
	$ npm install -g firebase-tools
터미널 에서 firebase login 으로 로그인
firebase init 로 기본 설정 (프로젝트 폴더, db, hosting 사용 여부)
추가 서버 없이 파일을 실행하여도 테스트가 가능
터미널에서 firebase serve 로 로컬서버 사용 가능, 경로는 init 명령에서 선택한 폴더

###4) firebase 적용
프로젝트 페이지 > overview > 웹 앱에 firebase 추가하기 > 스니펫 획득
    <script>
      var config = {
        apiKey: "your key",
        authDomain: "your-domain.firebaseapp.com",
        databaseURL: "https://your-domain.firebaseio.com",
        storageBucket: "your-domain.appspot.com",
        messagingSenderId: "0000000"
      };
    </script>
	형태이며 js/init.js 에 삽입

###5) 배포
firebase use --add 로 프로젝트 추가(원하는 이름을 입력하여 저장 가능)
firebase use *name* 으로 프로젝트 선택이 가능
firebase init 에서 설정한 경로에 파일을 넣고 firebase deploy 명령을 사용







###6) 시작하기
시스템관리자 계정 - 권한 (2)
    	 cms 를 업로드 한 후 처음 접속하면 systemmanager 계정을 
   	  자동으로 생성한다 id : system@manager.com / pw : 123456 을 
  	   기본으로 생성하며 생성 전 firebaseAuth.js 파일에서 수정이 가능하다.
   	  systemmanager는 출판사 추가/삭제의 권한만 가진다.

사용자 계정 - 시스템관리자 계정에서 회사를 추가한 후 그 회사를 선택하여
  	   가입 하는 경우 권한(0)의 사용자 계정이 되며, 관리자 계정에서 정해주는 주제
    	 만 사용할 수 있으며 글을 수정, 삭제, 채팅 을 할 수 있다.

관리자 계정 - 권한 변경등의 기능을 사용하기 위해 필요한 관리자 계정으로
    	 권한(1)을 가진다.
    	 자동으로 생성되지 않으므로 현재 사용자 계정으로 가입한 뒤 
   	  db 상에서 수동으로 권한을 부여해 줘야 한다.

그외
    	 id,pw,uid 는 firebase의 auth 기능을 사용하며
   	  id는 e메일 형식을 맞춰야 하며, pw는 6자 이상만 가능하다.
   	  비밀번호 변경등의 기능은 firebase의 비밀 번호 변경 기능을 이용해 제작해야 한다.
    	 그외 정보들은 database 에 uid 를 기준으로 저장된다.

###7) 파일 업로드
firebase 의 db 상에는 파일의 이름만 올라가고 파일 자체는 awsS3 에 올라간다.
js/init.js 파일에 입력한다.
AWS.config.update() > accessKeyId, secretAccessKey 
   	new AWS.S3() > bucket 이름,  region 을 설정해 줘야 한다.
