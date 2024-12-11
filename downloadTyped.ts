// Next: need to give the user an option to schedule pulling in a report
// then:  need to give them a way to VIEW what reports they have scheduled
// refactor code: there a lot of duplicative code in this module
// fix the way the names and dates are handled for reports for both CSV files saved in drive and saved to the current sheet.
// and let user find and choose the drive folder they would like to use or create a new one through a little ui.
// Next give the user a ui where they can see their available reports from dv360.  THis is a little trickier

// scheduling logic:
// after user successfully pulls in a report
// prompt them and ask if they would like to schedule the report
// if the user selects yes, then take in the hour and folderId (frequency might not be necessary as we can probably assume it's daily)
// create a new trigger based on the function with the current report Id and folderId
// create a new userProperties property for triggers and make the property an array
// Part II
// create a new menu function called 'menuViewScheduledReports'
// open a sidepanel that shows a list of all triggers and for each trigger show [id, name, frequency, hour]
// give the user the ability to edit or delete a given trigger

function menuFetchReportToSheet() {
  const ui = SpreadsheetApp.getUi();
  const reports = UserAppData.getUserPropertyArray(
    "reports"
  ) as UserAppData.obj[];

  if (reports.length !== 0) {
    // Ask the user if they want to select an old report
    const response = ui.alert(
      "Past Reports",
      "Do you want to import the latest version of one of the reports you have imported in the past? Press 'Yes' if so otherwise press 'No' to import a different report.",
      ui.ButtonSet.YES_NO
    );

    if (response == ui.Button.YES) {
      showReportsSidebar(reports);
      return;
    }
  }

  // Prompt the user for the Report ID
  const reportIdResponse = ui.prompt(
    "Please enter the Report ID found in the DV360 reporting dashboard. \n\nIt is recommended to schedule your report in DV360 if you plan to pull in this report regularly."
  );
  if (reportIdResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert("No Report ID entered. Operation cancelled.");
    return;
  }
  const reportId = reportIdResponse.getResponseText().trim();

  if (!reportId.startsWith("1")) {
    ui.alert(
      'Report ID should start with a "1". Please check the Report ID and try again.'
    );
    return;
  }

  const reportNameResponse = ui.prompt(
    "Please enter a name for your report: \n"
  );
  if (reportNameResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert("No Report Name entered. Operation cancelled.");
    return;
  }
  const reportName = reportNameResponse.getResponseText().trim();

  // THIS TRY BLOCK SAVES A REPORT OBJECT WITH THE ID AND NAME INTO THE USER'S PROPERTIES
  const reportObj: UserAppData.obj = { id: reportId, name: reportName };
  try {
    UserAppData.storeUserPropertyArray("reports", reportObj);
  } catch (error) {
    const err = error as Error;
    Logger.log(`Error storing Report ID: ${err.message}`);
  }
  processReport(reportObj);
}

function processReport(reportObj: UserAppData.obj) {
  const ui = SpreadsheetApp.getUi();
  console.log("Selected Report: ", reportObj);
  // THIS TRY BLOCK SAVES A REPORT OBJECT WITH THE ID AND NAME INTO THE USER'S PROPERTIES
  try {
    const reportsArray = fetchReportsArray(reportObj.id);
    const latestReport = fetchLatestReportContent(reportsArray);
    convertCsvReportToSheets(latestReport, reportObj.name);

    ui.alert(`Data from report: ${reportObj.id} successfully imported to sheet \n\n
      if your current sheet was not empty, then a new sheet was created in the same workbook`);
  } catch (error) {
    const err = error as Error;
    ui.alert(`Error: ${err.message}`);
  }
}

function menuFetchReportToDriveFolder() {
  const ui = SpreadsheetApp.getUi();

  // Prompt the user for the Report ID
  const reportIdResponse = ui.prompt(
    "Please enter the Report ID found in the DV360 reporting dashboard. \n\nIt is recommended to schedule your report in DV360 if you plan to pull in this report regularly."
  );
  if (reportIdResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert("No Report ID entered. Operation cancelled.");
    return;
  }
  const reportId = reportIdResponse.getResponseText().trim();

  if (!reportId.startsWith("1")) {
    ui.alert(
      'Report ID should start with a "1". Please check the Report ID and try again.'
    );
    return;
  }

  // Prompt the user for the Drive Folder ID
  const driveFolderIdResponse = ui.prompt(
    "Please enter the Drive Folder ID where you would like to send this report:"
  );
  if (driveFolderIdResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert("No Drive Folder ID entered. Operation cancelled.");
    return;
  }
  const driveFolderId = driveFolderIdResponse.getResponseText().trim();

  if (!reportId || !driveFolderId) {
    ui.alert("Invalid input. Both Report ID and Drive Folder ID are required.");
    return;
  }

  try {
    fetchAndStoreReport(reportId, driveFolderId);
    // showSuccessDialog(driveFolderId);
    ui.alert(
      `Report fetched and uploaded successfully to folder ID: \n\n
      https://drive.google.com/drive/folders/${driveFolderId}`
    );
  } catch (error) {
    const err = error as Error;
    ui.alert(`Error: ${err.message}`);
  }
  const newReport = { id: reportId, name: "placeholder" };
  promptUserForTriggerSchedule(newReport);
}


