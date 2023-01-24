import {getSnapshot, onSnapshot} from 'mobx-state-tree';
import {RootStoreModel, RootStore} from './root-store';
import {Environment} from '../environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IModelType} from 'mobx-state-tree/dist/types/complex-types/model';
import _ from 'lodash';
import {MediaMetadataStoreModel} from '../mediaMetadata/mediaMetadata.store';

/**
 * Setup the environment that all the models will be sharing.
 *
 * The environment includes other functions that will be picked from some
 * of the models that get created later. This is how we loosly couple things
 * like events between models.
 */
export async function createEnvironment() {
  const env = new Environment();
  await env.setup();
  return env;
}

// ensure that values here corresponds in root-store.ts
// key = the name of the prop of the parent (e.g. rootStore.mediaMetadataStore
// value = the model where it will create a snapshot against
const saveEachPropsAsOwnStorage = {
  mediaMetadataStore: MediaMetadataStoreModel,
};

const ignoreList = ['cameraStore'];
// END: ensure that values here corresponds in root-store.ts

// async function loadSnapshot(Store: IModelType<any, any>): Promise<any | null> {
//   const snapshot = _.cloneDeep(getSnapshot(Store.create({})));
//   let keys = await AsyncStorage.getAllKeys();

//   for (let x = 0; x < keys.length; x++) {
//     const key = keys[x];
//     if (_.has(snapshot, key)) {
//       try {
//         const saved = await AsyncStorage.getItem(key);
//         // console.log(`saved ${key}`, saved)
//         const parsed = JSON.parse(saved);
//         // console.log(`parsed ${key}`, parsed)
//         snapshot[key] = parsed;
//       } catch (e) {
//         console.log(`error while loading the storage for key: ${key}`, e);
//       }
//     } else {
//       console.log(`${Store.name} has no property ${key}, ignoring....`);
//     }
//   }

//   keys = Object.keys(saveEachPropsAsOwnStorage);
//   for (let x = 0; x < keys.length; x++) {
//     const key = keys[x];
//     // if (_.has(snapshot, key)) {
//     //   snapshot[key] = await loadSnapshot(saveEachPropsAsOwnStorage[key]);
//     //   console.log(`${Store.name}.${key} loaded successfully...`);
//     // }
//   }

//   // console.log(`to return snapshot, ${JSON.stringify(snapshot)}`)
//   return snapshot;
// }

// async function saveSnapshot(snapshot: any): Promise<boolean> {
//   const keys = Object.keys(snapshot);
//   console.log('store properties to be used as keys', keys);

//   let atLeastSavedOne = false;
//   for (let x = 0; x < keys.length; x++) {
//     const key = keys[x];
//     try {
//       if (_.has(saveEachPropsAsOwnStorage, key)) {
//         console.log(`${key} props will be saved in its own...`);
//         await saveSnapshot(snapshot[key]);
//       } else if (!ignoreList.includes(key)) {
//         const toSave = snapshot[key];
//         // console.log(`saving ${key} as a whole`, toSave)
//         await AsyncStorage.setItem(key, JSON.stringify(toSave));
//       }
//       atLeastSavedOne = true;
//     } catch (e) {
//       console.log('error while saving to the storage', e);
//     }
//   }
//   return atLeastSavedOne;
// }

/**
 * Setup the root state.
 */
export async function setupRootStore() {
  let rootStore: RootStore;
  let data: any;

  // prepare the environment that will be associated with the RootStore.
  const env = await createEnvironment();
  rootStore = RootStoreModel.create({}, env);

  try {
    // load data from storage
    // const retrieved = await loadSnapshot(RootStoreModel);
    // console.log(`rootstore retrieved in storage ${JSON.stringify(retrieved)}`)
    // data = retrieved || {};
    // rootStore = RootStoreModel.create(data, env);
  } catch (e) {
    // if there's any problems loading, then let's at least fallback to an empty state
    // instead of crashing.
    rootStore = RootStoreModel.create({}, env);

    // but please inform us what happened
    __DEV__ && console.tron.error(e.message, null);
  }

  // reactotron logging
  // if (__DEV__) {
  //   env.reactotron.setRootStore(rootStore, data);
  // }

  // const debouncedSaveSnapshot = _.debounce(async function (snapshot) {
  //   // console.log("snapshot to be saved", snapshot)

  //   const failedBackups = rootStore.mediaMetadataStore.failedBackups;
  //   if (failedBackups.length >= 5 && rootStore.settingsStore.backupToSdCard) {
  //     rootStore.settingsStore.setBackupToSdCard(false);
  //     snapshot.settingsStore.backupToSdCard = false;
  //   }

  //   const result = await saveSnapshot(snapshot);
  //   console.log('snapshot save result', result);
  // }, 100);

  // track changes & save to storage
  // onSnapshot(rootStore, async snapshot => {
  //   console.log('onSnapshot before debounce');
  //   // await debouncedSaveSnapshot(snapshot);
  // });

  return rootStore;
}
