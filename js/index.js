
window.firebaseAuth = new firebaseAuth();

var db = firebase.database();
getDatabase("company","company");

var prevPage = document.referrer.split('/').pop();

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("로그인 상태 ", user.email);
    console.log(location.href);

    var ref = db.ref('/user/'+"user_"+user.uid);
    ref.once('value').then(function(data){
      //이전 접속 시도한 페이지도 이동. 없으면 main 으로 이동
      // 일반 사용자나 시스템메니저는 메인만 이동 가능
      if(data.val().user_permission != 1){
        location.href = '/main.html';
      }else if(prevPage){
        location.href = prevPage;
      }else{
        location.href = '/main.html';
      }
    });

  } else {
    console.log("로그인 안됨");
  }
});

$(document).on("click",".signSize", function(e){
  if(e.target.id == "changeSignIn" || e.target.id == "changeSignUp"){
    $("#msg01").html("");
    $("#msg02").html("");
    $("#signIn_form").toggle();
    $("#signUp_form").toggle();
  }
});

$(document).on("click", "#loginBtn", function(e){
  signIn();
});
$(document).on("keypress", "#login_id, #login_pw", function(e){
  if(e.keyCode == 13){
    signIn();
  }
});
$(document).on("click", "#signUpBtn", function(e){
  signIn();
});
$(document).on("keypress", "#signUp_id, #signUp_pw, #signUp_rpw, #signUp_name", function(e){
  if(e.keyCode == 13){
    signUp();
  }
});

function getDatabase(target, type , number){
  var ref = db.ref('/'+target);
  var temp = new Object();

  $("#user_company").empty();

  ref.once('value').then(function(data){
    for( var key in data.val() ) {
      temp = data.val()[key];
      if(type == "company"){
        $("#user_company").append('<option value='+temp.company_id+'>'+temp.company_name+'</option>');
      }
    }
  });
}
