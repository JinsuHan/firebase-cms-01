
// window.firebaseAuth = new firebaseAuth();

var db = firebase.database();

var $container = $('#list');

$(document).ready(function() {
  //좌측 select
  getDataLIst("category");

  //처음 전체 리스트 불러오기
  importListData("product", "all");
});
$(document).on("click",".category", function(){
  var target = $(this);
  animateListImg(target);
});

function animateListImg(target){
    $('#sideList .current').removeClass('current');
    target.addClass('current');

    $('#list>div').addClass('hideDiv');
    $(target.attr("data-filter")).removeClass('hideDiv');

    if(target.attr("data-filter") == "*"){
      // $("#list>div").show();
      $("#list>div").show();
      $( "#list>div>img" ).animate({
        width: 100,
        marginLeft: 10,
        marginRight: 10
      }, 500 );
    }else{
      $(target.attr("data-filter")).show();
      $(target.attr("data-filter")+">img" ).animate({
        width: 100,
        marginLeft: 10,
        marginRight: 10
      }, 500 );
      $( ".hideDiv>img" ).animate({
        width: 0,
        marginLeft: 0,
        marginRight: 0
      }, 500 ,function(){
        $(".hideDiv").hide();
      });
    }
}

function getDataLIst(target){
  $("#sideList").empty();

  var listRef = db.ref('/'+target);

  $(".company_addBtn").hide();

  $("#sideList").append("<li class='list-group-item'><div class='category listItem' data-filter='*'>전체</div></li>");
  //불러오기 // 전체 데이타
  listRef.on('child_added', function(data){
    var li = document.createElement('li');
    li.id = data.key;
    // li.setAttribute("data-filter", "."+data.val().category_name);
    if(target == "category"){
      li.innerHTML = "<div class= 'category listItem' data-filter="+"."+data.val().category_name+">"+data.val().category_name+"</div>";
    }

    $("#sideList").append(li);
    $("#sideList>li").addClass("list-group-item");
  });
}


function importListData(target, listKey){
  var ref = db.ref('/'+target);
  var temp = new Object();
  ref.once('value').then(function(data){ // topic = addOptionMenu("company","topic");
  for( var key in data.val() ) {
    if(listKey == "all"){
      //좌측 리스트 클릭시
      if(target == "product"){
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
          links:data.val()[key].product_link,
          key:data.val()[key].product_id
        };
        createImgList(info);
      }
    }else if(key == listKey){
      //제품 이미지 클릭시
      if(target == "product"){
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
          links:data.val()[key].product_link,
          key:data.val()[key].product_id
        };
        productForm(info);
      }else if(target == "company"){
        console.log(data.val()[key].company_name);
        $("#companyName").text(data.val()[key].company_name);
      }else if(target == "category"){
        console.log(data.val()[key].category_name);
        $("#categoryName").text(data.val()[key].category_name);
      }
    }
  }
});
}
function loadData(){
  $("#loadingData").show();
}

$(document).on("click", "img", function(e){
  console.log(e.target.id);
  importListData("product", e.target.id);
  $("body").append(loadData());
  setTimeout(function(){ $("#loadingData").hide();}, 500);
});

function viewImgs(imgUrl, data){
  var url = "http://s3.ap-northeast-2.amazonaws.com/js-example-bucket/img-file/";
  var imgViewer = "";
  if(imgUrl !== ""){
    var img =  imgUrl.split('|');
    for(var i = 0 ; i < img.length - 1; i++){
      var fileType = img[i].split('.').pop().toLowerCase();
      if(fileType == "jpg" || fileType == "png" || fileType == "gif" || fileType == "bmp" || fileType == "jpeg"){
        imgViewer += '<img id='+data.key+' class="img" src='+(url+img[i])+'>';
      }
    }
  }

  return imgViewer;
}

function createImgList(data){
  console.log(data);

  var result = viewImgs(data.img, data);
  var temp = document.createElement('div');
  var posts = document.getElementById('list');

  var listRef = db.ref('/category');

  listRef.once('value').then(function(cdata){
    console.log(cdata.val()[data.category_id].category_name);
    temp.className = cdata.val()[data.category_id].category_name;
  });

  temp.id = data.key;
  // temp.className = data.category_id;
  temp.innerHTML = result;

  posts.appendChild(temp);
}

function productForm(data){
  importListData("company",data.company_id);
  importListData("category",data.category_id)
  var result = `<table >
    <tr>
      <td rowspan="4" width="70px">${viewImgs(data.img,data.key)}</td>
      <td width="100px" height="45px">도서명</td>
      <td width="150px" >${data.names}</td>
      <td width="100px">출시일</td>
      <td width="150px">${data.release}</td>
      <td width="100px">길이</td>
      <td width="100px">${data.lengths}</td>
    </tr>
    <tr>
      <td height="45px">출판사</td>
      <td id="companyName"></td>
      <td>고유번호</td>
      <td>${data.unique}</td>
      <td>태그</td>
      <td>${data.lengths}</td>
    </tr>
    <tr>
      <td height="45px">작가명</td>
      <td>${data.user_id}</td>
      <td>부제</td>
      <td>${data.subtitle}</td>
      <td>링크</td>
      <td>${data.links}</td>
    </tr>
    <tr>
      <td height="45px">구분명</td>
      <td id="categoryName"></td>
      <td>설명</td>
      <td colspan="3">${data.explanation}</td>
    </tr>
  </table>`;
  var temp = document.createElement('div');
  var posts = document.getElementById('imageInfo');
  $("#imageInfo").empty();
  temp.id = data.key;
  temp.innerHTML = result;

  posts.appendChild(temp);
}
