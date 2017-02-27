
var db = firebase.database();

$(document).ready(function() {
  var addr,  company_id;

  try{
    $("#loadingData").show();
    addr = location.href.split("/").pop().split("?");
    company_id = addr[1].split("=").pop();
  }catch(e){
    company_id = "company_1479100778585";

  }finally{
    var url = "http://s3.ap-northeast-2.amazonaws.com/js-example-bucket/img-file/"
    var imgViewer = "";

    db.ref("/company/"+company_id).once('value').then(function(data){
      $("#company_name").text(data.val().company_name);
      $("#intro").html(data.val().company_intro);
      $("#info").html(data.val().company_info);
      $("#sideFooter>label").text(data.val().company_footer);
      var imgUrl = data.val().company_img;
      if(imgUrl != ""){
        var img =  imgUrl.split('|');
        for(var i = 0 ; i < img.length - 1; i++){
          var fileType = img[i].split('.').pop().toLowerCase();
          if(fileType == "jpg" || fileType == "png" || fileType == "gif" || fileType == "bmp" || fileType == "jpeg"){
            imgViewer += '<img id="companyImg" src='+(url+img[i])+'>';
          }else{
            imgViewer += '<div class="doc"><a href="'+(url+img[i])+'" download>'
            +img[i].split('_')[2]+'</a></div>';
          }
        }
      }
      if(data.val().company_best){
        importListData(company_id, "listByBest", data.val().company_best);
      }
      $("#logo").html(imgViewer);
    });


    //처음 전체 리스트 불러오기
    importListData(company_id, "listByNew");

    $(document).on("click", ".img", function(e){
      if(window.innerWidth > 400){
        location.href = '/bookshelf/show.html'+"?company_id="+company_id+"|product_id="+e.target.id;
      }else{
        //여기서 show 페이지 로드
        $("#loadingData").show();
        $("#bottomContents").hide();
        $("#bottomContentsCategory").show();


        $("#categoryForm").hide();
        $("#categoryItem").hide();
        $("#showItemInfo").show();

          var ref = db.ref('/product');
          var temp = new Object();
          var showCategoryName;
          var showCompanyName;
          ref.once('value').then(function(data){ // topic = addOptionMenu("company","topic");
          for( var key in data.val() ) {
            if(key == e.target.id){
              productForm(data.val()[key]);
              showCategoryName = data.val()[key].product_category_id;
              showCompanyName = data.val()[key].product_company_id;
            }
          }
        }).then(function(){
          var categoryRef = db.ref('/category');
          categoryRef.once('value').then(function(data){ // topic = addOptionMenu("company","topic");
          for( var key in data.val() ) {
            if(key == showCategoryName){
              $("#categoryName").text(data.val()[key].category_name);
            }
          }
        });
          var companyRef = db.ref('/company');
          companyRef.once('value').then(function(data){ // topic = addOptionMenu("company","topic");
          for( var key in data.val() ){
            if(key == showCompanyName){
              $("#companyName").text(data.val()[key].company_name);
            }
          }
        });
    }).then(function(){
      $("#loadingData").hide();
    });
  }
});
    $(document).on("click", "#explorer", function(e){
      location.href = '/bookshelf/explorer.html'+"?company_id="+company_id;
    });
  }

// 상단 카테고리 버튼 클릭시
  $(document).on("click","#select",function(){
    $("#loadingData").show();
    // $("#bottomContents").toggle();
    // $("#bottomContentsCategory").toggle();

    $("#categoryForm").show();
    $("#categoryItem").hide();
    $("#showItemInfo").hide();

    if($("#select").hasClass("selectBtn")){
      $("#bottomContents").show();
      $("#bottomContentsCategory").hide();
      $("#select").removeClass("selectBtn");
      $("#select").css("background-color","#1ab394");
    }else{
      $("#select").addClass("selectBtn");
        $("#bottomContents").hide();
        $("#bottomContentsCategory").show();
      $("#select").css("background-color","#3cD5B6");
    }
    getListData("category");
  });
  $(document).on("click", "#previous", function(){
    $("#loadingData").show();
    $("#bottomContents").hide();
    $("#bottomContentsCategory").show();
    $("#categoryForm").show();
    $("#categoryItem").hide();
    $("#showItemInfo").hide();
    $("#select").show();
    $("#previous").hide();
    getListData("category");
  });
  $(document).on("click","#search", function(){
    $("#searchInput").toggle();
    if($("#search").hasClass("selectBtn")){
      $("#search").removeClass("selectBtn");
      $("#search").css("background-color","#1ab394");
    }else{
      $("#search").addClass("selectBtn");
      $("#search").css("background-color","#3cD5B6");
    }
  });
  $(document).on("click","#searchBtn",function(){
    var input = $("#searchValue").val();
    if(input){
      $("#loadingData").show();
      $("#searchValue").val("");
      $("#searchInput").toggle();

      $("#bottomContents").hide();
      $("#bottomContentsCategory").show();
      $("#categoryForm").hide();
      $("#categoryItem").show();
      $("#showItemInfo").hide();

      $("#categoryItemList").empty();

      var count = 0;
      var temp;
      var ref = db.ref('/product');
      ref.once('value').then(function(data){
        for( var key in data.val() ) {
          temp = data.val()[key].product_name;
          if(temp.match(input)){
            count++;
            createImgList(data.val()[key], key, "categoryItemList");
          }
        }
      }).then(function(){
        $("#categoryItemHeader").text("총 "+count+"개의 서적이 검색되었습니다.");
        $("#loadingData").hide();
      })
    }
  });

//카테고리 선택시
  $(document).on("click","#categoryList>div", function(e){
    $("#loadingData").show();

    $("#previous").show();
    $("#categoryForm").hide();
    $("#categoryItem").show();
    $("#showItemInfo").hide();
    $("#select").hide();
    $("#categoryItemList").empty();

    var result = "";
    db.ref('/category').once('value').then(function(data){
      for(var key in data.val()){
        if(key == e.target.id){
          result = data.val()[key].category_name;
          break;
        }else{
          result = "전체";
        }
      }
    }).then(function(){
      $("#previous").text(result);
      var count = 0;
      db.ref('/product').once('value').then(function(data){
        for( var key in data.val() ) {
          if(data.val()[key].product_category_id == e.target.id || e.target.id == "allData"){
            count++;
          }
        }
      }).then(function(){
        $("#categoryItemHeader").text("총 "+count+"개의 "+result+" 서적이 있습니다.");
        $("#loadingData").hide();
      });
    });

    importListData(company_id, "categoryItemList", e.target.id);
  });
});

