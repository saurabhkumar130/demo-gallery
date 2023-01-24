import { MediaMetadataApi } from "../services/mediaMetadata/mediaMetadataApi"
import { MapBoxApi } from "../services/mapbox/mapboxApi"

let ReactotronDev
if (__DEV__) {
  const { Reactotron } = require("../services/reactotron")
  ReactotronDev = Reactotron
}

/**
 * The environment is a place where services and shared dependencies between
 * models live.  They are made available to every model via dependency injection.
 */
export class Environment {
  constructor() {
    // create each service
    if (__DEV__) {
      // dev-only services
      this.reactotron = new ReactotronDev()
    }
    this.metadataApi = new MediaMetadataApi()
    this.mapBoxApi = new MapBoxApi()
  }

  async setup() {
    // allow each service to setup
    if (__DEV__) {
      await this.reactotron.setup()
    }
    await this.metadataApi.setup()
    await this.mapBoxApi.setup()
  }

  /**
   * Reactotron is only available in dev.
   */
  reactotron: typeof ReactotronDev

  /**
   * Our api.
   */
  metadataApi: MediaMetadataApi

  mapBoxApi: MapBoxApi
}
