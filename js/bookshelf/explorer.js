
var db = firebase.database();
var company_id;
var $container;
$(document).ready(function() {

 var addr, company_id;

  try{
    addr = location.href.split("/").pop().split("?");
    company_id = addr[1].split("=").pop();

}catch(e){
  company_id = "company_1479100778585";
}finally{
  db.ref("/company/"+company_id).once('value').then(function(data){
    $("#company_name").text(data.val().company_name);
    $("#sideFooter>label").text(data.val().company_footer);
  }).then(function(){$("#loadingData").hide();});

  //좌측 select category 리스트
  getDataList("category");

  //처음 전체 리스트 불러오기
  importListData("product", "all", company_id);

//이미지 클릭시 상새 페이지로
  $(document).on("click", ".img", function(e){
    location.href = '/bookshelf/show.html'+"?company_id="+company_id+"|product_id="+e.target.id;
  });
  //회사 이름 클릭시 회사 페이지로
  $(document).on("click", "#company_name", function(e){
    location.href = "/bookshelf.html?id="+company_id;
  });

}
});

function callIsotope(){
    $container = $('#list');
    $container.isotope({
        filter: '*',
        animationOptions: {
            duration: 750,
            easing: 'linear',
            queue: false
        }
    });
}

$("#bookSearch").focus(function() {
    $(".listItem").removeClass("current");
});


$(document).on("keypress", "#bookSearch", function(e){
  if(e.keyCode == 13){
    var input = $("#bookSearch").val();

    $container.isotope({ filter: function() {
      var name = $(this).find('.name').text();

      return name.match(input);
    }});
  }
});

$(document).on("click","#prevBtn", function(){
  location.href = document.referrer;
});

$(document).on("click",".category", function(){
  var target = $(this);

  $('#sideList li div ').removeClass('current');
  $(this).addClass('current');

  var selector = $(this).attr('data-filter');

  $container.isotope({
    filter: selector,
    animationOptions: {
      duration: 750,
      easing: 'linear',
      queue: false
    }
  });
  return false;
});

function getDataList(target){
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


function importListData(target, listKey, companyId){
  var ref = db.ref('/'+target);
  var temp = new Object();
  ref.once('value').then(function(data){ // topic = addOptionMenu("company","topic");
  for( var key in data.val() ) {

      //좌측 리스트 클릭시
      if(data.val()[key].product_company_id == companyId){
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

  }
});

}


function viewImgs(imgUrl, data){
  var url = "http://s3.ap-northeast-2.amazonaws.com/js-example-bucket/img-file/";
  var imgViewer = "";
  var tempName = "";
  if(imgUrl !== ""){
    var img =  imgUrl.split('|');
    for(var i = 0 ; i < img.length - 1; i++){
      var fileType = img[i].split('.').pop().toLowerCase();
      if(fileType == "jpg" || fileType == "png" || fileType == "gif" || fileType == "bmp" || fileType == "jpeg"){
        imgViewer += '<img id='+data.key+' class="img" src='+(url+img[i])+'>';
        imgViewer += '<div class="name" hidden>'+data.names+'</div>'
      }
    }
  }else{
    imgViewer += '<div id='+data.key+' class="img notingImg" >'+data.names+'</div>';
    imgViewer += '<div class="name" hidden>'+data.names+'</div>'
  }

  return imgViewer;
}

function createImgList(data){

  var result = viewImgs(data.img, data);
  var temp = document.createElement('div');
  var posts = document.getElementById('list');

  var listRef = db.ref('/category');
  listRef.once('value').then(function(cdata){
    temp.className = cdata.val()[data.category_id].category_name;

    callIsotope();
  });

  temp.id = data.key;
  temp.innerHTML = result;

  posts.appendChild(temp);
}
