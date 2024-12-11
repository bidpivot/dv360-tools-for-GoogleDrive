function addReportId(reportId: string) {
  const reportIds = getUserReportIds();
  if (!reportIds.includes(reportId)) {
    reportIds.push(reportId);
    storeUserReportIds(reportIds);
    SpreadsheetApp.getUi().alert("Report ID has been saved.");
  } else {
    SpreadsheetApp.getUi().alert("Report ID already exists.");
  }
}

function showUserReportIds() {
  const reportIds = getUserReportIds();
  if (reportIds.length > 0) {
    SpreadsheetApp.getUi().alert("Your report IDs: " + reportIds.join(", "));
  } else {
    SpreadsheetApp.getUi().alert("No report IDs found.");
  }
}

function storeUserReportIds(reportIds: string[]) {
  const userProperties = PropertiesService.getUserProperties();
  const reportIdsJson = JSON.stringify(reportIds);
  userProperties.setProperty("reportIds", reportIdsJson);
}

function getUserReportIds(): string[] {
  const userProperties = PropertiesService.getUserProperties();
  const reportIdsJson = userProperties.getProperty("reportIds");
  return reportIdsJson ? JSON.parse(reportIdsJson) : [];
}
