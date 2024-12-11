function postAssetChunked(
  row: Interfaces.CreativeRow
): Interfaces.AssetApiResponse {
  console.log("Row data for uploadAsset Function: ", row);
  const advertiserId = row["Advertiser ID"]; // validate this as a string
  const fileId = row["File ID"];
  console.log("Defining file from DriveApp with fileId");
  const file = DriveApp.getFileById(fileId);
  console.log("getting file size....");
  const fileSize = file.getSize();
  console.log("File Size: ", HelperFunction.formatBytes(fileSize));
  console.log("getting file as blob...");
  const fileBlob = file.getBlob(); // Get the file blob from Google Drive
  console.log("Content type of file to be posted: ", fileBlob.getContentType());

  const url =
    "https://displayvideo.googleapis.com/upload/v3/advertisers/" +
    advertiserId +
    "/assets?uploadType=resumable";

  const headers = {
    "Authorization": "Bearer " + getOAuthService().getAccessToken(),
    "Content-Type": "application/json; charset=UTF-8",
    "X-Upload-Content-Type":
      fileBlob.getContentType() || "application/octet-stream",
    "X-Upload-Content-Length": fileSize.toString(),
  };

  // Create the metadata (JSON) part of the form-data
  const metadata = {
    filename: fileBlob.getName(), // Ensure the filename includes the file extension (e.g., 'image.jpg')
  };

  // Initialize the resumable upload session
  const initOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    headers: headers,
    payload: JSON.stringify(metadata),
    muteHttpExceptions: true,
  };

  const initResponse = UrlFetchApp.fetch(url, initOptions);
  console.log({ initResponse });
  const uploadUrl = initResponse.getHeaders()["Location"];

  // Log the response status code and content
  console.log("Init Response Code: " + initResponse.getResponseCode());
  console.log("Upload URL: " + uploadUrl);

  // Send the file in chunks
  const chunkSize = 11 * 1024 * 1024; // 11 MB per chunk
  const fileBytes = fileBlob.getBytes();
  let start = 0;
  let end = chunkSize;
  let chunkNumber = 1;

  while (start < fileSize) {
    const chunk = fileBytes.slice(start, end);
    const chunkHeaders = {
      "Authorization": "Bearer " + getOAuthService().getAccessToken(),
      "Content-Type": fileBlob.getContentType(),
      "Content-Range": `bytes ${start}-${end - 1}/${fileSize}`,
    };

    const chunkOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: "put", // note: not a post
      headers: chunkHeaders,
      payload: chunk,
      muteHttpExceptions: true,
    };

    const chunkResponse = UrlFetchApp.fetch(uploadUrl, chunkOptions);

    // Log the response status code and content
    console.log(
      `Chunk round ${chunkNumber} Response code: ${chunkResponse.getResponseCode()}`
    );
    console.log(
      `Chunk round ${chunkNumber} Response text: ${chunkResponse.getContentText()}`
    );

    start = end;
    end = Math.min(start + chunkSize, fileSize);
    chunkNumber++;
  }

  const finalResponse = UrlFetchApp.fetch(uploadUrl, {
    method: "put",
    headers: {
      "Authorization": "Bearer " + getOAuthService().getAccessToken(),
      "Content-Range": `bytes */${fileSize}`,
    },
    muteHttpExceptions: true,
  });

  const assetResponse = JSON.parse(finalResponse.getContentText());
  console.log("Final Asset Response: " + JSON.stringify(assetResponse));

  return assetResponse;
}
