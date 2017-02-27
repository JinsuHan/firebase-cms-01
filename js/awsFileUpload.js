

function awsS3FileUpload(files){
  var params = [];
  var result = "";

  for(var i in files){
    var tempFileName = Date.now()+"_"+ i +"_"+files[i].name;
    params.push({
      Key: 'img-file/' + tempFileName, // 저장 경로, 파일명
      ContentType: files[i].type, // 파일 타입
      Body: files[i], // 파일 본문
      ACL: 'public-read' // 접근 권한
    });
    result += tempFileName + "|";
  }
  for(var i in params){
    // 파일 업로드
    bucket.putObject(params[i], function (err, data) {
      if(err){
        console.log(err);
      }else{
        console.log("업로드 성공");
      }
    });
  }

  return result;
}
function awsS3FileDelete(imgUrl){

  var files =  imgUrl.split('|');
  for(var i = 0 ; i < files.length - 1; i++){
    bucket.deleteObject({
      Key : 'img-file/' + files[i]
    }, function(err, result){
      console.log(err, result);
    });
  }
}
