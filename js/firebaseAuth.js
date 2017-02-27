
var userName;
//접속중인 유저 정보
var userInfo;
// 신규 가입시 입력받은 유저 정보;
var newUserInfo;

var thisUserName;
var thisUserInfo;


function firebaseAuth(){

  // setTimeout(function(){ $("#loadingData").remove();}, 1500);

  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');


  this.topMenu = document.getElementById('topMenu');
  this.sidebar = document.getElementById('sidebar');
  this.mainContents = document.getElementById('mainContents');
  this.calendar = document.getElementById('calendar');

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));
  this.initFirebase();
}

firebaseAuth.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};
firebaseAuth.prototype.onAuthStateChanged = function(user) {

  //로그인 상태 여부
  if (user) {
    // console.log("로그인 상태");

    // $("#formWrap").attr('hidden', true);
    userInfo = {name:user.displayName, email:user.email};
    var userId = "user_"+user.uid;
    $("#user-id").val(userId);

    //신규 가입일 경우 데이터 추가
    var temp = ["tempData"];
    if(newUserInfo){
      console.log("회원 가입 데이터 업로드");
      //db에 추가
      db.ref('user/' + userId).set({
        user_id : userId,
        user_name : newUserInfo.name,
        user_email : newUserInfo.email,
        user_company : newUserInfo.company,
        user_permission : 0,
        user_limit_topic : temp
      });
      //firebase user 정보 업데이트.
      user.updateProfile({
        displayName: newUserInfo.name,
        email : user.email
      }).then(function() {
        console.log("신규 유져 정보 등록 성공");
        userInfo = {name:newUserInfo.name, email:newUserInfo.email};
        firebaseAuth.userName.textContent = user.displayName;
      }, function(error) {
        console.log("신규 유져 정보 등록 실패");
      });
    }


    userName = user.displayName;
    this.userName.textContent = userName;
    var userRef = db.ref('/user');
    var userPermission;
    userRef.once('value').then(function(data){
      for( var key in data.val() ) {
        if(data.val()[key].user_id == userId){
          thisUserName = data.val()[key].user_name;
          thisUserInfo = data.val()[key];
          userPermission = data.val()[key].user_permission;

        }
      }
    }).then(function(){
      if(userPermission == 0){
        console.log("일반 사용자 : " +thisUserName);
        $("#user_name").text(thisUserName +"(작 가)"); //data.val()[key].user_name
        $("#user_permission").val("0");
        $(".control-company").hide();
        $(".control-user").hide();
        $(".manage").hide();
        $(".topic").hide();
        $(".system").hide();
        $("#openTopicManager").hide();

      }else if(userPermission == 1){
        console.log("매니져 : " +thisUserName);
        $("#user_name").text(thisUserName +"(검수자)");
        $("#user_permission").val("1");
        $(".control-company").hide();
        $(".system").show();

        $("#openTopicManager").show();
      }else if(userPermission == 2){
        console.log("시스템 매니져 : " +thisUserName);
        $("#user_name").text(thisUserName +"(시스템 관리자)");
        $("#user_permission").val("2");
        $(".create").hide();
        $(".control-user").hide();
        $(".manage").hide();
        $(".topic").hide();
        $(".system").hide();
        $(".sidebarDiv01").hide();
        $(".sidebarDiv02").hide();
        $("#contentWrap").hide();
        $("#openTopicManager").hide();
        $("thead td>div").hide();
        $("#topic-state").hide();
        $("#topic-entry").hide();
      }
      $("#loadingData").remove();
    });

    // this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';

  } else {
    console.log("로그아웃 상태");
  }
};

firebaseAuth.prototype.signIn = function() {
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider).then(function(result){


    // console.log(navigator.userAgent); //디바이스 정보
    // console.log(location.href); // 현재 페이지 주소
    // console.log(document.referrer); // 이전페이지 주소

    console.log(result);
  });
};

firebaseAuth.prototype.signOut = function() {
  this.auth.signOut();
  location.href = '/index.html';
};
