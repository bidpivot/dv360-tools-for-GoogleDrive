function onOpen() {
  console.log("onOpen triggered");
  const ui = SpreadsheetApp.getUi();

  // Create sub-menus
  const connectMenu = ui
    .createMenu("DV360 Authorization")
    .addItem("Connect To DV360", "authorize")
    .addItem("Disconnect from DV360", "clearService");

  const creativeMenu = ui
    .createMenu("Creatives")
    .addItem("Send Creatives to DV360", "masterPostCreativeLogic")
    .addItem("Import Assets From Drive to Sheets", "menuPullinDriveFiles");

  const reportingMenu = ui
    .createMenu("Reporting")
    .addItem("Import Report to Drive", "menuFetchReportToDriveFolder")
    .addItem("Import Report To Current Spreadsheet", "menuFetchReportToSheet");
  // .addItem("Show Sidebar", "showSidebar");

  // Create the main menu and add sub-menus
  ui.createAddonMenu()
    .addSubMenu(connectMenu)
    .addSubMenu(creativeMenu)
    .addSubMenu(reportingMenu)
    .addToUi();
}
