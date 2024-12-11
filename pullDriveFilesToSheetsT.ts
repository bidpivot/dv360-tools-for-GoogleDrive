// Exception: Argument cannot be null: buttons
function menuPullinDriveFiles() {
  const userResponseBlob = UserInteraction.promptUserForInput(
    "Drive Folder ID",
    "Please paste in the drive folder ID where the assets are stored to be sent to DV360: "
  );
  const id = userResponseBlob.getResponseText();
  console.log({ id });
  if (!id || id === "") {
    UserInteraction.alertUser(
      "You need to provde a drive folder ID to identify which Drive files will be pulled into sheets"
    );
    return;
  }
  createSpreadsheetWithLinks(id);
}

function createSpreadsheetWithLinks(driveFolderId: string) {
  // Replace this with the actual folder IDa
  const folder = DriveApp.getFolderById(driveFolderId); // it knows the type from google apps script types
  const files = folder.getFiles();

  if (!files.hasNext()) {
    console.log("There are no files in the folder");
    UserInteraction.alertUser(
      "Process Update",
      "There are no files in the folder provided."
    );
  }

  // get the active sheet and set it equal to sheet
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet =
    spreadsheet.getActiveSheet() as GoogleAppsScript.Spreadsheet.Sheet;

  // check if the first row of the active sheet equals the headerRow (in other words has the correct columns already)
  const headerRow = [
    "File Name",
    "File ID",
    "File Link",
    "Advertiser ID",
    "Type",
    "Landing Page",
    "Media ID",
    "DV360 Creative ID",
    "Status Message",
  ];

  // Get the values of the first row of the active sheet
  const firstRowValues = sheet
    .getRange(1, 1, 1, headerRow.length)
    .getValues()[0];

  // Check if the first row values match the headerRow
  const isHeaderRowMatching = firstRowValues.every(
    (value, index) => value === headerRow[index]
  );

  let rowIndex: number;
  let alertMessage: string;

  if (isHeaderRowMatching) {
    // if the headerRow matches, then perform the same process but begin on the first empty row
    rowIndex = sheet.getLastRow() + 1;
    alertMessage =
      "Files from the provided Drive folder have been added to the first available row in the current sheet";
  } else {
    // if it does not then create a new sheet and import all the meta data from the files from the drive folder provided by the user
    sheet = spreadsheet.insertSheet(0);
    const sheetName = `Files from Drive Folder ID ${driveFolderId}`;
    sheet.setName(sheetName);
    // Add header row
    sheet.appendRow(headerRow);
    rowIndex = 2; // Start from row 2 since row 1 is the header
    alertMessage = `Links and relevant data about the files have been created in a new sheet within this current spreadsheet. \n\n The tab/sheet is named ${sheetName}
    `;
  }

  insertFileMetaDataIntoSheet(rowIndex, files, sheet, alertMessage);
}

function insertFileMetaDataIntoSheet(
  rowIndex: number,
  files: GoogleAppsScript.Drive.FileIterator,
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  alertMessage: string
) {
  // Define the allowed values for media type column
  const allowedValues = ["display", "video", "audio"];

  // Create the validation rule for the media type column
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(allowedValues)
    .setAllowInvalid(false)
    .build();

  // Iterate through the files in the folder
  while (files.hasNext()) {
    const file = files.next();
    const fileId = file.getId();
    const fileUrl = file.getUrl();
    const fileName = file.getName();
    console.log({ fileId, fileUrl, fileName });

    // Add file details in the appropriate columns
    sheet.getRange(rowIndex, 1).setValue(fileName); // File Name
    sheet.getRange(rowIndex, 2).setValue(fileId); // File ID
    sheet.getRange(rowIndex, 3).setValue(file.getUrl());
    sheet.getRange(rowIndex, 4).setValue("[PLEASE ADD ADVERTISER ID]"); // Advertiser ID (empty for now)
    // Apply the media type validation rule to this column
    sheet.getRange(rowIndex, 5).setDataValidation(rule);
    sheet.getRange(rowIndex, 6).setValue("[PLEASE PROVIDE LANDING PAGE]");
    rowIndex++;
  }

  // Notify the user with the link to the new spreadsheet
  UserInteraction.alertUser("Process Complete", alertMessage);
}
