namespace UserAppData {
  export function checkUserFolder(): string | null {
    const folderName = "z_DV360tools_doNotDelete";
    const folders = DriveApp.getFoldersByName(folderName);

    if (folders.hasNext()) {
      return folders.next().getId();
    }

    return null;
  }

  export function createUserFolder(): string | null {
    const folderName = "z_DV360tools_doNotDelete";

    try {
      const newFolder = DriveApp.createFolder(folderName);
      return newFolder.getId();
    } catch (error) {
      console.error("Failed to create user folder:", error);
      return null;
    }
  }

  export function checkForUserMetaDataFile(): string | null {
    const folderArray = DriveApp.getFoldersByName("z_DV360tools_doNotDelete");
    const folder = folderArray.next();
    const fileName = "userMetaData.json";
    const files = folder.getFilesByName(fileName);

    if (files.hasNext()) {
      return files.next().getId();
    }

    return null;
  }

  export function createUserMetaDataFile(folderId: string): string | null {
    const folder = DriveApp.getFolderById(folderId);
    const fileName = "userMetaData.json";

    try {
      const newFile = folder.createFile(
        fileName,
        JSON.stringify({}),
        "application/json"
      );
      return newFile.getId();
    } catch (error) {
      console.error("Failed to create user metadata file:", error);
      return null;
    }
  }

  export function checkThenCreateUserFolder(): string | null {
    return checkUserFolder() || createUserFolder();
  }

  export function checkThenCreateUserMetaDataFile(): string | null {
    const folderId = checkThenCreateUserFolder();
    if (!folderId) {
      return null;
    }

    return checkForUserMetaDataFile() || createUserMetaDataFile(folderId);
  }

  export interface UserJsonStorage {
    reports: obj[];
    advertisers: obj[];
    triggers: trigger[];
  }
  export interface obj {
    id: string;
    name: string;
  }

  type Hour =
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "11"
    | "12"
    | "13"
    | "14"
    | "15"
    | "16"
    | "17"
    | "18"
    | "19"
    | "20"
    | "21"
    | "22"
    | "23";
  export interface trigger extends obj {
    frequency: "daily" | "weekly";
    hour: Hour;
    folderId: string;
  }

  type ValueOf<T> = T[keyof T];
  export type propertyArrayType = ValueOf<UserJsonStorage>; // this is an array because all the values of all the keys of UserJsonStorage are arrays
  export type UserJsonStorageKey = keyof UserJsonStorage;

  export function deDupObject(
    newObj: obj | trigger,
    oldPropertyArray: propertyArrayType
  ) {
    if (oldPropertyArray.length === 0) {
      // If the existing property array is empty, return a new array with the new object
      return [newObj];
    } else {
      // Check if this propertyId already exists
      const existingPropertyIndex = oldPropertyArray.findIndex(
        obj => obj.id === newObj.id
      );

      if (existingPropertyIndex === -1) {
        // If the property does not exist, return a new array with the new object added
        return [...oldPropertyArray, newObj];
      } else {
        // If the property exists, return a new array with the updated property
        return oldPropertyArray.map((obj, index) =>
          index === existingPropertyIndex ? { ...obj, name: newObj.name } : obj
        );
      }
    }
  }

  export function getUserPropertyArray(
    property: keyof UserJsonStorage
  ): propertyArrayType {
    // receives string that is a keyof Json Property
    // returns an array of one of the keys
    const userProperties = PropertiesService.getUserProperties();
    const propertyArrayJson = userProperties.getProperty(property);
    console.log(`Retrieved data for ${property}: `, propertyArrayJson);
    return propertyArrayJson ? JSON.parse(propertyArrayJson) : [];
  }

  export function storeUserPropertyArray(
    property: keyof UserJsonStorage,
    propertyObj: obj | trigger
  ) {
    // receives as a parameter one of the objs or the UserJsonStorage (e.g report or advertiser)
    const previousPropertyArray = getUserPropertyArray(property);
    const newPropertyArray = deDupObject(propertyObj, previousPropertyArray);
    console.log(
      `New array for ${property} to be saved in in UserProperties: `,
      newPropertyArray
    );
    const userProperties = PropertiesService.getUserProperties();
    const jsondata = JSON.stringify(newPropertyArray);
    userProperties.setProperty(property, jsondata);
  }

  // export function getUserPropertyArrayFromJson(): reportObj[] {
  //   // todo: add parameter so that of metafile file ID and locate file with the ID

  //   // hardcoding data for now to test templating html
  //   const userData = {
  //     reports: [{ reportId: "1286696061", reportName: "report2" }],
  //   };

  //   // const fileName = "UserReportIds.json";
  //   // const folder = DriveApp.getRootFolder();
  //   // const file = folder.getFilesByName(fileName).hasNext()
  //   //   ? folder.getFilesByName(fileName).next()
  //   //   : null;

  //   // if (!file) {
  //   //   return [];
  //   // }

  //   // const jsonData = file.getBlob().getDataAsString();
  //   // const parsedData = JSON.parse(jsonData);
  //   return userData["reports"];
  // }
}
