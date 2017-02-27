


// main.html 페이지에서 로그인 여부 확인.
firebase.auth().onAuthStateChanged(function(user) {

  if (user) {
    console.log("로그인 상태");
  } else {
    console.log("로그인 안됨");
    location.href = '/index.html';
  }
});


//임시 저장된 토픽
var storageTopic;

//현재 접속자의 소속 회사
var selectedCompany = null;


$(document).ready(function() {

  $("#company_contents").hide();

  $("#imgView").hide();
  $("#bottomWrap").append(loadData());

  $("#openTopicManager").hide();
  $(".create").hide();

  window.firebaseAuth = new firebaseAuth();


  // 글 작성, 텍스트 에디터
  var textEditerOption = {
      height: 140,
      lang: 'ko-KR'
  };
  $('#sideContents').summernote(textEditerOption);
  $('#contents_main').summernote(textEditerOption);

  // page is ready
  $('#calendar>div').fullCalendar({
    height: 'parent',
    width: 'parent',
    locale: 'ko'
  });

  //calendar 내부 td 높이 조절
  var tdHeight = ($(".fc-day-top").width() / 6) * 5 - 26;
  var chatHeight = 0;
  $(window).resize(function(){

    tdHeight = ($(".fc-day-top").width() / 6) * 5 - 26;
    $(".fc-day-top>div").height(tdHeight);
  }).resize();

  var ref = db.ref('/user');
  ref.once('value').then(function(data){
    selectedCompany = data.val()[thisUserInfo.user_id].user_company;
  }).then(function(){
      // 미리보기 페이지 열기
      $(document).on("click", ".openList", function(){
        window.open('bookshelf.html?id='+selectedCompany, '_blank');
      });
  });


//처음 접속시 이전에 선택한 topic 이 없으므로 blank 를 만들어 선택하기 용이하게 함.
// 이는 다른 topic 을 선택할 경우 삭제,
  if(localStorage.selectTopic != null && localStorage.selectTopic ){
    prevTopic= "";
    selectTopic = localStorage.selectTopic;
    clickTopicListItem(true);
  }else{
    $("#topic-list").append("<option id='blank'></option>");
    clickTopicListItem(false);
  }
  // campareTopic(selectTopic);

// datepicker -----------------------------
  var datePickerOption = {
    dateFormat: 'yy-mm-dd',
	closeText: "닫기",
	prevText: "이전달",
	nextText: "다음달",
	currentText: "오늘",
	monthNames: [ "1월","2월","3월","4월","5월","6월",
	"7월","8월","9월","10월","11월","12월" ],
	monthNamesShort: [ "1월","2월","3월","4월","5월","6월",
	"7월","8월","9월","10월","11월","12월" ],
	dayNames: [ "일요일","월요일","화요일","수요일","목요일","금요일","토요일" ],
	dayNamesShort: [ "일","월","화","수","목","금","토" ],
	dayNamesMin: [ "일","월","화","수","목","금","토" ],
	weekHeader: "주",
	firstDay: 0,
	isRTL: false,
	showMonthAfterYear: true,
	yearSuffix: "년"};
  //새글 쓰기
  $( "#selectDay" ).datepicker(datePickerOption);
  //글 내용 보기
  $( "#date_main" ).datepicker(datePickerOption);

  //calendar 에 표시
  $(".fc-day-top").append("<div style='overflow:auto; height:"+tdHeight+"px;  margin-top:23px; width: 100%;'></div>");
  $("#calendar>div button").on("click", function(){
    // 월 이동시 해당 월에 대한 list 만 출력
    selectedMonthList();

    $(".fc-day-top").append("<div style='overflow:auto; height:"+tdHeight+"px;  margin-top:23px;width: 100%;'></div>");
    markOnCalendar();

  });


});

var db = firebase.database();

var inputForm = document.getElementById('inputForm');
var title   = document.getElementById('sideTitle');
var contents    = document.getElementById('sideContents');
var selectDay    = document.getElementById('selectDay');
var hiddenId   = document.getElementById('crud_hiddenId');
var mainContents    = document.getElementById('mainContents');
var postTopic = document.getElementById("post-topic");
var postAttr = document.getElementById("post-attr");
// var postTarget = document.getElementById("post-target");

