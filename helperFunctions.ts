namespace HelperFunction {
  export function getImageDimensions(fileId: string) {
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

  export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  export function validatestringstartingchars(
    startswith: string,
    value: string
  ): boolean {
    return value.startsWith(startswith);
  }
}
