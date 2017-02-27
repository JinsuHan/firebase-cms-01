
var selectedCompany = null;

$(document).ready(function() {


  $("#loadingData").show();

  var ref = db.ref('/user');
  ref.once('value').then(function(data){
    selectedCompany = data.val()["user_"+user.uid].user_company;
  }).then(function(){
    $("#loadingData").hide();
  });


  //출판사, 체크박스
  $(document).on("click",".company_productItem",function(e){

    var sum = 0;
    $("input[name='productList']").each(function(i){
      if($("input[name='productList']").eq(i).is(":checked")){
        sum++;
      }
    });

  // 체크박스가 4개까지만 선택 되도록
    if(sum <= 3){
      if($(this).children("input").attr("checked")){
        $(this).children("input").removeAttr("checked");
      }else{
        $(this).children("input").attr("checked", "checked");
      }
    }else{
      $(this).children("input").removeAttr("checked");
    }
  });

});

//도서-> 도서, 제품 선택시

$(document).on("click","#company", function(){
  importListData("company", selectedCompany);
});


//select의 option 생성
function getDatabase(target, type , number, another){
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
      if(type == "company"){
        if(temp.product_company_id == number){
            var check = "";
            for(var i in another){
              if(another[i] == temp.product_id){
                check = "checked";
              }
            }
          $("#company_booklist").append("<div class='company_productItem'>"
          +"<div class='company_productName' >"+temp.product_name+"</div>"
          +"<input name='productList' id="+temp.product_id+" type='checkbox'"+check+" /></div>");
        }

      }
    }
  });
}

//리스트 클릭시 정보를 우측 본문에 표시
function companyForm(data, key){

  $("#targetName").text(data.company_name);


  $("#company-id").val(key);
  $("#company-intro").val(data.company_intro);
  $("#company-info").val(data.company_info);
  $("#company-footer").val(data.company_footer);
  var result = "";
  if(data.company_img){
    result = data.company_img.split("|")[0];
  }
  $("#company-selectImg").text(result);
  $("#company_booklist").empty();

  getDatabase("product", "company", key, data.company_best);
}

// 회사 정보 업데이트
function uploadCompany(key){
  var companyName = $("#company-id").val();
  var companyIntro = $("#company-intro").val();
  var companyInfo = $("#company-info").val();
  var companyFooter = $("#company-footer").val();
  var companySelectImg = $("#company-selectImg").text();

  if (!companyName) return null;

//우측 물품 체크리스트 가져오기. 제품의 id 값
var checkList = [];
  $("input[name='productList']:checked").each(function(i){
    checkList.push($("input[name='productList']:checked")[i].id);
  });

  var fileListArray = [];
  var uploadFileName = "";
  if($("#company-img").get(0).files[0]){
    fileListArray.push($("#company-img").get(0).files[0]);
    //이미지 주소를 리턴하고 리턴되는 값을 글 쓸때 같이 저장. 없으면 없는거고
    if(fileListArray[0]){
      uploadFileName = awsS3FileUpload(fileListArray);
        if(companySelectImg){
          awsS3FileDelete(companySelectImg + "|");
        }
    }
  }else{
    if(companySelectImg){
      uploadFileName = companySelectImg + "|";
    }
  }
  //이전 이미지 존재 여부, 교체 이미지 존재 여부 등을 따져서 선택

  db.ref('company/' + key).update({
    company_img: uploadFileName,
    company_intro: companyIntro,
    company_info: companyInfo,
    company_footer: companyFooter,
    company_best: checkList
  }).then(function(d){
    $("#company-img").val("");

    importListData("company", companyName);
  });
}

//수정 버튼 클릭시
$(document).on("click",".updateCompany", function(){
    uploadCompany($("#company-id").val());
});


function importListData(target, listKey, location){
  var ref = db.ref('/'+target+'/'+listKey);
  var temp = new Object();

  $("#contents_area_full").show();
  ref.once('value').then(function(data){ // topic = addOptionMenu("company","topic");
        $("#mng_company").show();
        companyForm(data.val(), listKey);
});
}
