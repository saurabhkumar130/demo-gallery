import {detach, flow, Instance, types} from 'mobx-state-tree';
import {MediaMetadataModel} from './mediaMetadata';
import {withEnvironment, withRootStore, withStatus} from '../extensions';
import _ from 'lodash';
import {NativeEventEmitter} from 'react-native';
import RNMediaFileManagerEventEmitter, {
  RNMediaFileManagerSupportedEvents,
} from '../../services/mediaMetadata/RNMediaFileManagerEventEmitter';
// import {getThumbnailFilePath, RNFS} from '../../utils/generateThumbnail';

export const MEDIA_METADATA_LIST_PATH = 'mediaMetadataList'; // ensure line 10 is the same as this string value

const eventEmitter = new NativeEventEmitter(RNMediaFileManagerEventEmitter);

export const MediaMetadataStoreModel = types
  .model('MediaMetadataStoreModel', {
    mediaMetadataList: types.array(MediaMetadataModel),
    favorites: types.array(MediaMetadataModel),
    otherMediaMetadataList: types.array(MediaMetadataModel), // data here are up to 7 days old only
  })
  .extend(withEnvironment)
  .extend(withStatus)
  .extend(withRootStore)
  .actions(self => ({
    removeFromTreeByPredicate: function (predicate: (m) => boolean) {
      const list = self.mediaMetadataList;

      const toBeRemoved = list.filter(predicate);
      toBeRemoved.forEach(detach);

      const retained = list.filter(m => !predicate(m));
      self.mediaMetadataList.replace(retained);
    },
  }))
  .actions(self => ({
    load: flow(function* () {
      if (self.status === 'pending') {
        return;
      }

      self.setStatus('pending');
      try {
        const result = yield self.environment.metadataApi.getMediaMetadata(
          self.mediaMetadataList.map(m => m.id),
        );
        if (result.kind === 'ok') {
          const deleted = self.mediaMetadataList.filter(m =>
            result.data.deletedMediaMetadataIds.includes(m.id),
          );
          // console.log("deletedRemoved", deletedRemoved)
          deleted.forEach(m => detach(m));
          self.mediaMetadataList.replace(
            self.mediaMetadataList.filter(
              m => !result.data.deletedMediaMetadataIds.includes(m.id),
            ),
          );

          self.mediaMetadataList.push(...result.data.addedMediaMetadataList);
          if (self.rootStore.settingsStore.backupToSdCard) {
            yield self.environment.metadataApi.copyFl360FilesToBackupFolder(
              self.mediaMetadataList.filter(m => m.backupStatus !== 'backedUp'),
            );
            self.mediaMetadataList
              .slice()
              .sort((a, b) => b.date.getTime() - a.date.getTime());
            self.setStatus('done');
          } else {
            self.mediaMetadataList
              .slice()
              .sort((a, b) => b.date.getTime() - a.date.getTime());
            self.setStatus('done');
          }
        } else {
          throw new Error(
            `error while trying to get metadata list, kind: ${result.kind}`,
          );
        }
      } catch (e) {
        console.log(
          'error while loading the media metadata: ',
          JSON.stringify(e),
        );
        self.setStatus('error');
      }
    }),
    loadOther: flow(function* (): Generator<Promise<any>, boolean, any> {
      console.log('mediaMetadataStore loadOther ');
      self.setStatus('pending');
      try {
        const result =
          yield self.environment.metadataApi.getOtherMediaMetadata();
        console.log('result in mediaMetadataStore: ', JSON.stringify(result));
        if (result.kind === 'ok') {
          self.otherMediaMetadataList = result.otherMediaMetadataList;
          self.status = 'done';
          return true;
        } else {
          throw new Error(
            `error while trying to get other metadata list, kind: ${result.kind}`,
          );
        }
      } catch (e) {
        console.log(
          'error while loading the other media metadata: ',
          JSON.stringify(e),
        );
        self.setStatus('error');
        return false;
      }
    }),
    deleteAllByFileNames: function (fileNames: string[]) {
      const toDeleteList = self.mediaMetadataList.filter(m =>
        fileNames.includes(m.fileName),
      );
      self.environment.metadataApi.deleteFiles(toDeleteList);
    },
    copyFilesToFl360xp: flow(function* (fileNames: string[]) {
      if (fileNames.length > 0) {
        const toMove = self.otherMediaMetadataList.filter(m =>
          fileNames.includes(m.fileName),
        );
        const result = yield self.environment.metadataApi.copyFilesToFl360xp(
          toMove,
        );
        console.log(
          `mediaMetadataStore.copyFilesToFl360xp retrieved result ${JSON.stringify(
            result,
          )}`,
        );
        return result.kind;
      }
      return true;
    }),
    removeFromTreeByFileName: function (fileName: string) {
      self.removeFromTreeByPredicate(m => m.fileName === fileName);
    },
    removeAllFromTreeByIds: async function (ids) {
      // This gets the meta data of that asset which got deleted (on basis of id)
      // const thumbnailMetaData = self.mediaMetadataList.find(m =>
      //   ids.includes(m.id),
      // );
      // This deletes the corrosponding thumbnail image of the asset from Firstlook-thumbnail if it exists
      // if (thumbnailMetaData) {
      //   const {pathName} = getThumbnailFilePath(thumbnailMetaData.fileName);
      //   if (await RNFS.exists(pathName)) {
      //     await RNFS.unlink(pathName);
      //   }
      // }
      self.removeFromTreeByPredicate(m => ids.includes(m.id));
    },
  }))
  .actions(self => ({
    afterAttach: function () {
      eventEmitter.addListener(
        RNMediaFileManagerSupportedEvents.ON_FILES_DELETED,
        self.removeAllFromTreeByIds,
      );
    },
    beforeDetach: function () {
      eventEmitter.removeAllListeners(
        RNMediaFileManagerSupportedEvents.ON_FILES_DELETED,
      );
    },
  }));

export interface MediaMetadataStore
  extends Instance<typeof MediaMetadataStoreModel> {}
export type MediaMetadataStoreType = Instance<typeof MediaMetadataStoreModel>;