var titleMain   = document.getElementById('title_main');
var contentsMain    = document.getElementById('contents_main');
var fileReader = document.getElementById('fileReader');


$("#fileReader").append(fileSelector());

// 글 생성하는 부분 create
inputForm.addEventListener('submit', function(e){
  e.preventDefault();


var contentValue = $('#sideContents').summernote('code');

  //날짜 선택이 되어 있다면 그날, 안되어 있다면 오늘 getTimeStamp();
  //작성시 빈칸이 있는지 체크 // 제목, 내용
  if (!title.value || !contentValue || !selectTopic) return null;

  if(!selectDay.value){
    selectDay.value = getTimeStamp();
  }
 //글의 id 값
  var id = "post_" + Date.now();
  var postTarget;

  var fileListArray = [];
  var fileList = $("#fileReader input:file");
  var uploadFileName = "";
  // form의 이미지 선택 여부 확인
  for(var i =0;i<fileList.length;i++){
    if($("#fileReader input:file")[i].files[0]){
      fileListArray.push($("#fileReader input:file")[i].files[0]);
    }
  }
  //이미지 업로드
  if(fileListArray[0] != undefined){
    uploadFileName = awsS3FileUpload(fileListArray);

      $("#fileReader .img").remove();
      $("#fileReader").append(fileSelector());
    //이미지 주소를 리턴하고 리턴되는 값을 글 쓸때 같이 저장. 없으면 없는거고
  }

  if(postAttr.value == 1){
    postTarget = $("#post-target").val();
  }else{
    postTarget = "";
  }

  // 파일 업로드 주소
  // http:/-/s3.ap-northeast-2.amazonaws.com/js-example-bucket/img-file/ 파일 이름
  db.ref('posts/' + id).set({
    post_id : id,
    post_writer: $("#user-id").val(),
    post_title: title.value,
    post_contents: contentValue,
    post_date: selectDay.value,
    post_email : userInfo.email,
    post_imgUrl : uploadFileName,
    post_attr : postAttr.value,
    post_target : postTarget,
    post_topic : selectTopic
  });

  title.value = '';
  contents.value  = '';
  selectDay.value = '';
  hiddenId.value = '';
  $("#fileReader").empty();

  $("#bottomWrap").append(loadData());
  setTimeout(function(){ $("#loadingData").remove();}, 200);

//달력에 표시
  markOnCalendar();
  // 현재 달력에 맞는 값만 리스트에 표시
  selectedMonthList();
  callContentsList();
});

//채팅창 데이터를 불러오는 부분.
var chatArea = document.getElementById('chat-area');

function callChatList(key){ // 선택된 토픽의 key
  var chatRef = db.ref('/topic/'+key+'/topic_chatLog');
  $("#chat-area").empty();

  //add 전체 삭제 후 전체 추가 하는 방식
  chatRef.on('child_added', function(data){
    loadChattingData(data, data.key);
  });
  //update 해당 월 만 다시 표기하는 방식
  chatRef.on('child_changed', function(data){
    $(".chat_"+data.key).remove();
    loadChattingData(data, data.key);
  });
}

function loadChattingData(data, dayKey){ // type = 입력인지 업데이트 인지.
  //날짜 경계선
  if(data.val() != "startPoint"){
    var newDay = document.createElement("div");
    var dayTitle = document.createElement("div");
    if(data.key != 0){
      chatArea.appendChild(newDay);
      newDay.classList.add("chat_"+dayKey);
      newDay.appendChild(dayTitle);
      dayTitle.innerHTML = "<div class='chat_value chat_dayLine'>"
      +"<div class='dayLine'></div><div class='dayValue'>"+data.key+"</div><div class='dayLine'></div>"
      +"</div>";
    }

    for(var i in data.val()){ // i = key

      if(data.val()[i].name != null){
        var newDIV = document.createElement("div");
        newDay.appendChild(newDIV);
        newDIV.innerHTML = "<div class='chat_value '>"
        +"<div class='chat_user_name'>"+data.val()[i].name+"</div>"
        +"<div class='chat_user_text'><label class='chat_contents'> "+data.val()[i].text+"</label></div>"
        +"</div>";
      }
      $("#chat-area").scrollTop($("#chat-area")[0].scrollHeight);
    }
  }
}

