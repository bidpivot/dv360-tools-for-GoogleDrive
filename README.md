# Instructions about project

1. `fetchDailyData` is the function that is used to download the reports (in csv format) you need from dv360 into a designated Drive folder. This is only the first step the process. This function uses other functions including `fetchAndStoreReport`. But the arguments of this function are hard-coded. THose being the query/reportID and the folder to where your reporting data goes daily. This has a trigger that runs daily 6am GMT-5 timezone

1. in a separate spreadsheet called `master_daily_table` there is an appscript that runs on a daily trigger that takes all the reports in csv format and dumpes them into this master table in google sheet format

1. finally, the `Daily_Pacing_Automatic` sheet imports and queries the `master_daily_table` to calculate where the pacing is.

### handling the version of typescript that Apps Script uses

Using npx: You can run a specific version of TypeScript without installing it globally using npx:

`npx typescript@<version> --version`

Using npm Scripts: define TypeScript as a dependency in your project and specify the desired version in your package.json. This way, every time you run your scripts, it will use the version specified in the project:

json

{
"devDependencies": {
"typescript": "^4.9.5"
}
}

Using Docker: If you are working in a containerized environment, you can use Docker to specify the TypeScript version in your Dockerfile, ensuring that the desired version is used in your development environment.

###Ignoring files with .claspignore

`clasp push --ignore=node_modules/*`

### .claspignore

Don't create one! I am not sure why this is happening but when I try to create a claspignore file it does not ignore everything that is specified. But if I leave one out, there seems to be a default ignore that works as it should.

### Import / Require

All of the functions, variables etc that you intend to use in another file, (just as you do in appsscript without imports) you must define and export them within namespaces as follows:

`
// module.ts
namespace Module {
export function foo() {
Logger.log("Hello from foo!");
}

export const myVariable = 42; // This variable is now accessible outside the namespace

function bar() {
Logger.log("This function is private to Module.");
}
}`

###SDF files
taken from the dv360 api docs:
[sdf docs link](https://developers.google.com/display-video/api/guides/how-tos/sdf-api-integration)

`Update YouTube & Partners resources using SDF upload
You can't create or update YouTube & Partners resources, such as specific types of line items, ad groups, and ads, using the Display & Video 360 API. You can retrieve configurations and assigned targeting for these resources, but any updates must be done through the Display & Video 360 interface. This restricts bulk actions and limits the rate at which you can update these resources.

Use Structured Data Files upload to create or update YouTube & Partners resources in bulk through the Display & Video 360 interface. While you must upload Structured Data Files manually, you can complete the majority of the process, namely retrieving and modifying the files, programmatically.`

### notes on gcp set-up

-- create oauth client and add secret + id to a config file or script properties of the apps script project
-- enable all the google apis in the gcp project's api menu
-- add the scopes if they are not added automatically
-- if it is an 'external' add-on, then add yourself as a tester
-- once the apps script project is deployed, add the web url as an authorized redirect uri within the client credentials in the oauth section of the GCP project
be careful with the endpoint after the url. need to figure out eacctly how this works
the private addon ends with /usercallback
but when you copy the web app url, it will end in /exec
https://script.google.com/macros/d/{deploymentId}/usercallback
https://script.google.com/a/macros/fungimarketing.com/s/{deploymentid}/exec
