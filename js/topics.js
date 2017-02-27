
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
    getListData("topic");
  });

});



function getListData(target){
  var listRef = db.ref('/'+target);
    $("#sidebar_list_area").empty();
    listRef.on('child_added', function(data){
      if(data.val().topic_company_id == selectedCompany)
        createList(target, data);
    });
}

function createList(target, data, type){
  // console.log(target, data.val().user_name, type);
  var li = document.createElement('li');
  li.id = data.key;
  if(target == "topic"){
    li.innerHTML = "<div class= 'topic listItem'>"+data.val().topic_name+"</div>";
  }

  if(target == "topic"){
    if(type == 'update'){
      if(target == "topic")nameTextChanger(data.key,data.val().topic_name);
    }else{
      if(type == "books"){
        $("#mng_list_area").append(li);
      }else{
        $("#sidebar_list_area").append(li);
      }
    }
    $("#sidebar_list_area>li").addClass("list-group-item");
    $("#mng_list_area>li").addClass("list-group-item");
  }
  function nameTextChanger(key, value){
    $("#"+key+">div").text(value);
  }
}

//리스트 데이터를 본문에 입력
function importListData(target, listKey){
    var ref = db.ref('/'+target+'/'+listKey);
    var temp = new Object();
    ref.once('value').then(function(data){ // topic = addOptionMenu("company","topic");
      topicForm(data.val(), "list");
    });
}

function topicForm(data, type){
  var name;
      if(!data.topic_name){
        name = "신규 도서";
      }else{
        name = data.topic_name;
      }

    $("#targetName").text(name);

    var target;
    if(data.topic_company_id != null){
      target = data.topic_company_id;
    }else{
      target = selectedCompany;
    }

    var ref = db.ref('/company/'+target);
    ref.once('value').then(function(company){
      $("#topic-company-name").val(company.val().company_name);
    });


  $("#topic-company").val(target);
  $("#topic-name").val(data.topic_name);
  $(".topic_key").attr("id",data.topic_id);

  $(':radio[name="topic_chk"]').removeAttr("checked");

// 권한
  if(data.topic_state == 0){
    $("#topic-state-0").attr("checked","checked");
  }else if(data.topic_state == 1){
    $("#topic-state-1").attr("checked","checked");
  }else if(data.topic_state == 2){
    $("#topic-state-2").attr("checked","checked");
  }else if(data.topic_state == 3){
    $("#topic-state-3").attr("checked","checked");
  }else if(data.topic_state  == 4){
    $("#topic-state-4").attr("checked","checked");
  }else if(data.topic_state == 5){
    $("#topic-state-5").attr("checked","checked");
  }else{
    $("#topic-state-0").attr("checked","checked");
  }

  if(type == "new"){
    $(".addTopic").show();
    $(".updateTopic").hide();
    $(".deleteTopic").hide();
  }else if(type == "list"){
    $(".addTopic").hide();
    $(".updateTopic").show();
    $(".deleteTopic").show();
  }
}


function uploadTopic(key){
    var topicName = document.getElementById('topic-name');
    var topicCompanyId = document.getElementById('topic-company');
    var topicState = $(':radio[name="topic_chk"]:checked').val();


    //작성시 빈칸이 있는지 체크 // 제목, 내용
    if (!topicName.value || !topicCompanyId.value || !topicState) return null;


    //글의 id 값
    var id;

    if(key != null){ // 업데이트
      id = key;
      var ref = db.ref('/topic/'+key);
       var tempVar;
      ref.once('value').then(function(data){
          //기존 채팅 데이터 불러오는 부분.
           if(data.val()){
             tempVar = data.val().topic_chatLog;
           }
           topicData = {
             topic_id: id,
             topic_name: topicName.value,
             topic_company_id:topicCompanyId.value,
             topic_state: topicState,
             topic_chatLog : tempVar
           }

           var temp = {};
           temp['topic/'+id] = topicData;
           var result = db.ref().update(temp);
           getListData("topic", selectedCompany);
        });
    }else{ // 신규
      var chatDumpData = ["startPoint"];

      id = "topic_" + Date.now();
      db.ref('topic/' + id).set({
        topic_id: id,
        topic_name: topicName.value,
        topic_company_id:topicCompanyId.value,
        topic_state:topicState,
        topic_chatLog : chatDumpData
      });

    }

}


//리스트 클릭
$(document).on("click", "#sidebar_list_area>li", function(e){
    var target = e.target.parentNode.id;
    $("#contents_area").show();
    importListData('topic',target);
});
$(document).on("click", "#addTopic", function(e){
  $("#contents_area").show();
  topicForm("", "new");
});
$(document).on("click",".topic_key", function(e){
  if(e.target.classList.contains('addTopic')){
    uploadTopic();
  }else if(e.target.classList.contains('updateTopic')){
    uploadTopic(e.target.parentNode.id);
    getListData("topic", "update");
  }else if(e.target.classList.contains('deleteTopic')){
    deleteDatabaseItem("topic", e.target.parentNode.id);
  }
});
