
var selectedCompany = null;

$(document).ready(function() {

  //제품 페이지 datepicker
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
  	yearSuffix: "년"
  };
    $( "#product-release" ).datepicker(datePickerOption);

  var ref = db.ref('/user');
  ref.once('value').then(function(data){
    selectedCompany = data.val()["user_"+user.uid].user_company;
  });

  // .auth.signOut();
  // location.href = '/index.html';



});
//리스트 데이터 가져오기
function getListData(target, type){
  var listRef = db.ref('/'+target);
  var temp;
  //불러오기 // 전체 데이타
  if(type == 'update'){
    listRef.on('child_changed', function(data){
      createList(target, data, type);
    });
  }else{
    $("#sidebar_list_area").empty();
    listRef.on('child_added', function(data){
      // if(target == "company"){
      //   temp = eval("data.val().company_id");
      // }else{
      //   temp = eval("data.val()."+target+"_company_id");
      // }
      temp = eval("data.val()."+target+"_company_id");
      if(temp == selectedCompany){
        createList(target, data, type);
      }
    });
  }
}
function createList(target, data, type){
  // console.log(target, data.val().user_name, type);
  var li = document.createElement('li');
  li.id = data.key;
  if(target == "category"){
    li.innerHTML = "<div class= 'category listItem'>"+data.val().category_name+"</div>";
  }else if(target == "product"){
    li.innerHTML = "<div class= 'product listItem'>"+data.val().product_name+"</div>";
  }else if(target == "writer"){
    li.innerHTML = "<div class= 'writer listItem'>"+data.val().writer_name+"</div>";
  }

    if(type == 'update'){
      if(target == "category")nameTextChanger(data.key,data.val().category_name);
      if(target == "product")nameTextChanger(data.key,data.val().product_name);
      if(target == "writer")nameTextChanger(data.key,data.val().writer_name);
    }else{
      $("#sidebar_list_area").append(li);
    }
    $("#sidebar_list_area>li").addClass("list-group-item");
  function nameTextChanger(key, value){
    $("#"+key+">div").text(value);
  }
}

function categoryForm(id, name, type, key){
//출판사 이름 가져오기 필요
  // $("#category-company-id").val(id);
  var ref = db.ref('/company/'+selectedCompany);
  ref.once('value').then(function(data){
    $("#category-company-name").val(data.val().company_name);
  });
  $("#category-company-id").val(selectedCompany);

  // console.log(id,name,type,key);
  $("#category-name").val(name);
  $("#category-id").val(key);
  if(!name){
    name = "신규 구분";
  }
  $("#targetName").text(name);

  if(type == "new"){
    $(".addCategory").show();
    $(".updateCategory").hide();
    $(".deleteCategory").hide();
  }else if(type == "list"){
    $(".addCategory").hide();
    $(".updateCategory").show();
    $(".deleteCategory").show();
  }
}
function writerForm(id, data, type, key){
  $("#writer-company-id").val(selectedCompany);
  var name = data.name;
  if(!data){
    name = "신규 작가";
  }else{
    name = data.writer_name;
    $("#writer-name").val(data.writer_name);
    $("#writer-intro").val(data.writer_intro);
    $("#writer-email").val(data.writer_email);
    $("#writer-id").val(key);
    var result = "";
    if(data.writer_img){
      result = data.writer_img.split("|")[0];
    }
    $("#writer-nowImg").text(result);
  }
  $("#targetName").text(name);

  if(type == "new"){
    $(".addWriter").show();
    $(".updateWriter").hide();
    $(".deleteWriter").hide();
  }else if(type == "list"){
    $(".addWriter").hide();
    $(".updateWriter").show();
    $(".deleteWriter").show();
  }
}
$(document).on("keypress", ".searchList", function(e){
  if(e.keyCode == 13){
    var target = e.target.id;
    var value = $(".searchList").val();
    var temp;
    if(target == "searchProduct"){
      for(var i=0;i < $(".product").length;i++){
        temp = $(".product")[i].innerHTML.match(value);
        if(!value){
          $(".product")[i].parentNode.style.display = "block";
        }else if(temp){
          $(".product")[i].parentNode.style.display = "block";
        }else{
          $(".product")[i].parentNode.style.display = "none";
        }
      }

    }else if(target == "searchCategory"){
      for(var i=0;i < $(".category").length;i++){
        temp = $(".category")[i].innerHTML.match(value);
        if(!value){
          $(".category")[i].parentNode.style.display = "block";
        }else if(temp){
          $(".category")[i].parentNode.style.display = "block";
        }else{
          $(".category")[i].parentNode.style.display = "none";
        }
      }

    }else if(target == "searchWriter"){
      for(var i=0;i < $(".writer").length;i++){
        temp = $(".writer")[i].innerHTML.match(value);
        if(!value){
          $(".writer")[i].parentNode.style.display = "block";
        }else if(temp){
          $(".writer")[i].parentNode.style.display = "block";
        }else{
          $(".writer")[i].parentNode.style.display = "none";
        }
      }

    }
  }
});


