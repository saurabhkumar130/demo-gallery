import * as Types from './types';
import {MediaMetadataResult} from './types';
import {
  MediaMetadata,
  MediaMetadataSnapshot,
} from '../../models/mediaMetadata/mediaMetadata';
import {DateTime} from 'luxon';
import RNMetadataExtractor from './RNMetadataExtractor';
import RNMediaFileManager from './RNMediaFileManager';
import {Platform} from 'react-native';
import {getThumbnailFilePath, RNFS} from '../../utils/generateThumbnail';
export class MediaMetadataApi {
  setup() {}

  convertToJsDate(m: MediaMetadataSnapshot) {
    // @ts-ignore
    m.date = DateTime.fromISO(m.date).toJSDate();
  }

  // async getMediaMetadata(ids: string[]): Promise<Types.GetMediaMetadataResult> {
  //   try {
  //     const mediasJson = await RNMetadataExtractor.getMedia(ids);
  //     // console.log("mediasJson", mediasJson)

  //     const data = JSON.parse(mediasJson) as MediaMetadataResult;
  //     data.addedMediaMetadataList.forEach(this.convertToJsDate);

  //     // console.log("data", data)
  //     return new Promise(resolve => resolve({kind: 'ok', data}));
  //   } catch (e) {
  //     console.log('error while extracting the media metadata', e);
  //     return Promise.reject(e);
  //   }
  // }

  async getOtherMediaMetadata(): Promise<Types.GetOtherMediaMetadataResult> {
    try {
      const otherMediasJson = await RNMetadataExtractor.getOtherMedia();
      console.log('otherMediasJson', otherMediasJson);

      const data = JSON.parse(otherMediasJson) as MediaMetadataResult;
      data.addedMediaMetadataList.forEach(this.convertToJsDate);

      console.log('other data', data);
      return Promise.resolve({
        kind: 'ok',
        otherMediaMetadataList: data.addedMediaMetadataList,
      });
    } catch (e) {
      console.log('error while extracting the other media metadata', e);
      return Promise.reject(e);
    }
  }

  // async generateThumbnail(
  //   mediaMetadata: MediaMetadata,
  // ): Promise<Types.GenerateThumbnailResult> {
  //   try {
  //     const param =
  //       Platform.OS === 'android' ? mediaMetadata.fileUrl : mediaMetadata.id;
  //     // Checks if thumbnail already present in Firstlook-thumbnail then return the path directly , else generate thumbnail and return the path
  //     const {pathName, fileNameWithoutExtension} = getThumbnailFilePath(
  //       mediaMetadata.fileName,
  //     );
  //     if (await RNFS.exists(pathName)) {
  //       return {kind: 'ok', thumbnail: pathName};
  //     } else {
  //       const thumbnail = await RNMetadataExtractor.generateThumbnail(
  //         param,
  //         fileNameWithoutExtension,
  //         mediaMetadata.type,
  //       );
  //       return {kind: 'ok', thumbnail};
  //     }
  //   } catch (e) {
  //     __DEV__ &&
  //       console.tron.error(
  //         'error occured while calling the native generate thumbnail function',
  //         e,
  //       );
  //     return {kind: 'rejected'};
  //   }
  // }

  // deleteFiles(mediaMetadata: MediaMetadata[]) {
  //   RNMediaFileManager.deleteFile(
  //     mediaMetadata.map(m => ({
  //       id: m.id,
  //       fileName: m.fileName,
  //       fileUrl: m.fileUrl,
  //       type: m.type,
  //     })),
  //   );
  // }

  // async copyFilesToFl360xp(
  //   mediaMetadata: MediaMetadata[],
  // ): Promise<Types.MoveFileResult> {
  //   try {
  //     const toMove = mediaMetadata.map(m => ({
  //       id: m.id,
  //       fileUrl: m.fileUrl,
  //       fileName: m.fileName,
  //       type: m.type,
  //     }));
  //     await RNMediaFileManager.copyFilesToFl360xp(toMove);
  //     return {kind: 'ok'};
  //   } catch (e) {
  //     console.log('native call to move files failed. ', JSON.stringify(e));
  //     return {kind: 'unauthorized'};
  //   }
  // }

  // async selectBackupFolder(): Promise<Types.SelectBackupFolderResult> {
  //   if (Platform.OS === 'ios') {
  //     throw new Error('backup action in iOS not supported');
  //   }

  //   try {
  //     const result = await RNMediaFileManager.selectBackupFolder();
  //     console.log('selectBackupFolder result:', result);
  //     return {kind: 'ok'};
  //   } catch (e) {
  //     console.log('error while selecting folder', e);
  //     return Promise.reject(e);
  //   }
  // }

  // async copyFl360FilesToBackupFolder(
  //   mediaMetadata: MediaMetadata[],
  // ): Promise<Types.MoveFileResult> {
  //   try {
  //     const toMove = mediaMetadata.map(m => {
  //       m.setBackupStatus('backingUp');

  //       return {
  //         id: m.id,
  //         fileUrl: m.fileUrl,
  //         fileName: m.fileName,
  //         type: m.type,
  //       };
  //     });
  //     await RNMediaFileManager.copyFl360FilesToBackupFolder(toMove);
  //     mediaMetadata.forEach(m => m.setBackupStatus('backedUp'));
  //     return {kind: 'ok'};
  //   } catch (e) {
  //     console.log('native call to backup files failed. ', JSON.stringify(e));
  //     mediaMetadata.forEach(m => m.setBackupStatus('backupFailed'));
  //     return {kind: 'unauthorized'};
  //   }
  // }
}