//채팅 등록
function uploadTopicChat(key){
  var value = $("#chat-text").val();
  if(key != null && value){
    $("#chat-text").val("");
    var chatRef = db.ref('/topic/'+key+'/topic_chatLog/'+getTimeStamp());
    chatRef.push({
      name: thisUserName,
      text: value
    });
    callChatList(key); // 리스트 불러오기
  }
}

// 글 내용을 불러오는 부분 read
var posts = document.getElementById('list');
var postsRef = db.ref('/posts');
var DataList = [];

function callContentsList(){

  //불러오기 // 전체 데이타 // 좌측 리스트
  $("#list").empty();
var nameArr = [];
  postsRef.on('child_added', function(data){
    var tempItem = new Object();
    var tempArray = new Object();

    if(data.val().post_topic == selectTopic){

      var contentsText = "<label name="+data.val().post_writer+"></label>";
      var target;
      if(data.val().post_target == "" || data.val().post_target == null){
        target = null;
      }else{
        target = "<label class="+data.val().post_target+" ></label>";
      }
      // console.log(data.val().post_target);
      var icon;
      var li = document.createElement('li');
      // 배열이 비어있는 경우 하나 추가
      if(!nameArr.length){
        tempArray.writer = "tempData";
        tempArray.target = "tempData";
        tempArray.count = 0;
        nameArr.push(tempArray);
      }

      //글쓴이 목록 배열, 글 겟수 카운팅
      for(var i in nameArr){
        // || nameArr[i].target == data.val().post_target
        if((nameArr[i].writer && (nameArr[i].writer == data.val().post_writer)) || (nameArr[i].target && (nameArr[i].target == data.val().post_target))){
          nameArr[i].count += 1;
          if(data.val().post_attr == 0 && nameArr[i].writer){
            contentsText += " 원고" + nameArr[i].count;
          }else{
            contentsText += target+" 원고"+nameArr[i].count+" 교정";
            // contentsText += target+" "+ "교정" + nameArr[i].count;
          }

          break;
        }else if(i == nameArr.length-1){
          if(data.val().post_attr == 0){
            contentsText += " 초고";
            tempItem.writer = data.val().post_writer;
          }else if(data.val().post_attr == 1 ){
            contentsText += target+" "+ "초고 교정";
            tempItem.target = data.val().post_target;
          }

          tempItem.count = 0;
          nameArr.push(tempItem);
          break;
        }
      }

      if(data.val().post_attr == 0){
        icon = '<i class="fa fa-pencil" aria-hidden="true"></i>';
      }else if(data.val().post_attr == 1){
        icon = '<i class="fa fa-search" aria-hidden="true"></i>';
      }else if(data.val().post_attr == 2){
        icon = '<i class="fa fa-volume-up" aria-hidden="true"></i>';
        contentsText += " 알림 / " + data.val().post_title;
      }else if(data.val().post_attr == 3){
        icon = '<i class="fa fa-commenting-o" aria-hidden="true"></i>';
        contentsText += " 기타 / " + data.val().post_title;
      }

      li.id = data.key;
      li.className += data.val().post_date.split('-')[0] +"-"+ data.val().post_date.split('-')[1];
      li.innerHTML = "<div class= 'title listItem'>"+icon+contentsText+"</div>";
      posts.appendChild(li);

      //리스트 // 작성자명
      writerName(data.val().post_writer);
      // 타겟 작가 명
      targetName(data.val().post_target);
    }

    $("#list>li").addClass("list-group-item");
    selectedMonthList();
  });
}
function writerName(value){
  var ref = db.ref('/user/'+value);
  ref.once('value').then(function(data){
    $("label[name="+value+"]").text(" ("+data.val().user_name+") ");
  });
}
function targetName(value){
  if(value){
    var ref = db.ref('/user/'+value);
    ref.once('value').then(function(data){
      $("label[class="+value+"]").text(data.val().user_name);
    });
  }
}

// 달력에 글 제목 표시
function markOnCalendar(){
  var i = 0;
  var temp = new Object();
  postsRef.once('value').then(function(data){
    $(".fc-day-top>div").empty();
    for( var key in data.val() ) {
      if(data.val()[key].post_topic == selectTopic){
        temp = data.val()[key];
        temp.key = key;
        DataList[i++] = temp;
        $("td[data-date="+data.val()[key].post_date+"]>div").append(
          "<div id="+key+" class='"+key+" cldItem'>"+lengthLimit(data.val()[key].post_title)+"</div>"
        );
      }
    }
  });
}
markOnCalendar();

