import {NativeModule, NativeModules} from 'react-native';

export interface RNMediaFileManagerEventEmitter extends NativeModule {}

export default NativeModules.RNMediaFileManagerEventEmitter as RNMediaFileManagerEventEmitter;

export enum RNMediaFileManagerSupportedEvents {
  ON_FILES_DELETED = 'ON_FILES_DELETED',
}
