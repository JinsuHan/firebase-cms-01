
//main -------------------------------------------------------------------------------------------
//리플 달기
$(document).on('click','.insert-reply',function(e){
  if (!$("#id_main").val()) return null;
  //글의 id 값
  var id = "reply_" + Date.now();
  db.ref('reply/' + id).set({
    reply_id: id,
    reply_post_id: $("#id_main").val(),
    reply_contents: $(".input-reply").val(),
    reply_user_id:$("#user-id").val()
  });
  getDatabase("reply", "reply", $("#id_main").val());
  $(".input-reply").val("");
});

//하단, 구분, 도서 추가 버튼
$(document).on("click",".newItem", function(e){
  if(e.target.id == "addCategory"){
    $("#contents_area").show();
    $("#category-name").val("");
    $("#category-company-id").val("");
    $("#mng_product").hide();
    $("#mng_writer").hide();
    $("#mng_category").show();

    categoryForm("", "", "new", "");
  }
  if(e.target.id == "addProduct"){
    $("#contents_area").show();
    $("#mng_product input").val("");
    $("#mng_product select").val("");
    $("#mng_writer").hide();
    $("#mng_category").hide();
    $("#mng_product").show();

    productForm("","new","");
  }
  if(e.target.id == "addWriter"){
    $("#contents_area").show();
    $("#mng_writer input, #mng_writer textarea").val("");
    $("#writer-nowImg").text("");
    $("#mng_writer").show();
    $("#mng_category").hide();
    $("#mng_product").hide();

    writerForm("","","new","");
  }
});

//main chatting 토글 버튼
$(document).on("click","#toggleBtn", function(e){
  $("#chat-contents").toggle();
  $("#chat-input").toggle();

  $(".sidebarDiv01").toggleClass("toggleDiv01");
  $(".sidebarDiv02").toggleClass("toggleDiv02");

  if($(".sidebarDiv01").hasClass("toggleDiv01")){
    $("#toggleBtn").text("열기");
  }else{
    $("#toggleBtn").text("닫기");
    $("#chat-area").scrollTop($("#chat-area")[0].scrollHeight);
  }
});

//닫기 버튼
$(document).on("click",".closeBtn", function(e){
  $("#management").hide();
  $("#controlCompany").hide();
  $("#topicManager").hide();
  $("#chattingField").hide();
  $(".company_area").hide();
  $("#mng_category").hide();
  $("#mng_product").hide();
  $("#mng_list_area").empty();
  $("#mng_addBtn").hide();
});

//calendar 에서 제목 클릭시 달력 글 클릭시
$(document).on("click", ".cldItem" ,function(e){

  var selectNode = e.target;
  $(".cldItem").css("color","black");
  var tempDate;
  var tempKey;
  var imgUrl;
  for(var i in DataList){
    if(DataList[i].key == selectNode.id){
      $(".fc-day-top>div>div").css("background-color", '');
      viewContents(
        DataList[i].post_title,
        DataList[i].post_contents,
        DataList[i].key,
        DataList[i].post_date,
        DataList[i].post_writer,
        DataList[i].post_email,
      DataList[i].post_imgUrl,
      DataList[i].post_attr,
      DataList[i].post_target,
      DataList[i].post_topic);
        tempDate = DataList[i].post_date;
        tempKey = DataList[i].key;
        break;
    }
  }
  getDatabase("reply", "reply", tempKey);
  $("."+tempKey).css("background-color", 'rgba(26,179,148,0.9').css("color", "white");

});

//새글 창 열기
$(document).on("click", ".create", function(){
    if(!selectTopic) return null;
    $("#createContents").show();

      $("#post-attr").empty();


      $(document).on("change", "#post-attr", function(e){
        if(e.target.value == 1){
          $("#post-target").attr('disabled', false);
        }else{
          $("#post-target").attr('disabled', true);
        }
      });

      if($("#user_permission").val() == 0){
        $("#post-target").attr('disabled', true);
        if(thisTopicState == 5){
          $("#post-attr").html("<option value='3'>기타</option>");
        }else{
          $("#post-attr").html("<option value='0'>원고</option><option value='3'>기타</option>");
        }
      }else if($("#user_permission").val() == 1){
        if(thisTopicState == 5){
          $("#post-attr").html("<option value='2'>알림</option><option value='3'>기타</option>");
        }else{
          $("#post-attr").html("<option value='1'>교정</option><option value='2'>알림</option><option value='3'>기타</option>");
        }

      }
    // getDatabase("user", "post");

    getDatabase("user", "userName");
});

// 새글 등의 창을 닫는 버튼
$(document).on("click","#closeForm", function(){
  $("#createContents").hide();
  $("form").each(function() {
    if(this.id == "inputForm") this.reset();
  });
});

//selectbox 상하 아이템 이동
$(document).on("click","#downBtn",function(){
  $("#topicNonMember").append($("#topicMember option:selected"));
  $("#topicMember option:selected").remove();
});
$(document).on("click","#upBtn",function(){
  $("#topicMember").append($("#topicNonMember option:selected"));
  $("#topicNonMember option:selected").remove();
});
// topic 설정
$(document).on("click","#topicSetUp",function(){
  for(var i = 0; i < $("#topicNonMember option").length;i++){
    var temp = $("#topicNonMember option")[i];
    uploadUser(temp.value, selectTopic, "delete"); // !!!!!!!!!!!!!!!!!!
  }
  for(var i = 0; i < $("#topicMember option").length;i++){
    var temp = $("#topicMember option")[i]; // -> 유져 아이디 // 맴버 등록된 사람
    uploadUser(temp.value, selectTopic, "add");
  }

  $("#topicManager").hide();
});

// topic 참여자 설정 창 열기
$(document).on("click","#openTopicManager",function(){
  if(selectTopic != null){
    getDatabase("topic","topic-title",selectTopic);
    getDatabase("user", "topic-manager", selectTopic);
    $("#topicManager").show();
  }
  });

// 상단 topic 리스트 option 선택시
$(document).on("change","#topic-list", function(e){
  clickTopicListItem();
});
// $(document).on("click","#topic-list", function(e){
//   console.log(e.target);
//   // clickTopicListItem();
// });

//채팅에서 전송 버튼 클릭 이벤트
$(document).on("click", "#chat-upload", function(e){
  uploadTopicChat(selectTopic);
});

//채팅 창에서 엔터
$(document).on("keypress", "#chat-text", function(e){
  if(e.keyCode == 13){
    uploadTopicChat(selectTopic);
  }
});


// 새 글 작성시 미리보기
$(document).on("change",".file", function(){
  var temp = $(this).val();
  // console.log($(this)[0].files[0]); // 파일 정보
  var tempParents = $(this).parents()[0];
  if(!temp){
    $(this).remove();
    tempParents.remove();
  }else{
    $("#fileReader").append(fileSelector());
    var fileType = temp.split('.').pop().toLowerCase();
    if(fileType == "jpg" || fileType == "png" || fileType == "gif" || fileType == "bmp" || fileType == "jpeg"){
      //그림인경우
      var reader  = new FileReader();

      reader.addEventListener("load", function () {
        $(tempParents).children('img').attr('src', reader.result);
      }, false);
      if ($(this)[0].files[0]) {
        reader.readAsDataURL($(this)[0].files[0]);
      }
    }else{
      //아닌경우
      $(tempParents).children('div').text(temp.split(".").pop().toUpperCase());
    }
  }
});