// 권한에 따라 상단 topiclist가 해당되는것 만 나오도록 함
var userRef = db.ref('/user');
var topbarTopicRef = db.ref('/topic');

userRef.once('value').then(function(data_user){
  var tempUserData;
  for( var key in data_user.val() ) {

    //접속중인 유져
    if(key == $("#user-id").val() ){
      tempUserData = data_user.val()[key];
      var tempLimitTopic = tempUserData.user_limit_topic;

      //해당 유져의 권한 0 인 경우만 허용된 리스트만, 1인경우는 전부 2는 못보도록
      if(tempUserData.user_permission == 0){
        topbarTopicRef.once('value').then(function(data){
          for(var i in tempLimitTopic){
            for(var key in data.val()){
              var selectOption="";
              if(data.val()[key].topic_id == selectTopic){
                selectOption="selected='true'";
              }
              if((tempLimitTopic[i] != "tempData" || tempLimitTopic[i] != null) && tempLimitTopic[i] == key && data.val()[key].topic_company_id == selectedCompany){
                $("#topic-list").append('<option value='+data.val()[key].topic_id+' name='+data.val()[key].topic_state+' '+selectOption+'>'+data.val()[key].topic_name+'</option>');
              }
            }
          }
        });
      }else if(tempUserData.user_permission == 1){
        topbarTopicRef.on('child_added', function(data){
          var selectOption="";
          if(data.val().topic_id == selectTopic ){
            selectOption="selected='true'";
          }
          if(data.val().topic_company_id == selectedCompany){
            $("#topic-list").append('<option value='+data.val().topic_id+' name='+data.val().topic_state+' '+selectOption+'>'+data.val().topic_name+'</option>');

          }
        });
      }else if(tempUserData.user_permission == 0){
        // sm 아무짓도 안함
      }
    }
  }
});


//선택된 토픽
var selectTopic;
var thisTopicState;

function callTopicState(){
  var thisTopicStateRef = db.ref('/topic');
  thisTopicStateRef.on('child_added', function(data){
    if(data.val().topic_id == selectTopic){
      var result;
      if(data.val().topic_state == 0){
        result = "준비";
      }else if(data.val().topic_state == 1){
        result = "진행 중";
      }else if(data.val().topic_state == 2){
        result = "교정 완료";
      }else if(data.val().topic_state == 3){
        result = "제작 중";
      }else if(data.val().topic_state == 4){
        result = "인쇄 중";
      }else if(data.val().topic_state == 5){
        result = "배포 완료";
      }
      $("#topic-state").text(result);
      thisTopicState = data.val().topic_state;
    }
  });
}

function clickTopicListItem(type){
  //주제 변환시 우측 글 내용 삭제
  $("#title_main").val("");
  // $("#contents_main").val("");
  $("#contents_main").summernote('code', '');
  $("#date_main").val("");
  $("#writer_main").val("");
  $("#id_main").val("");
  $("#email_main").val("");
  $("#imgUrl_main").val("");
  $("#target_main").val("");
  $("#imgView").hide();
  $(".reply-area").hide();
  $("#contentBtn").hide();

  if($("#topic-list option:selected").val()){
    // topic 선택시
    $("#blank").remove();
    var selectTopicKey = $("#topic-list option:selected").val();
    callChatList(selectTopicKey);
    $("#contents").show();
    $(".create").show();
    selectTopic = $("#topic-list option:selected").val();
  }else if(type==true){
    // 접속시 토픽 불러오기
    callChatList(selectTopic);
    $("#contents").show();
    $(".create").show();
  }else{
    // 접속시 토픽이 없는 경우 (최초 접속, )
    $("#topic-state").text("");
    $("#topic-entry").empty();
    $(".create").hide();
    $("#contents").hide();
    selectTopic = $("#topic-list option:selected").val();
  }

  // var storageData = [];
  //local에 사용중이던 토픽 저장
  if(selectTopic != null){
    localStorage.selectTopic = selectTopic;
  }
  // var thisUserId = $("#user-id").val();
  // eval("localStorage."+thisUserId+"=selectTopic;");

  callTopicState();
  callContentsList();
  markOnCalendar();
  campareTopic(selectTopic);


}