// these functions are breaking down fetching a report into smaller steps
// smaller functions and then one parent function to run through the logic
// there are 2 fetches in the process of getting the report
// fetch 1 - find the report's latest version and grab the google cloudstorage URL path in the response
// fetch 2 - get the content of the file located at that cloud storage URL
function fetchReportsArray(queryId: string): Interfaces.ReportResponse[] {
  // this function gets the array or reports and returns the latest one
  console.log("Calling reports array for queryId: ", queryId);
  const headers = {
    "Authorization": "Bearer " + getOAuthService().getAccessToken(),
    "Content-Type": "application/json",
  };

  const reportStatusUrl = `https://doubleclickbidmanager.googleapis.com/v2/queries/${queryId}/reports`;
  const reportStatusResponse = UrlFetchApp.fetch(reportStatusUrl, {
    headers: headers,
    muteHttpExceptions: true,
  });

  if (reportStatusResponse.getResponseCode() !== 200) {
    Logger.log(
      "Error response code: %s",
      reportStatusResponse.getResponseCode()
    );
    Logger.log(
      "Error response body: %s",
      reportStatusResponse.getContentText()
    );
    throw new Error(
      `Failed to pull report: ${reportStatusResponse.getContentText()}`
    );
  }

  const reportStatus = JSON.parse(reportStatusResponse.getContentText());
  const reportsArray: Array<Interfaces.ReportResponse> = reportStatus.reports;
  return reportsArray;
}

function fetchLatestReportContent(
  reportsArray: Array<Interfaces.ReportResponse>
) {
  // After you have the array that contains all the versions of a given report
  // this function will return the "content" or data from the latest version of that report
  if (!reportsArray || reportsArray.length === 0) {
    Logger.log("No reports found for the specified query.");
    throw new Error(
      "There are no recent files found for this report ID. \n\n Have you run or scheduled this report in the past?"
    );
  }

  // Get the last report in the array which will be the most recent report
  const latestReport = reportsArray[reportsArray.length - 1];
  Logger.log("Latest Report: %s", latestReport);

  const fileUrl = latestReport.metadata.googleCloudStoragePath;

  if (!fileUrl) {
    Logger.log("No googleCloudStoragePath found in the report metadata.");
    throw new Error("report not found");
  }

  // there are 2 fetches in the process of getting the report
  // fetch 1 - find the report's latest version and grab the google cloudstorage URL path in the response
  // fetch 2 - get the content of the file located at that cloud storage URL
  // fetch one is in the fetchReport function and fetch 2 below
  const fileContentBlob = UrlFetchApp.fetch(fileUrl).getBlob();
  console.log({ fileContentBlob });
  return fileContentBlob;
}

function storeReportInFolder(
  driveFolderId: string,
  fileContent: GoogleAppsScript.Base.Blob
) {
  // this code is all about naming the file.
  const day = getFormattedDate();
  const dayNumber = parseInt(day, 10);
  const reportDate = dayNumber - 1;

  const folder = DriveApp.getFolderById(driveFolderId);
  const driveFile = folder
    .createFile(fileContent)
    .setName(reportDate.toString());
  Logger.log("File uploaded to Google Drive with ID: %s", driveFile.getId());
}

function convertCsvReportToSheets(
  fileContent: GoogleAppsScript.Base.Blob,
  reportName: string
) {
  const csvData = fileContent.getDataAsString(); // Convert blob to string
  const parsedData = Utilities.parseCsv(csvData); // Parse CSV string into 2D array

  const workbook = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = workbook.getActiveSheet();

  const newSheetName = `${reportName}_${new Date().getTime()}`;

  // Check if the sheet is empty
  if (sheet.getLastRow() > 0 || sheet.getLastColumn() > 0) {
    // If the sheet isn't empty, create a new sheet
    sheet = workbook.insertSheet(newSheetName);
  } else {
    // Clear the sheet before inserting new data
    sheet.setName(newSheetName);
    sheet.clear();
  }

  // Set the values in the sheet
  // the first two args represent the first row then column of spreadsheet (not 0 indexed)
  //  the 3rd arg is the outer array which represents the rows
  // the 4rth arg represents how many columns of data there is
  sheet
    .getRange(1, 1, parsedData.length, parsedData[0].length)
    .setValues(parsedData);
}

function fetchAndStoreReport(queryId: string, driveFolderId: string) {
  try {
    const reportsArray = fetchReportsArray(queryId);
    const latestReport = fetchLatestReportContent(reportsArray);
    storeReportInFolder(driveFolderId, latestReport);
  } catch (e) {
    const error = e as Error;
    Logger.log("Error: %s", error.toString());
    Logger.log("Stack: %s", error.stack);
    throw new Error("Failed to pull report");
  }
}
