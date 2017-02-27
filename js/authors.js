
var selectedCompany = null;

$(document).ready(function() {
  // var companyRef = db.ref('/company');
  // companyRef.once('value').then(function(data){
  // }

  var ref = db.ref('/user');
  ref.once('value').then(function(data){
    selectedCompany = data.val()["user_"+user.uid].user_company;
  }).then(function(){
    //좌측의 topic 리스트 가져오기
    getListData("user");
  });

});


//리스트 데이터 가져오기
function getListData(target, type){
  var listRef = db.ref('/'+target);
    listRef.on('child_added', function(data){
      if(data.val().user_company == selectedCompany){
        createList(target, data, type);
      }
    });
}

function createList(target, data, type){
  // console.log(target, data.val().user_name, type);
  var li = document.createElement('li');
  li.id = data.key;

    li.innerHTML = "<div class= 'user listItem'>"+data.val().user_name+"</div>";

    if(type == 'update'){
      nameTextChanger(data.key, data.val().user_name);
    }else{
      $("#sidebar_list_area_full").append(li);
    }
    $("#sidebar_list_area_full>li").addClass("list-group-item");
  function nameTextChanger(key, value){
    $("#"+key+">div").text(value);
  }
}

//리스트 데이터를 본문에 입력
function importListData(listKey){
    var ref = db.ref('/user/'+listKey);
    ref.once('value').then(function(data){ // topic = addOptionMenu("company","topic");
    userForm(data.val());
  });
}
function userForm(data){

  $("#targetName").text(data.user_name);

  $("#user-names").val(data.user_name);
  $("#user-email").val(data.user_email);


  var target;
  if(data.user_company_id != null){
    target = data.user_company_id;
  }else{
    target = selectedCompany;
  }

  var ref = db.ref('/company/'+target);
  ref.once('value').then(function(company){
    $("#user-company-name").val(company.val().company_name);
  });

    $("#user-company").val(data.user_company);



  $("#user-limit-topic").val(data.user_limit_topic);
  $(".user_key").attr("id",data.user_id);
  $(':radio[name="user_chk"]').removeAttr("checked");
  if(data.user_permission == 0){
    $("#user-permission-0").attr("checked","checked");
  }else if(data.user_permission == 1){
    $("#user-permission-1").attr("checked","checked");
  }else if(data.user_permission == 2){
    $("#user-permission-2").attr("checked","checked");
  }
}

function uploadUser(key, topic, work){

  var userName = document.getElementById('user-names');
  var userEmail = document.getElementById('user-email');
  var userCompany = document.getElementById('user-company');
  // var userlimitTopic = document.getElementById('user-limit-topic');
  var userPermission = $(':radio[name="user_chk"]:checked').val();

  //작성시 빈칸이 있는지 체크 // 제목, 내용
  if(!topic&&!work){
    if (!userName.value || !userEmail.value ) return null;
  }

  //글의 id 값
  var id;
  if(key != null){
    id = key;
  }else{
    id = "user" + Date.now();
  }

  var tempArray = [];
  if(key != null){
    //유져 정보 업데이트, 이메일, 출판사 권한.
    //기존 존재하던 array를 가져옴
    var ref = db.ref('/user');
    var temp = new Object();
    ref.once('value').then(function(data){
      for( var key in data.val() ) {
        temp = data.val()[key];
        if(temp.user_id == id){
          if(temp.user_limit_topic != null){
            tempArray = temp.user_limit_topic;
          }
          db.ref('user/' + id).set({
            user_id: key,
            user_name: userName.value,
            user_email: userEmail.value,
            user_company: userCompany.value,
            user_permission: userPermission,
            user_limit_topic: tempArray
          });
        }
      }
    }).then(function(){
      getListData("user", "update");
    });
  }else{
    //유져 신규
    db.ref('user/' + id).set({
      user_id: key,
      user_name: userName.value,
      user_email: userEmail.value,
      user_company: userCompany.value,
      user_permission: userPermission
    });
  }
}

$(document).on("click", "#sidebar_list_area_full>li", function(e){
    var target = e.target.parentNode.id;
    $("#contents_area").show();
    importListData(target);
});
$(document).on("click",".user_key", function(e){
  if(e.target.classList.contains('updateUser')){
    uploadUser(e.target.parentNode.id);
  }else if(e.target.classList.contains('deleteUser')){
    deleteDatabaseItem("user", e.target.parentNode.id);
  }
});