var prevTopic;
var tempTime;
function campareTopic(selectTopic){

  clearTimeout(tempTime);
  $("#topic-entry").empty();
  if(!selectTopic){
    $("#chattingWrap").hide();
    prevTopic = selectTopic;
    $("#chat-area").empty();
    $("#topic-state").text("기획 선택");
    // $("#topic-entry").append("<label class='textForm'> || 기획 선택 || </label>");
    return null;
  }if(prevTopic != selectTopic){
    $("#chattingWrap").show();
    prevTopic = selectTopic;
    $("#bottomWrap").append(loadData());
    setTimeout(function(){ $("#loadingData").remove();}, 250);
  }

  var resultText = "";
  var resultAttayTemp = [];
  var topicEntryRef = db.ref('/user');
  topicEntryRef.once('value').then(function(data){
    for( var key in data.val() ) {
      var tempTopicList = data.val()[key].user_limit_topic
      for(var i in tempTopicList){
        if(tempTopicList[i] == selectTopic){
          resultAttayTemp.push(data.val()[key].user_name);
        }
      }
    }
  }).then(function(){
    for(var t in resultAttayTemp){
      resultText += resultAttayTemp[t];
      if(t < resultAttayTemp.length-1){
        resultText += " / ";
      }
    }
    $("#topic-entry").append("<label>"+resultText+"</label>");
  });
}

// 현재 달력에 맞는 값만 리스트에 표시
function selectedMonthList(){
  var moment = $('#calendar>div').fullCalendar('getDate').format().split('-');
  $("#list>li").hide();
  $("."+moment[0]+"-"+moment[1]).show();
}

// 변경 사항을 화면에 적용
postsRef.on('child_changed', function(data) {
  setTimeout(function(){ $("#loadingData").remove();}, 500);
  markOnCalendar();
});
//삭제 후 화면에 적용
postsRef.on('child_removed', function(data) {
  var reviewNode = document.getElementById(data.key);
  reviewNode.parentNode.removeChild(reviewNode);
  setTimeout(function(){ $("#loadingData").remove();}, 500);
  markOnCalendar();
});

