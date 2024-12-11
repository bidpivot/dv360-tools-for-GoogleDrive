// see all relevant methods in docs here
// https://developers.google.com/apps-script/reference/base/ui

namespace UserInteraction {
  export function promptUserForInput(
    title: string,
    messageToUser: string,
    buttons: GoogleAppsScript.Base.ButtonSet = SpreadsheetApp.getUi().ButtonSet
      .OK
  ): GoogleAppsScript.Base.PromptResponse {
    const userPromptResponseBlob = SpreadsheetApp.getUi().prompt(
      title,
      messageToUser,
      buttons
    );
    console.log({ userPromptResponseBlob });
    console.log(userPromptResponseBlob.getResponseText());
    return userPromptResponseBlob;
  }

  export function alertUser(
    title: string | null = null,
    messageToUser: string = "this is a default message"
  ): void {
    if (title) {
      SpreadsheetApp.getUi().alert(
        title,
        messageToUser,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(messageToUser);
    }
  }

  export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return "Unknown error occurred.";
  }

  export const creativeTypeMap: Record<Interfaces.CreativeRow["Type"], string> =
    {
      display: "CREATIVE_TYPE_STANDARD",
      video: "CREATIVE_TYPE_VIDEO",
      native: "CREATIVE_TYPE_NATIVE",
      audio: "CREATIVE_TYPE_AUDIO",
    };
}

// cannot run from this context or from an unbound script
// function testPompt() {

//   const input = UserInteraction.promptUserForInput(
//     "Prompt Title",
//     "Put in your input here"
//   ).getResponseText();
//   console.log({ input });
// }
