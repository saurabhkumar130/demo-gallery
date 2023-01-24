import {flow, Instance, SnapshotOut, types} from 'mobx-state-tree';
import {MediaMetadataStoreModel} from '../mediaMetadata/mediaMetadata.store';
import {SettingsStoreModel} from '../settings/settings-store';
import {withEnvironment} from '../extensions';

/**
 * A RootStore model.
 */
export const RootStoreModel = types
  .model('RootStore')
  .props({
    settingsStore: types.optional(SettingsStoreModel, {}),
    mediaMetadataStore: types.optional(MediaMetadataStoreModel, {}),
  })
  .extend(withEnvironment);
// .actions(self => ({
//   toggleBackupToSdCard: flow(function* (val: boolean) {
//     const {settingsStore, mediaMetadataStore} = self;

//     let failCode = null;
//     if (val) {
//       try {
//         yield self.environment.metadataApi.selectBackupFolder();
//         yield mediaMetadataStore.load();
//         yield self.environment.metadataApi.copyFl360FilesToBackupFolder(
//           mediaMetadataStore.mediaMetadataList.filter(
//             m => m.backupStatus !== 'backedUp',
//           ),
//         );
//       } catch (e) {
//         failCode = e.code;
//         console.log(
//           'Error occured while turning on the backup to sd card feature',
//           JSON.stringify(e),
//         );
//       }
//     } else {
//       if (mediaMetadataStore.backupInProgressList.length > 0) {
//         failCode = 'BACKUP_TURN_OFF_FAIL_BACKUP_IN_PROGRESS';
//       }
//     }

//     if (failCode == null) {
//       settingsStore.setBackupToSdCard(val);
//     }
//     return failCode;
//   }),
// }))
// .actions(self => ({
//   afterAttach: function () {
//     if (self.settingsStore.backupToSdCard) {
//       self.environment.metadataApi.copyFl360FilesToBackupFolder(
//         self.mediaMetadataStore.notYetBackedUpList,
//       );
//     }
//   },
// }));

// @ts-ignore
export interface RootStore extends Instance<typeof RootStoreModel> {}
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
