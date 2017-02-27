
var db = firebase.database();

$(document).ready(function() {

  var addr = location.href.split("/").pop();
  var addrValue = addr.split("?").pop();
  var id = addrValue.split("|");
  var company_id = id[0].split("=").pop();
  //좌측 select category 리스트
  try{

      $("#loadingData").show();
    //좌측 select category 리스트
    var temp = db.ref("/company/"+id[0].split("=").pop()).once('value').then(function(data){
      $("#company_name").text(data.val().company_name);
      $("#sideFooter>label").text(data.val().company_footer);
    }).then(function(){
      $("#loadingData").remove();
    });
  }catch(e){
    //주소 뒤 데이터 값이 없는경우 메인 페이지로
    location.href = '/main.html';
  }finally{
    importListData("product", id[1].split("=").pop()); //

    $(document).on("click", "#explorer", function(e){
      location.href = '/bookshelf/explorer.html'+"?company_id="+company_id;
    });
    //회사 이름 클릭시 회사 페이지로
    $(document).on("click", "#company_name", function(e){
      location.href = "/bookshelf.html?id="+company_id;
    });
  }

});

$(document).on("click","#prevBtn", function(){
  location.href = document.referrer;
});

function importListData(target, listKey){
  var ref = db.ref('/'+target);
  var temp = new Object();
  ref.once('value').then(function(data){ // topic = addOptionMenu("company","topic");
  for( var key in data.val() ) {
    if(key == listKey){
      //제품 이미지 클릭시
      if(target == "product"){
        productForm(data.val()[key]);
      }else if(target == "company"){
        $("#companyName").text(data.val()[key].company_name);
      }else if(target == "category"){
        $("#categoryName").text(data.val()[key].category_name);
      }
    }
  }
});
}


function viewImgs(imgUrl, data){

  var url = "http://s3.ap-northeast-2.amazonaws.com/js-example-bucket/img-file/";
  var imgViewer = "";
    var temp;
  if(imgUrl !== ""){
    var img =  imgUrl.split('|');
    for(var i = 0 ; i < img.length - 1; i++){
      var fileType = img[i].split('.').pop().toLowerCase();
      if(fileType == "jpg" || fileType == "png" || fileType == "gif" || fileType == "bmp" || fileType == "jpeg"){
        imgViewer += '<img class="img" src='+(url+img[i])+'>';
      }
    }
  }else{
    if(data.product_name){
      temp = data.product_name;
    }else if(data.writer_name){
      temp = data.writer_name;
    }
    imgViewer += '<div  class="img notingImg" >'+temp+'</div>';
  }

  return imgViewer;
}

$(document).on("click", "#item_writer", function(e){
  var offset = $("#contentSub").offset();
  console.log(offset);
  $('#contentWrap').animate({scrollTop : offset.top}, 400);
});

function productForm(data){
  importListData("company",data.product_company_id);
  importListData("category",data.product_category_id)

  $("#contents_img").html(viewImgs(data.product_img,data));
  var result = "<table id='product_info'>"+
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
  $("#item_intro").html(data.product_explanation);
  $("#item_contents").html(data.product_contents);
  $("#item_tag").html("tag : "+data.product_tag);
  $("#item_link").html("link : "+data.product_link);



  var ref = db.ref('/writer');
  var writerResult;
  ref.once('value').then(function(writer){
    writerResult = writer.val()[data.product_user_id];

    $("#item_writer").html("by " + writerResult.writer_name);
    $("#writer_name").html(writerResult.writer_name);
    $("#writer_email").html(writerResult.writer_email);
    $("#writer_intro").html(writerResult.writer_intro);
    $("#writer_img").html(viewImgs(writerResult.writer_img, writerResult));
  });


}
