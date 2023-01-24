import {MediaMetadataSnapshot} from '../../models/mediaMetadata/mediaMetadata';

export interface MediaMetadataResult {
  addedMediaMetadataList: MediaMetadataSnapshot[];
  deletedMediaMetadataIds: string[];
}

export type GetMediaMetadataResult = {kind: 'ok'; data: MediaMetadataResult};
export type GetOtherMediaMetadataResult = {
  kind: 'ok';
  otherMediaMetadataList: MediaMetadataSnapshot[];
};
export type GenerateThumbnailResult = {kind: 'ok'; thumbnail: string};
export type DeleteFileResult = {kind: 'ok'};
export type MoveFileResult = {kind: 'ok'};
export type SelectBackupFolderResult = {kind: 'ok'};
