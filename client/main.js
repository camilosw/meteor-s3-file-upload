Template.main.events({
  'change #files' : function (e, tmpl) {
    e.preventDefault();
    handleFileSelect(e);
  }
});

function handleFileSelect(evt) 
{
  setProgress(0, 'Upload started.');
 
  var files = evt.target.files; 
 
  var output = [];
  for (var i = 0, f; f = files[i]; i++) 
  {
    uploadFile(f);
  }
}

function setProgress(percent, statusLabel)
{
  var progress = document.querySelector('.percent');
  progress.style.width = percent + '%';
  progress.textContent = percent + '%';
  document.getElementById('progress_bar').className = 'loading';
 
  document.getElementById('status').innerText = statusLabel;
}

function uploadFile(file)
{
  executeOnSignedUrl(file, function(signedURL) 
  {
    uploadToS3(file, signedURL);
  });
}

function executeOnSignedUrl(file, callback)
{
  Meteor.call('signedUrl', file.name, file.type, function(error, result) {
    console.log(error);
    console.log(result);
    callback(decodeURIComponent(result))
  });
}

function uploadToS3(file, url)
{
  var xhr = createCORSRequest('PUT', url);
  if (!xhr) 
  {
    setProgress(0, 'CORS not supported');
  }
  else
  {
    xhr.onload = function() 
    {
      if(xhr.status == 200)
      {
        setProgress(100, 'Upload completed.');
      }
      else
      {
        setProgress(0, 'Upload error: ' + xhr.status);
      }
    };
 
    xhr.onerror = function(e) 
    {
      setProgress(0, 'XHR error.');
    };
 
    xhr.upload.onprogress = function(e) 
    {
      if (e.lengthComputable) 
      {
        var percentLoaded = Math.round((e.loaded / e.total) * 100);
        setProgress(percentLoaded, percentLoaded == 100 ? 'Finalizing.' : 'Uploading.');
      }
    };
 
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
 
    xhr.send(file);
  }
}

function createCORSRequest(method, url) 
{
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) 
  {
    xhr.open(method, url, true);
  } 
  else if (typeof XDomainRequest != "undefined") 
  {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } 
  else
  {
    xhr = null;
  }
  return xhr;
}