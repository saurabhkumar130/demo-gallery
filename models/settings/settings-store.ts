import { Instance, types } from "mobx-state-tree"
import {getDefaultLanguageTag, setDefaultLanguageTag} from "../../i18n/i18n"

/**
 * Model description here for TypeScript hints.
 */
export const SettingsStoreModel = types
  .model("SettingsStore")
  .props({
    backupToSdCard: types.optional(types.boolean, false),
    defaultLanguage: types.optional(
      types.string,
      getDefaultLanguageTag()
    )
  })
  .views(self => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => ({
    setBackupToSdCard: function(val: boolean): void {
      self.backupToSdCard = val
    },
    setDefaultLanguage(languageTag: string) {
      self.defaultLanguage = languageTag
      setDefaultLanguageTag(languageTag)
    },
    afterAttach: function () {
      setDefaultLanguageTag(self.defaultLanguage)
    }
  }))
// eslint-disable-line @typescript-eslint/no-unused-vars

type SettingsStoreType = Instance<typeof SettingsStoreModel>
export interface SettingsStore extends SettingsStoreType {}
