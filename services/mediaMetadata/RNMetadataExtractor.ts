import {NativeModules} from 'react-native';
import {MediaType} from '../../models/mediaMetadata/mediaMetadata';

export interface RNMetadataExtractor {
  getMedia(ids: string[]): Promise<string>; // get media from fl360xp folder for android or media from fl360xp album for ios
  generateThumbnail(
    fileUrlAndroidOrIdIOS: string,
    fileName: string,
    mediaType: MediaType,
  ): Promise<string>; // base64 format
  getOtherMedia(): Promise<string>; // get media outside fl360xp folder for android or media outside fl360xp album for ios
}

export default NativeModules.RNMetadataExtractor as RNMetadataExtractor;
