// PSEUDO CODE
// run iteration through each row of spreadsheet excluding header row / column names
//  convert row data into object called 'row'
//  run assetUpload function using the 'row' obj as an arg
//  insert returned 'mediaId' from assetUpload call into last column of the row
//  if there is no mediaId, then continue and add appropriate error message to message column of that row
//  pass row obj with its new mediaId to createCreativeTyped function as argument
//  add 'DV360 Creative ID' and response message to spreadsheet in corresponding columns for each row which represents a creative

// TO DO:
// build out pre-built reports templates that the user can import into the sheet with a dropdown call
// pacing; publishers, performance pivot report
// adjust api call to include native ad format
// make sure there aren't any errors that are still not handled

function masterPostCreativeLogic(id = "") {
  const ui = SpreadsheetApp.getUi();
  const spreadsheet =
    id === "" ? SpreadsheetApp.getActive() : SpreadsheetApp.openById(id);
  console.log("Active SpreadsheetId", spreadsheet.getId());

  // Display an alert message to the user
  ui.alert(
    "Please do not edit or click away from this tab while the sheet is uploading. \n\nPress 'ok' and the upload process will begin."
  );

  // Display a toast message
  spreadsheet.toast(
    "The post process is underway. Please do not edit this sheet or close this window until it's compeleted.  You may use other applications.",
    "Processing",
    -1
  );

  const sheet =
    spreadsheet.getActiveSheet() as GoogleAppsScript.Spreadsheet.Sheet;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // this code below maps the 2-d array of values into an array of objects to make it easy to manage, more like a dataframe
  const rows = data.slice(1).map(row => {
    return headers.reduce((acc, header, index) => {
      acc[header] = row[index];
      return acc;
    }, {}); // using reduce but you start with an object instead of integer for sums and products
  });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let mediaId;
    let creativeId = row["DV360 Creative ID"];

    try {
      // try catch block for the uploadAssetTyped and createCreativeTyped functions combined
      console.log("starting iteration through row ", i);

      if (!row["Media ID"] || row["Media ID"] === "") {
        console.log("calling uploadAssetTyped(row)");
        try {
          // check to make sure user has provided all information
          const validation = validateRow(row);
          if (validation) {
            throw new Error(validation);
          }

          // check the size of the file, if it's larger than 10mb, send it with chunked api post
          let assetResponse;
          const tooBig = checkFileSize(row); // tooBig means that it's greater than 10MB
          if (tooBig) {
            // if it's greater than 6MB, send it chunked
            console.log("Sending asset with chunked api post");
            assetResponse = postAssetChunked(row);
          } else {
            console.log("Posting asset in a single api call");
            assetResponse = uploadAssetTyped(row);
          }

          mediaId = assetResponse.asset.mediaId;
          console.log({ mediaId });

          if (!mediaId) {
            throw new Error("Failed to upload asset file through API");
          }
          row["Media ID"] = mediaId;
        } catch (error) {
          console.log("general error: ", error);
          row[
            "Status Message"
          ] = `General error: ${UserInteraction.getErrorMessage(error)}`;
          updateRowTyped(row, headers, sheet, i + 2);
          continue; // Skip to the next row
        }
      } else {
        console.log(
          `Media ID already exists: (${row["Media ID"]}), skipping uploadAssetTyped call.`
        );
      }
      if (!row["DV360 Creative ID"] || row["DV360 Creative ID"] === "") {
        try {
          console.log("calling createCreativeTyped(row)");
          // this is the 2nd try block that wraps the creativeCreative enity function
          // add in logic to skip this call if the creativeId already exists
          const creativeResponse = createCreativeTyped(row);
          creativeId = extractCreativeIdTyped(creativeResponse);
          row["DV360 Creative ID"] = creativeId;
          row["Status Message"] = "Successful upload";
        } catch (error) {
          row[
            "Status Message"
          ] = `General error: ${UserInteraction.getErrorMessage(error)}`;
        }
      } else {
        row[
          "Status Message"
        ] = `CreativeId already existed (${creativeId}). No action taken on this row`;

        console.log(
          `CreativeId already exists: (${creativeId}). Skipping createCreative`
        );
      }
    } catch (error) {
      row["Status Message"] = `General error: ${UserInteraction.getErrorMessage(
        error
      )}`;
    }

    updateRowTyped(row, headers, sheet, i + 2);
  }

  ui.alert("Script has finished running. You can now edit the sheet.");
  spreadsheet.toast("Script has finished running.", "Completed", 5);

  console.log("Reached end of creative upload script");
}

