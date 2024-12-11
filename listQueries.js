// function listQueries() {
//   const service = getOAuthService();
//   if (!service.hasAccess()) {
//     Logger.log('Authorization required.');
//     return;
//   } else {
//     console.log('the service has access')
//   }

//   const url = 'https://doubleclickbidmanager.googleapis.com/v2/queries';
//   const headers = {
//     Authorization: 'Bearer ' + getOAuthService().getAccessToken(),
//     'Content-Type': 'application/json'
//   };

//   try {
//     const response = UrlFetchApp.fetch(url, {
//       headers: headers,
//       muteHttpExceptions: true
//     });

//     if (response.getResponseCode() !== 200) {
//       // Log the full error response
//       Logger.log('Error response code: %s', response.getResponseCode());
//       Logger.log('Error response body: %s', response.getContentText());
//     } else {
//       const reports = JSON.parse(response.getContentText());
//       console.log(reports['queries'])
//       const queriesArray = reports['queries']
//       const latestReportFile = queriesArray.filter(query => {
//         return query.queryId === queryId
//       });
//       console.log({latestReportFile})
//       const fileUrl = latestReportFile.metadata.googleCloudStoragePath;
//       const fileContent = UrlFetchApp.fetch(fileUrl).getBlob();

//       const file = {
//         title: latestReportFile.metadata.title,
//         mimeType: 'text/csv',
//         parents: [{ id: driveFolderId }]
//       };

//       const driveFile = Drive.Files.insert(file, fileContent);
//       Logger.log('File uploaded to Google Drive with ID: %s', driveFile.id);
//     }
//   } catch (e) {
//     Logger.log('Error: %s', e.toString());
//     // Optionally, you can also log additional details or rethrow the error
//     Logger.log('Stack: %s', e.stack);
//   }
// }
