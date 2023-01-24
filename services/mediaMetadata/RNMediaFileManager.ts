import {NativeModules} from 'react-native';
import {MediaType} from '../../models/mediaMetadata/mediaMetadata';

export interface FileActionType {
  id: string;
  fileUrl: string;
  fileName: string;
  type: MediaType;
}

export interface RNMediaFileManager {
  // deleteFile(toDeleteList: FileActionType[]);
  copyFilesToFl360xp(files: FileActionType[]): Promise<void>;

  // Android-only methods
  selectBackupFolder(): Promise<void>;
  copyFl360FilesToBackupFolder(files: FileActionType[]): Promise<void>;
}

export default NativeModules.RNMediaFileManager as RNMediaFileManager;