//도서-> 도서, 제품 선택시
$(document).on("click",".topMenuBtn",function(e){
  var target = e.target.id;
  $("#addBtnArea").show();
  $("#searchArea").show();
  $("#contents_area").hide();

  if(target == "category"){
    //구분. 출판사명
    $("#sidebar_list_area").empty();
    $("#addBtnArea>input[type='button']").attr("id","addCategory").val("구분 추가");
    $("#searchArea>input[type='text']").attr("id","searchCategory").val("");
    $("#searchArea>input[type='text']").attr("placeholder","구분 검색").val("");
    getListData("category");

  }else  if(target == "product"){
//프로덕트. 출판사,구분 명
  getDatabase("category","product-category");
  getDatabase("writer", "product-writer");
    $("#sidebar_list_area").empty();
    $("#addBtnArea>input[type='button']").attr("id","addProduct").val("도서 추가");
    $("#searchArea>input[type='text']").attr("id","searchProduct").val("");
    $("#searchArea>input[type='text']").attr("placeholder","도서 검색").val("");
    getListData("product");

  }else  if(target == "writer"){
//프로덕트. 출판사,구분 명
    $("#sidebar_list_area").empty();
    $("#addBtnArea>input[type='button']").attr("id","addWriter").val("작가 추가");
    $("#searchArea>input[type='text']").attr("id","searchWriter").val("");
    $("#searchArea>input[type='text']").attr("placeholder","작가 검색").val("");
    getListData("writer");

  }
});


//select의 option 생성
function getDatabase(target, type){

  var ref = db.ref('/'+target);
  var temp = new Object();

  $("#category-company-id").empty();
  $("#product-company-id").empty();
  $("#product-category-id").empty();
  $("#user-company").empty();

  var tempArr = []; // 임시 저장용

  ref.once('value').then(function(data){

    for( var key in data.val() ) {
      temp = data.val()[key];
      if(type == "product-category"){
        $("#product-category-id").append('<option value='+temp.category_id+'>'+temp.category_name+'</option>');
      }else if(type == "product-writer"){
        $("#product-writer-id").append('<option value='+temp.writer_id+'>'+temp.writer_name+'</option>');
      }
    }
  });
}

function productForm(info, type, key){
  var name = info.names;

    if(!name){
      name = "신규 도서";
    }

  $("#targetName").text(name);
  //보여지는 화면

  var ref = db.ref('/company/'+selectedCompany);
  ref.once('value').then(function(data){
    $("#product-company-name").val(data.val().company_name);
  });

  $("#product-company-id").val(selectedCompany);

  $("#product-category-id").val(info.category_id);
  $("#product-writer-id").val(info.user_id);

  $("#product-name").val(info.names);
  $("#product-subtitle").val(info.subtitle);
  if(key != ""){
    viewImgs(info.img);
  }
  $("#product-img-hidden").val(info.img);
  $("#product-release").val(info.release);
  $("#product-unique").val(info.unique);
  $("#product-length").val(info.lengths);
  $("#product-tag").val(info.tag);
  $("#product-explanation").val(info.explanation);
  $("#product-link").val(info.links);
  $("#product-id").val(key);

  if(type == "new"){
    $("#product-img-view").hide();
    $("#product-img").show();
    $(".addProduct").show();
    $(".updateProduct").hide();
    $(".deleteProduct").hide();
  }else if(type == "list"){
    $("#product-img-view").show();
    $("#product-img").hide();
    $(".addProduct").hide();
    $(".updateProduct").show();
    $(".deleteProduct").show();
  }
}

