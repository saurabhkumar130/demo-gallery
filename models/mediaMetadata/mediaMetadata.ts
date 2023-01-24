import {flow, Instance, SnapshotOut, types} from 'mobx-state-tree';
import {withMapBoxApiStatus} from './with-mapbox-api-status';
import {withEnvironment} from '../extensions';
import {withThumbnail} from './with-thumbnail';

export const DEFAULT_ADDRESS = 'N/A';

export enum MediaType {
  IMG = 1,
  IMG_360 = 2,
  VIDEO = 3,
  VIDEO_EQ = 4,
}

export type BackupStatusType =
  | 'notBackedUp'
  | 'backingUp'
  | 'backedUp'
  | 'backupFailed';

export const MediaMetadataModel = types
  .model('MediaMetadataModel', {
    id: types.identifier,
    fileUrl: types.string,
    fileName: types.string,
    date: types.Date,
    resolutionX: types.number,
    resolutionY: types.number,
    fileSize: types.number,
    cameraModel: types.string,
    latitude: types.maybeNull(types.number),
    longitude: types.maybeNull(types.number),
    approximateAddress: types.optional(types.string, DEFAULT_ADDRESS),
    type: types.number,
    duration: types.number,
    backupStatus: types.optional(types.string, 'notBackedUp'),
  })
  .views(self => ({
    get isPlottable() {
      return self.longitude != null && self.latitude != null;
    },
    get isVideo() {
      return self.type === MediaType.VIDEO || self.type === MediaType.VIDEO_EQ;
    },
    get isImage() {
      return self.type === MediaType.IMG || self.type === MediaType.IMG_360;
    },
    isEqualTo(other?: any) {
      // ensure that identifier is used for comparison
      if (other == null) {
        return false;
      }

      return self.id === other.id;
    },
  }))
  .extend(withEnvironment)
  .extend(withMapBoxApiStatus)
  .extend(withThumbnail)
  .actions(self => ({
    setBackupStatus: function (val: BackupStatusType) {
      self.backupStatus = val;
    },
    // reverseGeocode: flow(function* () {
    //   if (self.isPlottable && self.approximateAddress === DEFAULT_ADDRESS) {
    //     self.setStatus('reverseGeocodingPending');
    //     try {
    //       const result = yield self.environment.mapBoxApi.getApproximateAddress(
    //         self.latitude,
    //         self.longitude,
    //       );
    //       if (result.kind === 'ok') {
    //         self.approximateAddress = result.address;
    //         console.log(`self.approximateAddress : ${self.approximateAddress}`);
    //         self.setStatus('reverseGeocodingDone');
    //       } else {
    //         throw new Error(
    //           `error while trying reverse geocoding, kind: ${result.kind}`,
    //         );
    //       }
    //     } catch (e) {
    //       console.log('error in geocoding', e);
    //       self.setStatus('reverseGeocodingError');
    //     }
    //   }
    // }),
    generateThumbnail: flow(function* () {
      if (self.thumbnail === null) {
        self.setThumbnailStatus('pending');
        try {
          const result = yield self.environment.metadataApi.generateThumbnail(
            self as any,
          );
          if (result.kind === 'ok') {
            self.thumbnail = result.thumbnail;
          } else {
            // console.log(`failed to generate thumbnail. result: ${JSON.stringify(result)}`)
          }
        } catch (e) {
          console.log('error while calling api.', e);
        } finally {
          self.setThumbnailStatus('done');
        }
      }
    }),
  }));

type MediaMetadataType = Instance<typeof MediaMetadataModel>;
export interface MediaMetadata extends MediaMetadataType {}
type MediaMetadataSnapshotType = SnapshotOut<typeof MediaMetadataModel>;
export interface MediaMetadataSnapshot extends MediaMetadataSnapshotType {}
