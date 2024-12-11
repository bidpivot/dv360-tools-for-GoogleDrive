function getImageDimensions(fileId) {
  // fileId = '19i-RgV7dx2zVkQu8robUlmwI-zCHMEy8' // placeholder fileId
  const imgFile = DriveApp.getFileById(fileId);

  const imgBlob = imgFile.getBlob();
  const dims = ImgApp.getSize(imgBlob);

  console.log(dims.height);
  console.log(dims.width);

  const reqObj = {
    heightPixels: dims.height,
    widthPixels: dims.width,
  };

  console.log({ reqObj });

  // 'dims' example { identification: 'JPG', width: 320, height: 50, filesize: 21110 }
  // Return the dimensions as an object
  // if (reqObj.width && reqObj.height) {
  //   return reqObj
  // } else {
  //   console.log("Missing width or height")
  // }
  return reqObj;
}
