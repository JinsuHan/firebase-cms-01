
var db = firebase.database();
var user = null;

firebase.auth().onAuthStateChanged(function(currentIUser) {
  if (currentIUser) {
    user = currentIUser;
    console.log("로그인 상태 ", user.email);

    var ref = db.ref('/user/user_'+user.uid);
    ref.once('value').then(function(data){
      $("#user_name").text(data.val().user_name +"(검수자)");
      if(data.val().user_permission != 1){
        console.log("권한 없음");
        location.href = '/index.html';
      }
    });
  } else {
    console.log("로그인 안됨");
    location.href = '/index.html';
  }
});

//books, topics, authors 페이지에서 main 페이지로 이동
$(document).on("click",".returnMain", function(){
  location.href = '/main.html';
});

// 로그 아웃
  $(document).on("click","#sign-out",function(){
    firebase.auth().signOut();
  });


//데이터베이스 삭제
function deleteDatabaseItem(target, key){
  console.log(target +" - "+ key +" - "+ "삭제 됨");
  //aws s3에 업로드되어 있는 파일 삭제
  if($('#imgUrl_main').val()){
    awsS3FileDelete($('#imgUrl_main').val());
  }
  // db에서 해당 내용 삭제 //
  db.ref(target+'/' + key).remove();
  $("#"+key).remove();
}