function viewImgs(imgUrl){
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
  }else{
    imgViewer += '<div class="doc">이미지 없음</div>';
  }
  $("#product-img-hidden").val(imgUrl);
  $("#product-img-view").html(imgViewer);
}

//구분 추가
function uploadCategory(key){

    var categoryName = document.getElementById('category-name');
    var categoryCompanyId = document.getElementById('category-company-id');

    //작성시 빈칸이 있는지 체크 // 제목, 내용
    if (!categoryName.value || !categoryCompanyId.value) return null;

    //글의 id 값
    var id;
    if(key != null){
      id = key;
    }else{
      id = "category_" + Date.now();
    }

    db.ref('category/' + id).set({
      category_id: id,
      category_name: categoryName.value,
      category_company_id:categoryCompanyId.value,
    });
}

function uploadWriter(key){

    //작성시 빈칸이 있는지 체크 // 제목
    if (!$("#writer-name").val()) return null;

    //글의 id 값
    var id;
    if(key != null){
      id = key;
    }else{
      id = "writer_" + Date.now();
    }

    var fileListArray = [];
    var uploadFileName = "";

    if($("#writer-img").get(0).files[0]){
      //업로드를 원하는 파일이 있는 경우
      fileListArray.push($("#writer-img").get(0).files[0]);
      if(fileListArray[0]){
        uploadFileName = awsS3FileUpload(fileListArray);
          if($("#writer-nowImg").text()){
            awsS3FileDelete($("#writer-nowImg").text() + "|");
          }
      }
    }else{
      //없는 경우
      if($("#writer-nowImg").text()){
        // 이 전에 업로드한 이미지가 있는 경우
        uploadFileName = $("#writer-nowImg").text() + "|";
      }
    }


    db.ref('writer/' + id).set({
      writer_id: id,
      writer_name: $("#writer-name").val(),
      writer_intro: $("#writer-intro").val(),
      writer_img: uploadFileName,
      writer_company_id: $("#writer-company-id").val(),
      writer_email: $("#writer-email").val()
    });
}

//도서 등록
function uploadProduct(key){

    //작성시 빈칸이 있는지 체크 // 제목, 내용 // 너무 많다;
    var typeDate;
    if(!$("#product-release").val()){
      typeDate = getTimeStamp();
    }else{
      typeDate = $("#product-release").val();
    }

    var fileListArray = [];
    var uploadFileName = "";
    // form의 이미지 선택 여부 확인
    if($("#product-img").get(0).files[0]){
      fileListArray.push($("#product-img").get(0).files[0]);
    }

    //이미지 업로드
    if(fileListArray[0] != undefined){
      uploadFileName = awsS3FileUpload(fileListArray);
      //이미지 주소를 리턴하고 리턴되는 값을 글 쓸때 같이 저장. 없으면 없는거고
    }

    //글의 id 값
    var id;
    if(key != null){ //업데이트
      id = key;
      var ref = db.ref('/product');
      var temp = new Object();
      ref.once('value').then(function(data){
        for( var pkey in data.val() ) {
          temp = data.val()[pkey];
          if(temp.product_id == key){
            db.ref('product/' + id).update({
              product_company_id: $("#product-company-id").val(),
              product_category_id: $("#product-category-id").val(),
              product_user_id: $("#product-writer-id").val(),
              product_name: $("#product-name").val(),
              product_subtitle: $("#product-subtitle").val(),
              product_contents: $("#product-contents").val(),
              // product_img: temp.product_img, // 이미지 링크로 대체 // 수정 불가
              product_release: typeDate,
              product_unique: $("#product-unique").val(),
              product_length: $("#product-length").val(),
              product_tag: $("#product-tag").val(),
              product_explanation: $("#product-explanation").val(),
              product_link: $("#product-link").val()
            });
          }
        }
      });
    }else{ // 신규
      id = "product_" + Date.now();

      db.ref('product/' + id).set({
        product_company_id: $("#product-company-id").val(),
        product_category_id: $("#product-category-id").val(),
        product_id: id,
        product_user_id: $("#product-writer-id").val(),
        product_name: $("#product-name").val(),
        product_subtitle: $("#product-subtitle").val(),
        product_contents: $("#product-contents").val(),
        product_img: uploadFileName,
        product_release: typeDate,
        product_unique: $("#product-unique").val(),
        product_length: $("#product-length").val(),
        product_tag: $("#product-tag").val(),
        product_explanation: $("#product-explanation").val(),
        product_link: $("#product-link").val()
      });
    }
}