function updateRowTyped(
  row: any[],
  headers: any[],
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  rowIndex: number
) {
  const updatedRow = headers.map(header => row[header]);
  sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
}

function createCreativeTyped(
  row: Interfaces.CreativeRow
): Interfaces.CreativeApiResponse {
  console.log("creativeRow: ", row);
  const creativeType = UserInteraction.creativeTypeMap[row["Type"]]; // inserts the type based on what the user puts in the column
  const advertiserId = row["Advertiser ID"];
  const fileName = row["File Name"];
  const landingPage = row["Landing Page"]; // need to validate that this is https:// site
  const mediaId = row["Media ID"];
  let creativeRequestBody:
    | Interfaces.VideoCreativeObj
    | Interfaces.ImageCreativeObj = {
    displayName: fileName,
    creativeType: "CREATIVE_TYPE_VIDEO",
    hostingSource: "HOSTING_SOURCE_HOSTED",
    assets: [
      {
        asset: { mediaId: mediaId }, //this mediaId was returned from the uploadAsset function which was step 1
        role: "ASSET_ROLE_MAIN",
      },
    ],
    entityStatus: "ENTITY_STATUS_ACTIVE",
    exitEvents: [
      {
        name: "Default Exit",
        type: "EXIT_EVENT_TYPE_DEFAULT",
        url: landingPage,
      },
    ],
  };

  // if creativeType is 'audio', then set the creativeType to "CREATIVE_TYPE_AUDIO"
  if (row["Type"] === "audio") {
    creativeRequestBody.creativeType = "CREATIVE_TYPE_AUDIO";
  }

  // if creativeType is 'display', then generate ImageCreativeObj
  if (row["Type"] === "display") {
    const dimensions = HelperFunction.getImageDimensions(row["File ID"]);
    if (!dimensions) {
      console.log("Missing Dimensions");
      console.log(dimensions);
      throw new Error("Unable to find dimensions of the image");
    }
    creativeRequestBody = Interfaces.generateImageObj(
      creativeRequestBody,
      dimensions
    );
  }

  console.log("creative request body to fetch call: ", creativeRequestBody);

  const response = UrlFetchApp.fetch(
    "https://displayvideo.googleapis.com/v3/advertisers/" +
      advertiserId +
      "/creatives",
    {
      method: "post",
      headers: {
        Authorization: "Bearer " + getOAuthService().getAccessToken(),
      },
      payload: JSON.stringify(creativeRequestBody),
      contentType: "application/json",
    }
  );

  // Logger.log("Creative created: " + response.getContentText());

  // if you get a 200 response, return the creativeId which will be used to insert into the corresponding column in the spreadsheet
  // otherwise return null
  const parsedResponse = JSON.parse(response.getContentText()); // you need to parse the response from a string to start traversing the response object
  console.log("parsedResponse: ", parsedResponse);
  const creativeId = parsedResponse.creativeId;
  console.log("Creative ID returned from successful upload: ", creativeId);
  return parsedResponse;
  // return response.getResponseCode() == 200 ? creativeId : null;
}

// RELEVANT LINKS AND EXPLANATIONS FOR MULTIPART API POSTS IN APPS SCRIPT RE: uploadAssetTyped()function
// https://gist.github.com/tanaikech/d595d30a592979bbf0c692d1193d260c
// https://github.com/tanaikech/FetchApp?tab=readme-ov-file
// ON BOUNDRY SYNTAX:  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type

