// function scheduleReportFetch() {
//   const ui = SpreadsheetApp.getUi();
//   const html = HtmlService.createHtmlOutputFromFile("ScheduleDialog")
//     .setWidth(300)
//     .setHeight(200);
//   ui.showModalDialog(html, "Schedule Report Fetch");
// }

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

// function createTimeDrivenTrigger(frequency: string, time: string) {
//   // Clear existing triggers for the function
//   // Do I need to do this step if the triggers are user specific?

//   // const triggers = ScriptApp.getProjectTriggers();
//   // for (const trigger of triggers) {
//   //   if (trigger.getHandlerFunction() === "fetchAndUploadReport") {
//   //     ScriptApp.deleteTrigger(trigger);
//   //   }
//   // }

//   // Create a new time-driven trigger based on user input
//   let triggerBuilder = ScriptApp.newTrigger("fetchAndUploadReport").timeBased();

//   switch (frequency) {
//     case "daily":
//       triggerBuilder = triggerBuilder.everyDays(1).atHour(parseInt(time));
//       break;
//     case "weekly":
//       triggerBuilder = triggerBuilder
//         .everyWeeks(1)
//         .onWeekDay(ScriptApp.WeekDay.MONDAY)
//         .atHour(parseInt(time));
//       break;
//     // Add more cases as needed
//   }

//   triggerBuilder.create();
// }

function createTimeDrivenTrigger(scheduleFormData: UserAppData.trigger) {
  // Oct 25, 2024, 3:32:58 PM	Error	Exception: This add-on has created too many time-based triggers in this document for this Google user account.
  // at createTimeDrivenTrigger(menuScheduleFunction:79:38)

  const uniqueTriggerId = `trigger_${scheduleFormData.id}`;

  const userProperties = PropertiesService.getUserProperties();
  const triggers = ScriptApp.getProjectTriggers();
  // ScriptApp.getUserTriggers() are tied to specifc document (spreadsheet, form etc) so it's probably not an option here

  // Check for existing triggers for this report ID
  const existingTriggerId = userProperties.getProperty(uniqueTriggerId);
  if (existingTriggerId) {
    // If a trigger already exists, delete it
    const existingTrigger = triggers.find(
      trigger => trigger.getUniqueId() === existingTriggerId
    );
    // NOTE:  this may be the only way but this means I will be looping through every
    // trigger for every user every time just to check if the trigger exists.
    // This may not be a viable solution
    if (existingTrigger) {
      ScriptApp.deleteTrigger(existingTrigger);
    }
  }

  // Create a new time-driven trigger based on user input
  let triggerBuilder = ScriptApp.newTrigger("fetchAndStoreReport").timeBased();

  switch (scheduleFormData.frequency) {
    case "daily":
      triggerBuilder = triggerBuilder
        .everyDays(1)
        .atHour(parseInt(scheduleFormData.hour));
      break;
    case "weekly":
      triggerBuilder = triggerBuilder
        .everyWeeks(1)
        .onWeekDay(ScriptApp.WeekDay.MONDAY)
        .atHour(parseInt(scheduleFormData.hour));
      break;
    // might want to add more cases
  }

  // Create the trigger and store its ID in user properties
  const triggerId = triggerBuilder.create().getUniqueId();
  userProperties.setProperty(uniqueTriggerId, triggerId);
}

function promptUserForTriggerSchedule(report: UserAppData.obj) {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    "Schedule Report?",
    `Would you like to schedule this report with ID: ${report.id} to be imported to your drive on a daily or weekly basis? \n`,
    ui.ButtonSet.YES_NO
  );

  if (response == ui.Button.YES) {
    showTriggerSidebar(report);
  }
}