// 리스트 정보 클릭시, 달력 클릭시랑 합쳐도 되겠음
posts.addEventListener('click', function(e) {
  var reviewNode;
  if(e.target.nodeName.toLowerCase() == "div"){
    reviewNode = e.target.parentNode;
  }else{
    reviewNode = e.target.parentNode.parentNode;
  }

  $(".cldItem").css("color","black");

  var tempDate;
  var tempKey;

    for(var i in DataList){
      if(DataList[i].key == reviewNode.id){
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
    $('#calendar>div').fullCalendar('gotoDate', tempDate);
    if($(".fc-day-top").find('div').length <= 0){
      $(".fc-day-top").append("<div style='overflow:auto; height:70px;  margin-top:23px;'></div>");
      markOnCalendar();
    }

    $("."+tempKey).css("background-color", 'rgba(26,179,148,0.9)').css("color", "white");
});

//
$(document).on("click","button", function(e){
  var reviewNode = e.target.parentNode;

  if (e.target.classList.contains('control-user')) {
    location.href = '/authors.html';

  }else if (e.target.classList.contains('topic')) {
    location.href = '/topics.html';

  }else if (e.target.classList.contains('manage')) {
    location.href = '/books.html';

  }else if (e.target.classList.contains('system')) {
    location.href = '/system.html';
  }
});


$(".control-company").on("click", function(e){
  getListData("company");

 $(".company_list_header").html("출판사 관리");
 $(".company_addBtn").show();
 $(".newItem").val("출판사 추가");
 $(".newItem").attr("id", "addCompany");
 $("#controlCompany").show();
});


// 글 수정, 삭제 이벤트
mainContents.addEventListener('click', function(e) {
  var reviewNode = e.target.parentNode;



  //로그인한 작가와 작성자 이름이 같은경우만 수정 삭제 가능
  if(userInfo.email == $('#email_main').val()){

    // UPDATE, 시작, 등록 //글수정
    if (e.target.classList.contains('edit')) {

      if (!$('#title_main').val() || !$('#contents_main').val()) return null

      $("#bottomWrap").append(loadData());

      var id = $('#id_main').val();
      ;

      db.ref('posts/' + id).update({
        post_title: $('#title_main').val(),
        post_contents: $("#contents_main").summernote('code'),
        // post_contents: $('#contents_main').val(),
        post_writer: $("#user-id").val(),
        post_date: $('#date_main').val()
        // post_email: $('#email_main').val(),
        // post_imgUrl: $('#imgUrl_main').val(),
        // post_attr : $('#attr_main').val(),
        // post_target : $('#target_main').val(),
        // post_topic : selectTopic
      });

    }

    // DELETE
    if (e.target.classList.contains('delete')) {
      var id = $('#id_main').val();
      //aws s3에 업로드되어 있는 파일 삭제
      awsS3FileDelete($('#imgUrl_main').val());
      db.ref('posts/' + id).remove(); // db에서 해당 내용 삭제

      $("#title_main").val("");
      $("#contents_main").val("");
      $("#date_main").val("");
      $("#writer_main").val("");
      $("#id_main").val("");
      $("#email_main").val("");
      $("#imgUrl_main").val("");
      $("#imgView").hide();
      $(".reply-area").hide();
    }
  }
});


//리스트 데이터 가져오기
function getListData(target, type){
  var listRef = db.ref('/'+target);
  //불러오기 // 전체 데이타
  if(type == 'update'){
    listRef.on('child_changed', function(data){
      //category, product를 수정할 시에는 이리로 못 들어온다. 이유 모르겠음
      createList(target, data, type);
    });
  }else{
    $(".company_list").empty();
    $("#mng_list_area").empty();
    listRef.on('child_added', function(data){
      createList(target, data);
    });
  }
}

//li 생성
function createList(target, data, type){
  var li = document.createElement('li');
  li.id = data.key;
  if(target == "company"){
    li.innerHTML = "<div class= 'company listItem'>"+data.val().company_name+"</div>";
    if(type == 'update'){
      nameTextChanger(data.key,data.val().company_name);
    }else{
      $(".company_list").append(li);
    }
    $(".company_addBtn").show();
    $(".company_list>li").addClass("list-group-item");
  }

  if(target == "company"){
  }
  function nameTextChanger(key, value){
    $("#"+key+">div").text(value);
  }
}


var controlCompany = document.getElementById('controlCompany');
controlCompany.addEventListener('click', function(e) {
  var target = e.target.parentNode.id;

  if (e.target.classList.contains('newItem')) {
   if($(".newItem").attr("id") == "addCompany"){

     $("#company_contents").show();
     //신규 출판사
     $(".company_area").show();
     companyForm("", true, "new");
   }
 }

  //--------------------------------------------------------출판사
  if (e.target.classList.contains('company')) {
    //출판사 리스트 클릭시
    $(".company_area").show();
    $("#company_contents").show();
    importListData("company", target);
  }
  if(e.target.classList.contains('addCompany')){
    uploadCompany();
  }else if(e.target.classList.contains('updateCompany')){
    uploadCompany(e.target.parentNode.id);
  }else if(e.target.classList.contains('deleteCompany')){
    deleteDatabaseItem("company", e.target.parentNode.id);
  }

});

//출판사 관리 창
function companyForm(name, value, type, key){

  $("#company-name").val(name);
  $(".company_key").attr("id",key);
  if(type == "new"){
    $(".addCompany").show();
    $(".updateCompany").hide();
    $(".deleteCompany").hide();
  }else if(type == "list"){
    $(".addCompany").hide();
    $(".updateCompany").show();
    $(".deleteCompany").show();
  }
  $(':radio[name="company_chk"]').removeAttr("checked");
  if(value == "true" || type == "new"){
    $("#company_active").attr("checked","checked");
  }else{
    $("#company_disable").attr("checked","checked");
  }
}

//리스트 데이터를 본문에 입력
function importListData(target, listKey){
    var ref = db.ref('/'+target);
    var temp = new Object();
    ref.once('value').then(function(data){ // topic = addOptionMenu("company","topic");
      for( var key in data.val() ) {
        if(key == listKey){
          if(target == "company"){
            companyForm(data.val()[key].company_name, data.val()[key].company_isactive, "list" , key);
          }
        }
      }
    });
}

//작가 등록
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
    if(work != null){ // work = delete, add
        //기존 존재하던 array를 가져옴
        var ref = db.ref('/user');
        var temp = new Object();

        // 작가 설정 = 사용자 추가 제거 부분
        ref.once('value').then(function(data){
          for( var key in data.val() ) {
            temp = data.val()[key];
            if(temp.user_id == id){
              //user 정보에서 허용할 topic의 추가 및 삭제
              if(work == "add"){
                tempArray = temp.user_limit_topic;
                if(tempArray.indexOf(topic) == -1){
                  tempArray.push(topic); // qqqqqqqqqqqqqqqqqqqqqqq
                }else{
                  return null;
                }
              }else if(work == "delete"){
                tempArray = temp.user_limit_topic;
                if(tempArray.indexOf(topic) != -1){
                  tempArray.splice(tempArray.indexOf(topic), 1);
                }else{
                  return null;
                }
              }
              db.ref('user/' + id).update({
                user_limit_topic: tempArray
              });
              getListData("user", "update");
              campareTopic(selectTopic);
            }
          }
        });

    }else{
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
            db.ref('user/' + id).update({
              user_name: userName.value,
              user_email: userEmail.value,
              user_company: userCompany.value,
              user_permission: userPermission,
              user_limit_topic: tempArray
            });
            getListData("user");
          }
        }
      });
    }
  }else{
    //유져 신규
    db.ref('user/' + id).set({
      user_id: key,
      user_name: userName.value,
      user_email: userEmail.value,
      user_company: userCompany.value,
      user_permission: userPermission
    });
    getListData("user");
  }
}

