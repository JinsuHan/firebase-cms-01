
function signUp() {
  newUserInfo = "";
  var id = $("#signUp_id").val();
  var pw = $("#signUp_pw").val();
  var cf = $("#signUp_rpw").val();
  var un = $("#signUp_name").val();
  var uc =$("#user_company").val();

  if(id == null || id == "") {
    $("#msg01").html("아이디를 입력하세요 (email)");
    return;
  }
  if(id.indexOf("@") == -1 || id.indexOf(".") == -1){
    $("#msg01").html("이메일 주소 형태로 입력하세요");
    return;
  }
  if(pw == null || pw == "") {
    $("#msg01").html("비밀번호를 입력하세요");
    return;
  }
  if(pw.length < 6) {
    $("#msg01").html("비밀번호는 6자 이상 입력하세요");
    return;
  }
  if(pw != cf) {
    $("#msg01").html("입력한 비밀번호가 일치하지 않습니다.");
    return;
  }
  if(un == null || un == "") {
    $("#msg01").html("이름을 입력하세요");
    return;
  }
  if(!uc) return;

  firebase.auth().createUserWithEmailAndPassword(id, pw)
  .then(function() {
    newUserInfo = {"name":un, "email": id, "pwd": pw, "company":uc};
    $("#msg01").html("회원 가입 완료");
    // 페이지 이동
  })
  .catch(function(e) {
    $("#msg01").html("회원 가입 실패");
    console.log(e.message);
    return;
  });
}

function signIn() {
    var id = $("#login_id").val();
    var pw = $("#login_pw").val();



    if(id == null || id == "") {
      $("#msg02").html("아이디를 입력하세요 (email)");
      return;
    }
    if(id.indexOf("@") == -1 || id.indexOf(".") == -1){
      $("#msg02").html("이메일 주소 형태로 입력하세요");
      return;
    }
    if(pw == null || pw == "") {
      $("#msg02").html("비밀번호를 입력하세요");
      return;
    }

    var result = "";
    firebase.auth().signInWithEmailAndPassword(id, pw)
            .then(function() {
              // var prevPage = document.referrer.split('/').pop();
              // 페이지 이동
              $("#msg02").html("로그인 완료");
            })
            .catch(function(e) {

              if(e.code.split("/")[1] == "user-not-found" || e.code.split("/")[1] == "invalid-email"){
                result = "없거나 잘못된 아이디";
              }else if(e.code.split("/")[1] == "wrong-password"){
                result = "잘못된 비밀번호"
              }
              $("#msg02").html("로그인 실패 - " + result);
              console.log(e.message);
                return;
            });
}