// 상단 도서, 주제, 출판사 버튼 선택시
var mngContents = document.getElementById('contents_area');
mngContents.addEventListener('click', function(e){

  if(e.target.classList.contains('addCategory')){
    uploadCategory();
  }else if(e.target.classList.contains('updateCategory')){
    uploadCategory($("#category-id").val());
    getListData("category");
  }else if(e.target.classList.contains('deleteCategory')){
    deleteDatabaseItem("category", $("#category-id").val());
    $("#contents_area").hide();
  }

  if(e.target.classList.contains('addProduct')){
    uploadProduct();
  }else if(e.target.classList.contains('updateProduct')){
    uploadProduct($("#product-id").val());
    getListData("product");
  }else if(e.target.classList.contains('deleteProduct')){
    deleteDatabaseItem("product", $("#product-id").val());
    $("#contents_area").hide();
  }

  if(e.target.classList.contains('addWriter')){
    uploadWriter();
  }else if(e.target.classList.contains('updateWriter')){
    uploadWriter($("#writer-id").val());
    // getListData("writer");
  }else if(e.target.classList.contains('deleteWriter')){
    deleteDatabaseItem("writer", $("#writer-id").val());
    $("#contents_area").hide();
  }
});

//선택된 메뉴의 리스트 클릭
var sidebar_list_area = document.getElementById('sidebar_list_area');
sidebar_list_area.addEventListener('click', function(e) {
  var target = e.target.parentNode.id;

  //-------------------------------------------------------- 구분 프로덕트 -- 상단 타이틀 클릭시 리스트 생성
  if (e.target.classList.contains('category')) {
    importListData("category", target);
  }else if (e.target.classList.contains('product')) {
    importListData("product", target);
  }else if (e.target.classList.contains('writer')) {
    importListData("writer", target);
    $("#mng_writer input").val("");
  }
});


//리스트 정보를 본문 으로
function importListData(target, listKey, location){
  var ref = db.ref('/'+target);
  var temp = new Object();

  $("#contents_area").show();
  ref.once('value').then(function(data){ // topic = addOptionMenu("company","topic");

  for( var key in data.val() ) {
    if(key == listKey){
      if(target == "category"){
        $("#mng_product").hide();
        $("#mng_category").show();
        $("#mng_writer").hide();
        categoryForm(data.val()[key].category_company_id, data.val()[key].category_name, "list",key);
      }if(target == "writer"){
        $("#mng_product").hide();
        $("#mng_category").hide();
        $("#mng_writer").show();
        writerForm(data.val()[key].writer_company_id, data.val()[key], "list",key);
      }else if(target == "product"){
        $("#mng_category").hide();
        $("#mng_product").show();
        $("#mng_writer").hide();
        var info = {
          company_id: data.val()[key].product_company_id,
          category_id:data.val()[key].product_category_id,
          user_id:data.val()[key].product_user_id,
          names:data.val()[key].product_name,
          subtitle:data.val()[key].product_subtitle,
          img:data.val()[key].product_img,
          release:data.val()[key].product_release,
          unique:data.val()[key].product_unique,
          lengths:data.val()[key].product_length,
          tag:data.val()[key].product_tag,
          explanation:data.val()[key].product_explanation,
          links:data.val()[key].product_link
        };
        productForm(info, "list", key);
      }
    }
  }
});
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
