import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import RNMetadataExtractor from './services/mediaMetadata/RNMetadataExtractor';
import {MediaMetadataResult} from './services/mediaMetadata/types';

const Hello: React.FunctionComponent<any> = () => {
  return (
    <View>
      <Text>Hello 123</Text>
    </View>
  );
};

function App(): JSX.Element {
  const getOtherMediaMetadata = async () => {
    try {
      console.log('calling from native module');
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
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
