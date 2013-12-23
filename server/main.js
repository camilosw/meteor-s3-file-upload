var crypto = Npm.require('crypto');

S3_KEY = 'S3 KEY';
S3_SECRET = 'S3 SECRET';
S3_BUCKET = '/bucket-name';
 
EXPIRE_TIME = (60 * 60 * 24); // 24 hours
S3_URL = 'http://s3.amazonaws.com';

Meteor.methods({
  signedUrl: function (objectName, mimeType) {
    objectName = "/" + objectName;
    var expires = Math.round(Date.now() / 1000) + EXPIRE_TIME;
    var amzHeaders = "x-amz-acl:public-read";
    var stringToSign  = "PUT\n\n" + mimeType + "\n";
        stringToSign += expires + "\n" + amzHeaders + "\n";
        stringToSign += S3_BUCKET + objectName;
    var signature = crypto.createHmac("sha1", S3_SECRET).update(stringToSign).digest("base64");
    signature = encodeURIComponent(signature);
    
    var url  = S3_URL + S3_BUCKET + objectName;
        url += "?AWSAccessKeyId=" + S3_KEY;
        url += "&Expires=" + expires;
        url += "&Signature=" + signature;
    url = encodeURIComponent(url);
    return url;
  }
});