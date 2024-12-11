function menuFetchReportWithPicker() {
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

  if (!reportId) {
    ui.alert("Invalid input. Report ID is required.");
    return;
  }

  // Show the Picker UI for folder selection
  showPicker(reportId);
}

function showPicker(reportId: string) {
  const html = HtmlService.createHtmlOutputFromFile("SelectFolder")
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, "Select a Folder");
}
function getFolders() {
  const folders = [];
  const folderIterator = DriveApp.getFolders();
  const currentUserEmail = Session.getActiveUser().getEmail();

  while (folderIterator.hasNext()) {
    const folder = folderIterator.next();
    if (folder.getOwner().getEmail() === currentUserEmail) {
      folders.push({ id: folder.getId(), name: folder.getName() });
    }
  }
  return folders;
}

function handleFolderSelection(folderId: string, reportId: string) {
  Logger.log("Selected Folder ID: " + folderId);
  Logger.log("Report ID: " + reportId);

  fetchAndStoreReport(reportId, folderId);
}