function uploadCompany(key){
  var companyName = document.getElementById('company-name');
  var isActive = $(':radio[name="company_chk"]:checked').val();
  //작성시 빈칸이 있는지 체크 // 제목, 내용
  if (!companyName.value) return null;
  //글의 id 값
  var id;
  if(key != null){
    id = key;
    var ref = db.ref('/company/'+id);
    ref.once('value').then(function(data){
      db.ref('company/' + id).update({
        company_name: companyName.value,
        company_isactive: isActive
      });
      getListData("company");
    });

  }else{
    id = "company_" + Date.now();
    db.ref('company/' + id).set({
      company_id: id,
      company_name: companyName.value,
      company_isactive: isActive
    });
    getListData("company");
  }

}


// 문자수가 6자가 넘는경우 5자 + ... 으로 표기
function lengthLimit(text){
  var result = "";
  if(text.length > 8){
    for(var i = 0 ; i < 7 ; i++){
      result += text[i];
    }
    result += "...";
  }else{
    result = text;
  }
  return result;
}

 //오늘 날짜 계산, 포맷 yyyy-mm-dd
function getTimeStamp() {
  var d = new Date();
  var s =
  leadingZeros(d.getFullYear(), 4) + '-' +
  leadingZeros(d.getMonth() + 1, 2) + '-' +
  leadingZeros(d.getDate(), 2);
  return s;
}
function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();
  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
    zero += '0';
  }
  return zero + n;
}


// 글 내용
function viewContents(title, contents, idNum, dateNum, writer, email, imgUrl, postattr,posttarget, topic){
//글 클릭시 수정 삭제 버튼 표시
  $("#contentBtn").show();

  $(".reply-area").show();
    if(imgUrl != ""){
      $("#imgView").show();
    }else{
      $("#imgView").hide();
    }

  var url = "http://s3.ap-northeast-2.amazonaws.com/js-example-bucket/img-file/"
  var imgViewer = "";
  if(imgUrl != ""){
    var img =  imgUrl.split('|');
    for(var i = 0 ; i < img.length - 1; i++){
      var fileType = img[i].split('.').pop().toLowerCase();
      if(fileType == "jpg" || fileType == "png" || fileType == "gif" || fileType == "bmp" || fileType == "jpeg"){
        imgViewer += '<a href="'+(url+img[i])+'" download><img class="img" src='+(url+img[i])+'></a>';
      }else{
        imgViewer += '<div class="doc"><a href="'+(url+img[i])+'" download>'
        +img[i].split('_')[2]+'</a></div>';
      }
    }
  }

  var userRef = db.ref('/user');

  userRef.once('value').then(function(userData){

    console.log(contents);

    $("#title_main").val(title);
    $("#contents_main").summernote('code', contents);
    // $("#contents_main").html(contents);
    $("#date_main").val(dateNum);
    $("#writer_main").val(userData.val()[writer].user_name);
    $("#id_main").val(idNum);
    $("#email_main").val(email);
    $("#imgUrl_main").val(imgUrl);
    $("#imgView").html(imgViewer);
    $("#attr_main").val(postattr);
    $("#target_main").val(posttarget);
    $("#topic_main").html(topic);

  });
}


