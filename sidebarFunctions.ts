function showReportsSidebar(reports: UserAppData.obj[]) {
  console.log("reports: ", reports); // Log the reports data to ensure it is correct
  const html = HtmlService.createTemplateFromFile("sidebar");
  html.reports = reports;
  const output = html.evaluate().setTitle("Choose a Report");
  SpreadsheetApp.getUi().showSidebar(output);
}

function showTriggerSidebar(report: UserAppData.obj) {
  // "Reference Error: Trigger is not defined"
  console.log("current report: ", report); // Log the reports data to ensure it is correct
  const html = HtmlService.createTemplateFromFile("trigger-form");
  // const triggers = UserAppData.getUserPropertyArray("triggers");
  // console.log("Triggers Array: ", triggers);
  html.currentReport = report;
  // html.triggers = triggers;
  const output = html.evaluate().setTitle("Schedule A Report");
  SpreadsheetApp.getUi().showSidebar(output);
}

function showAuthSidebar(htmlTemplate: GoogleAppsScript.HTML.HtmlTemplate) {
  // console.log("Triggers Array: ", triggers);
  const output = htmlTemplate.evaluate().setTitle("Authorize for DV360");
  SpreadsheetApp.getUi().showSidebar(output);
}