function productForm(data){

  importListData("company",data.product_company_id);
  importListData("category",data.product_category_id)

  $("#contents_img").html(viewImgs(data.product_img,data));
  var result = "<table>"+
  "<tr>"+
    "<td class='td01'>출판사</td>"+
    "<td id='companyName' class='td02'></td>"+
  "</tr>"+
  "<tr>"+
    "<td >출시일</td>"+
    "<td >"+data.product_release+"</td>"+
  "</tr>"+
  "<tr>"+
    "<td >길이</td>"+
    "<td>"+data.product_length+"</td>"+
  "</tr>"+
  "<tr>"+
    "<td >구분명</td>"+
    "<td id='categoryName'></td>"+
  "</tr>"+
  "<tr>"+
    "<td >고유번호</td>"+
    "<td>"+data.product_unique+"</td>"+
  "</tr>"+
  "</table>";
  $("#contents_infoTable").html(result);

  $("#item_title").html(data.product_name);
  $("#item_subtitle").html(data.product_subtitle);

  var ref = db.ref('/writer');
  ref.once('value').then(function(writer){
    $("#item_writer").html("by " + writer.val()[data.product_user_id].writer_name +" <br/> 설명 : "+writer.val()[data.product_user_id].writer_intro);
  });
  $("#item_intro").html(data.product_contents);
  $("#item_contents").html(data.product_explanation);
  $("#item_tag").html("tag : "+data.product_tag);
  $("#item_link").html("link : "+data.product_link);

}

function getListData(target){
  //mobilePage 용 카테고리 리스트 불러오기
  $("#categoryList").empty();

  var listRef = db.ref('/'+target);

  $(".company_addBtn").hide();
  var countFull = 0;
  var countRef = db.ref('/product');
  countRef.once('value').then(function(data){
    for( var key in data.val() ) {
      countFull++;
    }
  }).then(function(){
    $("#categoryList").append("<div class='category listItem' id='allData' data-filter='*'>전체 ("+countFull+") </div>");
  }).then(function(){
    //불러오기 // 전체 데이타
    listRef.on('child_added', function(data){
      var listItem;
      var count = 0;
      countRef.once('value').then(function(cdata){
        for( var key in cdata.val() ) {
          if(cdata.val()[key].product_category_id == data.key){
            count++;
          }
        }
      }).then(function(){
        if(target == "category"){
          listItem = "<div class= 'category listItem' id='"+data.val().category_id+"' data-filter="+"."+data.val().category_name+">"+data.val().category_name+" ("+count+") "+"</div>";
        }
        $("#categoryList").append(listItem);
      }).then(function(){
        $("#loadingData").hide();
      });
    });

  });

}

function importListData(companyId, target, value){
  var  ref = db.ref('/product');
  if(target =="listByNew"){
    ref = db.ref('/product').limitToLast(4);
  }else if(target == "listByBest"){
  }else{
  }

  var temp = new Object();
  ref.once('value').then(function(data){ // topic = addOptionMenu("company","topic");

  for( var key in data.val() ) {
    if(data.val()[key].product_company_id == companyId){
      if(target == "categoryItemList"){
        if(value == "allData"){
          createImgList(data.val()[key], key, target);
        }else if(data.val()[key].product_category_id == value){
          createImgList(data.val()[key], key, target);
        }
      }else if(value){
        for(var i in value){
            if(value[i] == data.val()[key].product_id){
                createImgList(data.val()[key], key, target);
            }
        }
      }else if(target == "listByNew"){
        createImgList(data.val()[key], key, target);
      }
    }
  }
}).then(function(){
  $("#loadingData").hide();
});
}


function createImgList(data, key, target){

  var result = viewImgs(data.product_img, data);
  var temp = document.createElement('div');
  var posts = document.getElementById(target);

  temp.id = key;
  temp.innerHTML = result;
  posts.appendChild(temp);
}

function viewImgs(imgUrl, data){
  var url = "http://s3.ap-northeast-2.amazonaws.com/js-example-bucket/img-file/";
  var imgViewer = "";
  if(imgUrl !== ""){
    var img =  imgUrl.split('|');
    for(var i = 0 ; i < img.length - 1; i++){
      var fileType = img[i].split('.').pop().toLowerCase();
      if(fileType == "jpg" || fileType == "png" || fileType == "gif" || fileType == "bmp" || fileType == "jpeg"){
        imgViewer += '<img id='+data.product_id+' class="img" src='+(url+img[i])+'>';
      }
    }
  }else{
    imgViewer += '<div id='+data.product_id+' class="img notingImg" >'+data.product_name+'</div>';
  }

  return imgViewer;
}
