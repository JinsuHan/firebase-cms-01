
// firebase config

var config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  storageBucket: "",
  messagingSenderId: ""
};
firebase.initializeApp(config);

// aws s3 config

AWS.config.update({
  accessKeyId: "",
  secretAccessKey: ""
});

var bucket = new AWS.S3({
  region: '',
  params: {
    Bucket: ''
  }
});