function uploadAssetTyped(
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
    "/assets?uploadType=multipart";

  const boundary = "-------314159265358979323846"; // Define a unique boundary string

  const headers = {
    "Authorization": "Bearer " + getOAuthService().getAccessToken(),
    "Content-Type": "multipart/related; boundary=" + boundary,
  };

  // Create the metadata (JSON) part of the form-data
  const metadata = {
    filename: fileBlob.getName(), // Ensure the filename includes the file extension (e.g., 'image.jpg')
  };

  // Manually build the multipart payload
  const payload =
    "--" +
    boundary +
    "\r\n" +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    "\r\n" +
    "--" +
    boundary +
    "\r\n" +
    "Content-Type: " +
    fileBlob.getContentType() +
    "\r\n" +
    'Content-Disposition: form-data; name="file"; filename="' +
    fileBlob.getName() +
    '"\r\n\r\n';

  // Create a new blob that concatenates the payload and the file content
  const finalPayload = Utilities.newBlob(payload)
    .getBytes()
    .concat(
      fileBlob.getBytes(),
      Utilities.newBlob("\r\n--" + boundary + "--\r\n").getBytes()
    );

  // Calculate the size of the finalPayload in bytes
  const finalPayloadSizeBytes = finalPayload.length;

  // Convert the size to megabytes
  const finalPayloadSizeMB = finalPayloadSizeBytes / (1024 * 1024);

  // Log the size in megabytes to the console
  console.log("finalPayload Size: ", finalPayloadSizeMB.toFixed(4), "MB");

  // console.log("Final payload: ", finalPayload);
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    headers: headers,
    payload: finalPayload, // Pass the complete payload
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);

  // Log the response status code and content
  Logger.log("Response Code: " + response.getResponseCode());
  const assetResponse = JSON.parse(response.getContentText());
  Logger.log("Asset Response: " + JSON.stringify(assetResponse));

  // return assetResponse.asset ? assetResponse.asset.mediaId : null;
  return assetResponse;
}

// Helper function to extract creativeId from the response
function extractCreativeIdTyped(response: Interfaces.CreativeApiResponse) {
  console.log({ response });
  const creativeId = response["creativeId"];
  console.log(creativeId);
  return creativeId; // Return the creativeId
}

// Helper function to make sure user inputs the needed information to create creatives
function validateRow(row: Interfaces.CreativeRow): string | null {
  const requiredFields: { [key: string]: string } = {
    "File ID": "File not sent. Missing fileId",
    "Advertiser ID": "File not sent. Missing Advertiser ID",
    "Landing Page": "File not sent. Missing Landing Page",
    "Type": "File not sent. Missing File Type",
  };

  for (const [field, errorMessage] of Object.entries(requiredFields)) {
    if (
      !row[field as keyof Interfaces.CreativeRow] ||
      row[field as keyof Interfaces.CreativeRow] === ""
    ) {
      return errorMessage;
    }
  }

  return null; // No errors
}

// Helper Function to check files size and return error
function checkFileSize(row: Interfaces.CreativeRow): boolean {
  const threshold = Config.constVars.chunkSize;
  // the threshold needs to be the same as chunksize for the chunked post function
  // if you want to change the size of the chunk or the threshold, change it in the Config namespace file
  // if not you will create an error if you try to post a file that is smaller than the initial chunk.
  console.log(
    "Checking file size to see if it is greather than chunk size of: ",
    threshold
  );
  const fileId = row["File ID"];
  const file = DriveApp.getFileById(fileId);
  const fileSize = file.getSize();
  console.log("File Size: ", HelperFunction.formatBytes(fileSize));
  if (fileSize > threshold) {
    console.log(
      "File is greater than chunksize and will be posted via chunk method"
    );
    return true;
  }
  console.log("File is less than chunksize and will be sent in one request");
  return false;
}
