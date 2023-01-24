import { observable, IObservableValue } from "mobx"

export type ThumbnailStatusType = "idle" | "pending" | "done"

export const withThumbnail = () => {
  const thumbnail: IObservableValue<string> = observable.box(null)
  const thumbnailStatus: IObservableValue<ThumbnailStatusType> = observable.box("idle")

  return {
    views: {
      get thumbnail() {
        return thumbnail.get()
      },
      get thumbnailStatus() {
        return thumbnailStatus.get()
      },
      set thumbnail(value: string) {
        thumbnail.set(value)
      },
      set thumbnailStatus(value: ThumbnailStatusType) {
        thumbnailStatus.set(value)
      }
    },
    actions: {
      setThumbnail(value: string) {
        thumbnail.set(value)
      },
      setThumbnailStatus(value: ThumbnailStatusType) {
        thumbnailStatus.set(value)
      }
    },
  }
}
