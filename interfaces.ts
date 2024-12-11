namespace Interfaces {
  export interface CreativeRow {
    "File Name": string;
    "File ID": string;
    "File Link": string;
    "Advertiser ID": string;
    "Type": "display" | "video" | "native" | "audio";
    "Landing Page": string;
    "Media ID": string;
    "DV360 Creative ID": string;
    "Status Message": string;
  }

  export interface VideoCreativeObj {
    displayName: string;
    entityStatus: "ENTITY_STATUS_ACTIVE";
    hostingSource: "HOSTING_SOURCE_HOSTED";
    creativeType:
      | "CREATIVE_TYPE_VIDEO"
      | "CREATIVE_TYPE_STANDARD"
      | "CREATIVE_TYPE_AUDIO";
    assets: {
      asset: { mediaId: string };
      role: "ASSET_ROLE_MAIN";
    }[];
    exitEvents: {
      name: string;
      type: "EXIT_EVENT_TYPE_DEFAULT";
      url: string;
    }[];
  }

  export interface Dimensions {
    heightPixels: number;
    widthPixels: number;
  }

  export interface ImageCreativeObj extends VideoCreativeObj {
    dimensions: Dimensions;
  }

  export function generateImageObj(
    reqObj: VideoCreativeObj,
    dims: Dimensions
  ): ImageCreativeObj {
    let newObj: ImageCreativeObj = {
      ...reqObj,
      dimensions: dims,
      creativeType: "CREATIVE_TYPE_STANDARD" as "CREATIVE_TYPE_STANDARD",
    };
    return newObj;
  }

  interface Asset {
    asset: {
      mediaId: string;
      content: string;
    };
    role: string;
  }

  interface ExitEvent {
    type: string;
    url: string;
  }

  interface CmTrackingAd {
    cmPlacementId: string;
    cmCreativeId: string;
    cmAdId: string;
  }

  export interface CreativeApiResponse {
    name: string;
    advertiserId: string;
    creativeId: string;
    displayName: string;
    entityStatus: string;
    creativeType: string;
    hostingSource: string;
    dimensions: Dimensions;
    mediaDuration: string;
    assets: Asset[];
    exitEvents: ExitEvent[];
    cmTrackingAd: CmTrackingAd;
  }

  export interface AssetApiResponse {
    asset: { mediaId: string };
  }

  export function getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear(); // 2024
    const month = String(date.getMonth() + 1).padStart(2, "0"); // '08'
    const day = String(date.getDate()).padStart(2, "0"); // '03'
    console.log(`${year}${month}${day}`);
    return `${year}${month}${day}`; // '20240803'
  }

  export interface ReportResponse {
    params: {
      filters: Array<{
        value: number;
        type: string;
      }>;
      metrics: string[];
      type: string;
      groupBys: string[];
      options: Record<string, any>; // Empty object or any other key-value pairs
    };
    metadata: {
      reportDataEndDate: {
        month: number;
        day: number;
        year: number;
      };
      reportDataStartDate: {
        year: number;
        month: number;
        day: number;
      };
      googleCloudStoragePath: string;
      status: {
        format: string;
        state: string;
        finishTime: string;
      };
    };
    key: {
      reportId: number;
      queryId: number;
    };
  }

  export interface FileContentBlob {}
}