//데이터베이스 삭제
function deleteDatabaseItem(target, key){
  console.log(target +" - "+ key +" - "+ "삭제 됨");
  //aws s3에 업로드되어 있는 파일 삭제
  awsS3FileDelete($('#imgUrl_main').val());
  // db에서 해당 내용 삭제 //
  db.ref(target+'/' + key).remove();
  $("#"+key).remove();
}

function loadData(){
  return '<div id="loadingData" class="loadingData"></div>';
}


function fileSelector(){
  var result = "<div class='previewWrap' ><div class='preview textStyle'>+</div><input type='file' class='preview file' /><img class='preview' /></div>";
  return result;
}

//select의 option 생성
function getDatabase(target, type , number){
  var ref = db.ref('/'+target);
  var temp = new Array();
  var tempPost = new Array();

  $("#user_company").empty();
  $("#user-company").empty();
  $("#reply-view").empty();
  $("#topicMember").empty();
  $("#topicNonMember").empty();
  $("#post-target").empty();

  var tempArr = []; // 임시 저장용
  var tempArr2 = [];

  ref.once('value').then(function(data){
    for( var key in data.val() ) {
      temp = data.val()[key];
      tempArr2.push(temp);
      if(type == "user"){
        $("#user-company").append('<option value='+temp.company_id+'>'+temp.company_name+'</option>');
      }else if(type == "reply"){
        if(temp.reply_post_id == number){
            var userRef = db.ref('/user');
            tempArr.push(temp);
            var u = 0;

            //뭔가 이상한 방식으로 돌아감.
            userRef.once('value').then(function(userData){

              var sysdate = new Date(parseInt(tempArr[u].reply_id.split("_")[1]));
              var year = sysdate.getFullYear();
              var month = sysdate.getMonth()+1;
              var day = sysdate.getDate();
              var hour = sysdate.getHours();
              var min = sysdate.getMinutes();
              //(getDay);//day 는 요일.. -------------------------------

              var timeResult =   year + "-" + (month < 10 ? "0" + month : month) + "-"
              + (day < 10 ? "0" + day : day) + " "
              + (hour < 10 ? "0" + hour : hour) + ":"
              + (min < 10 ? "0" + min : min);

              $("#reply-view").prepend('<div id='+tempArr[u].reply_id+'>'
              +'<div class="replyContents">'+tempArr[u].reply_contents+'</div>'
              +'<div class="replyWriter">'+userData.val()[tempArr[u].reply_user_id].user_name+'</div>'
              +'<div class="replyDate">'+ timeResult +"</div> "
              +'</div>');
              u++;
            });

        }
      }else if(type == "topic-manager"){
        var tempVar = temp.user_limit_topic;
        //permission == 0 인 것은 시스템과 관리자는 나올 필요가 없기 때문
        if(tempVar.indexOf(number) != -1 && temp.user_permission == 0){
          $("#topicMember").append('<option value='+temp.user_id+'>'+temp.user_name+'</option>');
        }else if(temp.user_permission == 0){
          $("#topicNonMember").append('<option value='+temp.user_id+'>'+temp.user_name+'</option>');
        }

      }else if(type == "topic-title"){
        if(temp.topic_id == number){
          $("#topicManagerTitle").text(temp.topic_name);
        }
      }
    }
    if(type == "userName"){
      var postsRef = db.ref('/posts');
      var postArray = [];
      postsRef.once('value').then(function(postData){
        for(var key in postData.val()){
          postArray.push(postData.val()[key]);
        }
      }).then(function(){
        for(var i in tempArr2){
          for(var j in postArray){
            if(tempArr2[i].user_id == postArray[j].post_writer && tempArr2[i].user_permission == 0 ){
              $("option[value="+tempArr2[i].user_id+"]").remove();
              $("#post-target").append('<option value='+tempArr2[i].user_id+'>'+tempArr2[i].user_name+'</option>');
            }
          }
        }
      });
    }
  });
}
