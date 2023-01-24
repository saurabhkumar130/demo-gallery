import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
// import {RootStore, setupRootStore} from './models/root-store';
import RNMetadataExtractor from './services/mediaMetadata/RNMetadataExtractor';
import {MediaMetadataResult} from './services/mediaMetadata/types';

const Hello: React.FunctionComponent<any> = () => {
  return (
    <View>
      <Text> Hello</Text>
    </View>
  );
};
export const App: React.FunctionComponent<any> = () => {
  // useNetInfo({
  //   reachabilityUrl: MAPBOX_API,
  //   reachabilityTest: async (response) => response.status >= 200 && response.status < 400,
  //   reachabilityLongTimeout: 60 * 1000,
  //   reachabilityShortTimeout: 5 * 1000,
  //   reachabilityRequestTimeout: 15 * 1000,
  // })

  // useEffect(() => {
  //   setupRootStore().then(async rootStoreVal => {
  //     setRootStore(rootStoreVal);
  //     // unsubscribeListener = await attachNetInfoListener(rootStoreVal);
  //     // await setupMap(rootStoreVal);
  //   });
  // }, []);

  const getOtherMediaMetadata = async () => {
    try {
      const otherMediasJson = await RNMetadataExtractor.getOtherMedia();
      console.log('otherMediasJson', otherMediasJson);

      const data = JSON.parse(otherMediasJson) as MediaMetadataResult;
      // data.addedMediaMetadataList.forEach(this.convertToJsDate);

      console.log('other data', data);
      return Promise.resolve({
        kind: 'ok',
        otherMediaMetadataList: data.addedMediaMetadataList,
      });
    } catch (e) {
      console.log('error while extracting the other media metadata', e);
      return Promise.reject(e);
    }
  };

  useEffect(() => {
    (async () => {
      const res = getOtherMediaMetadata();
      console.log('res', res);
    })();
  }, []);

  return (
    // <RootStoreProvider value={rootStore}>
    <Hello />
    // </RootStoreProvider>
  );
};
