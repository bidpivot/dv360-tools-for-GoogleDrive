# DV360 Tools

This a a repository for a private Google Workspace add-on that can be deployed by anyone using DV360 and Google Drive/Sheets.

### Features

- Push creative assets (videos, images and audio files) directly from Drive to DV360
- Download reports directly from DV360 into Drive folders
- Pull reports directly into google sheets

_Want to add more features? Message me and I will try to add them._

### About the repo

- The code is written in typescript and then compiled using Google Clasp
- You must download [Google Clasp CLI Tool](https://github.com/google/clasp) to use this repo and compile it to Apps Script.

- All files are contained in one folder. This makes it a little chaotic but it makes it easier when you compile into Apps Script.
- Names paces are used to import types or functions into other files. This is because in Apps Script there is no importing of modules required. All objects are available anywhere in your project. But to use Typescript and benefit from it, you need this Namespace set-up so typescript can see all of your structures and call out any potential errors. You can read more this [namespace workaround here](https://github.com/google/clasp/blob/master/docs/typescript.md#the-namespace-statement-workaround)
- Find the file named `configNamespace.example.ts` and rename it to `configNamespace.ts`
- This name space is used for your client secret and IDs that are needed for OAUth. You can get these from the google cloud console.
- You can also store constants that you want to use throughout your project

### notes on gcp set-up

- create oauth client and add secret + id to a config file and script properties of the apps script project
- enable all the google apis in the gcp project's api menu
- add the scopes if they are not added automatically
- you can only publish this add-on as a private add-on. a public add-on is not permitted under the license.
- once the apps script project is deployed, add the web url as an authorized redirect uri within the client credentials in the oauth section of the GCP project
- be careful with the endpoint after the url if you change the name of the page/file you are redirecting to. Then the end pont needs to be changed as well.
  `https://script.google.com/macros/d/{deploymentId}/usercallback`
- in order to publish the add-on privately to your organization, you need to enable the google marketplace api
- in the oauth consent screen section, you need to add the scopes there as well (this is in addition to the scopes you list in the appsscript project)
