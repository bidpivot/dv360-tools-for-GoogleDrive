Explanation:
onOpen function: Adds a custom menu to the Google Sheets UI with options to fetch the report and schedule the report fetch.

scheduleReportFetch function: Displays a modal dialog to prompt the user for scheduling details.

createTimeDrivenTrigger function: Creates a time-driven trigger based on the user's input. It first clears any existing triggers for the fetchAndUploadReport function to avoid duplicates.

ScheduleDialog.html: Contains the HTML form for the user to input the scheduling details. When the form is submitted, it calls the createTimeDrivenTrigger function with the user's input.
