// I am keeping this as a vanilla JS file because the namespace overcomplicates the getOAuthService Function which is used everywhere

function getOAuthService() {
  const clientId = CONFIG.clientId;
  const clientSecret = CONFIG.clientSecret;

  return (
    OAuth2.createService("DV360")
      .setAuthorizationBaseUrl("https://accounts.google.com/o/oauth2/auth")
      .setTokenUrl("https://accounts.google.com/o/oauth2/token")
      .setClientId(clientId)
      .setClientSecret(clientSecret) // WE MIGHT NOT NEED THE SECRET ANY MORE SINCE DEPLOYING THE ADD-ON
      .setCallbackFunction("authCallback") // REMEMBER: you need to set the redirect URI in GCP which will be the URL of this script
      .setPropertyStore(PropertiesService.getUserProperties())
      // be careful with these scopes.  there needs to be a space in between each scope.  That is why there is an empty space before the end of the string
      .setScope(
        "https://www.googleapis.com/auth/doubleclickbidmanager " +
          "https://www.googleapis.com/auth/display-video " +
          "https://www.googleapis.com/auth/drive " + // Scope for Google Drive access
          "https://www.googleapis.com/auth/drive.file " // Scope for Google Picker API
      ) // Add multiple scopes separated by space
      .setCache(CacheService.getUserCache()) // scripts that use the library heavily should enable caching on the service, so as to not exhaust their PropertiesService quotas
      .setParam("access_type", "offline")
      .setParam("approval_prompt", "force")
  );
}

function authCallback(request) {
  const service = getOAuthService();
  const isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput("Success! You can close this tab.");
  } else {
    return HtmlService.createHtmlOutput("Denied. You can close this tab");
  }
}

function authorize() {
  const service = getOAuthService();
  if (!service.hasAccess()) {
    const authorizationUrl = service.getAuthorizationUrl();
    Logger.log(
      "Open the following URL and re-run the script: %s",
      authorizationUrl
    );

    // Create the HTML template and pass the authorization URL
    const template = HtmlService.createTemplateFromFile("AuthorizationDialog");
    template.authorizationUrl = authorizationUrl;

    // Evaluate the template to create the HTML output
    const htmlOutput = template
      .evaluate()
      .setWidth(400)
      .setHeight(150)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);

    // Show the HTML dialog
    SpreadsheetApp.getUi().showModalDialog(
      htmlOutput,
      "Authorization Required"
    );
  } else {
    console.log(
      "User already has access and their Drive account is authorized"
    );
  }
}

function clearService() {
  const service = getOAuthService();
  service.reset();
  console.log("authorization service with DV360 has been disconnected");
}

function reauthorize() {
  clearService();
  authorize();
}
