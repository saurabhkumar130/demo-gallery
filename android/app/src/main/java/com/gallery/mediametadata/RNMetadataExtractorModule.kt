package com.gallery.mediametadata

import android.Manifest
import android.content.ContentResolver
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.ExifInterface
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.ParcelFileDescriptor
import android.provider.MediaStore
import android.util.Base64
import android.util.Log
import android.util.Size
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.google.gson.GsonBuilder
import org.xmlpull.v1.XmlPullParser
import org.xmlpull.v1.XmlPullParserFactory
import java.io.ByteArrayOutputStream
import java.io.FileNotFoundException
import java.io.IOException
import java.io.StringReader
import java.nio.charset.Charset
import java.util.*
import kotlin.collections.HashMap


class RNMetadataExtractorModule(private val reactContext: ReactApplicationContext) : BaseModule(reactContext),
    NativeModule {
    override fun getName(): String {
        return "RNMetadataExtractor"
    }

    @ReactMethod
    fun getMedia(idsParam: ReadableArray, promise: Promise) {
        try {
            val ids = idsParam.toArrayList().toArray().map { o -> o.toString() }
            val data = this.getMediaInfo(ids)
            data.addedMediaMetadataList.sortedByDescending { it.date }
            val toReturn = GsonBuilder().setDateFormat(getRValue(R.string.iso_date_format)).create().toJson(data)
            Log.d(javaClass.simpleName, "toReturn: $toReturn")
            promise.resolve(toReturn)
        } catch (e: java.lang.Exception) {
            Log.e(javaClass.simpleName, "error while reading media metadata files: ", e)
            promise.reject(e)
        }
    }

    @ReactMethod
    fun getOtherMedia(promise: Promise) {
        Log.d("getOtherMedia called")
        try {
            val pathLikePredicate = " NOT LIKE ? AND" +
                    " " + MediaStore.MediaColumns.DATE_ADDED +
                    " " + ">= ? "
            val sevenDaysAgo = Calendar.getInstance()
            sevenDaysAgo.add(Calendar.DATE, -7)
            val data = this.getMediaInfo(
                Collections.emptyList(),
                pathLikePredicate,
                listOf("${sevenDaysAgo.time.time / 1000}"),
                100
            )
            data.addedMediaMetadataList.sortedByDescending { it.date }
            val toReturn = GsonBuilder().setDateFormat(getRValue(R.string.iso_date_format)).create().toJson(data)
            Log.d(javaClass.simpleName, "toReturn other: $toReturn")
            promise.resolve(toReturn)
        } catch (e: java.lang.Exception) {
            Log.e(javaClass.simpleName, "error while reading media metadata files: ", e)
            promise.reject(e)
        }
    }

    private fun getMediaInfo(
        ids: List<String>,
        pathLikePredicate: String = " LIKE ? ",
        additionalParamsAfterFolder: List<String> = listOf(),
        limit: Int? = null
    ): GetMediaResult {
        val result = GetMediaResult()

        val projection = arrayOf(
            MediaStore.MediaColumns._ID,
            MediaStore.MediaColumns.DISPLAY_NAME,
            MediaStore.MediaColumns.DATE_ADDED,
            MediaStore.MediaColumns.WIDTH,
            MediaStore.MediaColumns.HEIGHT,
            MediaStore.MediaColumns.SIZE,
            MediaStore.Files.FileColumns.MEDIA_TYPE,
            MediaStore.Files.FileColumns.RELATIVE_PATH
        )

        var selection = MediaStore.Files.FileColumns.MEDIA_TYPE + " in (?, ?) AND" +
                " ${MediaStore.Files.FileColumns.RELATIVE_PATH} " +
                pathLikePredicate

        Log.d(javaClass.simpleName, "fl360xpFolder: ${getDir()}")
        val selectionArgs = mutableListOf(
            MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE.toString(),
            MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO.toString(),
            "${getDir()}%"
        )

        selectionArgs.addAll(additionalParamsAfterFolder)

        val backupFolder = getBackupPathLastSegment()
        if (backupFolder != null) {
            selection += " AND ${MediaStore.Files.FileColumns.RELATIVE_PATH} NOT LIKE ? "
            selectionArgs.add("$backupFolder%")
        }
        Log.d(javaClass.simpleName, "selection: $selection")
        Log.d(javaClass.simpleName, "selectionArgs: $selectionArgs")

        try {
            val existingIds = mutableListOf<String>()

            val cursor = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R)
                reactContext.contentResolver.query(
                    MediaStore.Files.getContentUri("external"),
                    projection,
                    Bundle().apply {
                        // Selection
                        putString(ContentResolver.QUERY_ARG_SQL_SELECTION, selection)
                        putStringArray(
                            ContentResolver.QUERY_ARG_SQL_SELECTION_ARGS,
                            selectionArgs.toTypedArray()
                        )
                        // Sort function
                        putString(
                            ContentResolver.QUERY_ARG_SORT_COLUMNS,
                            MediaStore.Files.FileColumns.DATE_ADDED // this part does not work in android 10
                        )
                        putInt(
                            ContentResolver.QUERY_ARG_SORT_DIRECTION,
                            ContentResolver.QUERY_SORT_DIRECTION_DESCENDING
                        )
                        // limit
                        if (limit != null) {
                            putInt(ContentResolver.QUERY_ARG_LIMIT, limit)
                        }
                    },
                    null
                )
            else reactContext.contentResolver.query(
                MediaStore.Files.getContentUri("external"),
                projection,
                selection,
                selectionArgs.toTypedArray(),
                MediaStore.Files.FileColumns.DATE_ADDED + " DESC " + // Sort order.
                if (limit != null) "LIMIT $limit " else "" // TODO this seems to be ignored for some weird reason
            )


            cursor?.use { cursor ->
                val idColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID)
                val fileNameColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME)
                val dateColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_ADDED)
                val widthColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.WIDTH)
                val heightColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.HEIGHT)
                val sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE)
                val mediaTypeColumn = cursor.getColumnIndexOrThrow(MediaStore.Files.FileColumns.MEDIA_TYPE)
                val pathColumn = cursor.getColumnIndexOrThrow(MediaStore.Files.FileColumns.RELATIVE_PATH)

                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idColumn)
                    existingIds.add(id.toString())

                    if (ids.contains(id.toString())) {
                        continue
                    }

                    val mediaType = cursor.getInt(mediaTypeColumn)
                    val fileUrl = Uri.withAppendedPath(getBaseUri(mediaType), id.toString())
                    val nonMediaStoreMetadata = getNonMediaStoreMetadata(fileUrl, mediaType)

                    Log.d(javaClass.simpleName, "file path: ${cursor.getString(pathColumn)}")

                    val date = Date(cursor.getLong(dateColumn) * 1000)
                    result.addedMediaMetadataList.add(RNMediaMetadata(
                        id.toString(),
                        fileUrl.toString(),
                        cursor.getString(fileNameColumn),
                        date,
                        cursor.getInt(widthColumn),
                        cursor.getInt(heightColumn),
                        cursor.getFloat(sizeColumn),
                        nonMediaStoreMetadata.cameraModel,
                        nonMediaStoreMetadata.latitude,
                        nonMediaStoreMetadata.longitude,
                        mediaType
                    ))
                }
                result.deletedMediaMetadataIds.addAll(ids.filter { id -> !existingIds.contains(id) })
            }
        } catch (e: Exception) {
            Log.e(this.javaClass.simpleName, "Error occurred while reading", e)
            throw e
        }

        return result
    }

    private fun getNonMediaStoreMetadata(uri: Uri, mediaType: Int): NonMediaStoreMetadata {
        val startString = "XMP_"
        val endString = "<?xpacket end=\"r\"?>"
        try {
            Log.d(javaClass.simpleName, "uri: $uri")

            if (mediaType == MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE) {
                val accessMediaPermission = ActivityCompat.checkSelfPermission(
                    reactContext,
                    Manifest.permission.ACCESS_MEDIA_LOCATION
                )
                if (accessMediaPermission != PackageManager.PERMISSION_GRANTED) {
                    return NonMediaStoreMetadata(latitude = null, longitude = null, cameraModel = "N/A")
                }
            }

            reactContext.contentResolver.openInputStream(uri)?.use { stream ->
                return when (mediaType) {
                    MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE -> {
                        if (stream.available() == 0) {
                            return NonMediaStoreMetadata(latitude = null, longitude = null, cameraModel = "N/A")
                        }
                        val exifInterface = ExifInterface(stream)
                        val retrieved = FloatArray(2)
                        exifInterface.getLatLong(retrieved)
                        return NonMediaStoreMetadata(latitude = retrieved[0], longitude = retrieved[1])
                    }
                    MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO -> {
                        var xmlString = "";
                        val buffer = ByteArray(1024)
                        while (stream.read(buffer) != -1) {
                            val str = String(buffer, Charset.forName("US-ASCII"))
//                            Log.d(javaClass.simpleName, "ascii str: " + str)

                            var startIdxXml = -1
                            if (xmlString.isEmpty() && str.indexOf(startString) > -1) {
                                startIdxXml = str.indexOf(startString) + startString.length
                            } else if (xmlString.isNotEmpty()) {
                                startIdxXml = 0
                            }

                            if (startIdxXml != -1) {
                                val endIdxXml = str.indexOf(endString, startIdxXml + startString.length)
                                if (endIdxXml != -1) {
                                    xmlString += str.substring(startIdxXml, endIdxXml + endString.length)
                                    break;
                                } else {
                                    xmlString += str.substring(startIdxXml)
                                }
                            }
                        }
                        Log.d(javaClass.simpleName, "xmlString: " + xmlString)

                        val factory = XmlPullParserFactory.newInstance()
                        factory.isNamespaceAware = true
                        val xpp = factory.newPullParser()

                        xpp.setInput(StringReader(xmlString))
                        var eventType = xpp.eventType

                        val metadataMap = HashMap<String, String>()
                        var key: String? = null
                        var value: String? = null
                        while (eventType != XmlPullParser.END_DOCUMENT) {
                            if (eventType == XmlPullParser.START_TAG) {
                                key = xpp.name
                            } else if (eventType == XmlPullParser.TEXT) {
                                val text = xpp.text
                                if (text.length > 1) { //need this because value returned is not null, nor empty, non-ascii char :/ so we use size to check if text is valid
                                    value = text
                                }
                            }
                            //write the tag to metadata
                            if (key != null && value != null) {
                                metadataMap.put(key, value)
                                key = null
                                value = null
                            }
                            eventType = xpp.next()
                        }

                        val lat = metadataMap["GPSLatitude"]?.let { PopulationHelperUtils.parseGPSLatitude(it) }
                        val long = metadataMap["GPSLongitude"]?.let { PopulationHelperUtils.parseGPSLongitude(it) }
                        stream.close()
                        return NonMediaStoreMetadata(
                                latitude = lat?.toFloat(),
                                longitude = long?.toFloat(),
                                cameraModel = metadataMap["creator"] ?: "N/A"
                        )
                    }
                    else -> return NonMediaStoreMetadata(latitude = null, longitude = null, cameraModel = "not supported")
                }
            }

        } catch (e: IOException) {
            Log.e(this.javaClass.simpleName, "Error while reading media", e)
        }
        return NonMediaStoreMetadata(latitude = null, longitude = null, cameraModel = "read error")
    }

    @ReactMethod
    private fun generateThumbnail(fileUrl: String, mediaType: Int, promise: Promise) {
        Log.i(javaClass.simpleName, "generateThumbnail for $fileUrl")
        try {
            var thumbnail: Bitmap?
            val fileId = fileUrl.substring(fileUrl.lastIndexOf("/") + 1)


            when (mediaType) {
                MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE -> {
                    val uri = Uri.withAppendedPath(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, fileId)
                    thumbnail = reactContext.contentResolver.loadThumbnail(uri, Size(200, 200), null)
                }
                MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO -> {
                    val uri = Uri.withAppendedPath(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, fileId)

                    var parcel: ParcelFileDescriptor? = null
                    try {
                        parcel = reactContext.contentResolver.openFileDescriptor(uri, "r")
                        if (parcel != null) {
                            val retriever = MediaMetadataRetriever()
                            retriever.setDataSource(parcel.fileDescriptor)
                            val duration: String = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION) ?: "0"
                            val time = java.lang.Long.valueOf(duration) / 2
                            thumbnail = retriever.getFrameAtTime(time, MediaMetadataRetriever.OPTION_CLOSEST)
                        } else {
                            Log.d(javaClass.simpleName, "empty parcel! cannot generate thumbnail")
                            promise.reject("THUMBNAIL_GEN_ERROR", "Error while generating thumbnail. parcel is null.")
                            return
                        }
                    } catch (e: FileNotFoundException) {
                        Log.e(javaClass.simpleName, "fileNotFound at generateThumbnail: ", e)
                        promise.reject("THUMBNAIL_GEN_ERROR", "Error while generating thumbnail ", e)
                        return
                    } catch (e: java.lang.Exception) {
                        Log.e(javaClass.simpleName, "exception at generateThumbnail: ", e)
                        promise.reject("THUMBNAIL_GEN_ERROR", "Error while generating thumbnail ", e)
                        return
                    } finally {
                        parcel?.run { close() }
                    }
                }
                else -> {
                    throw UnsupportedOperationException("Not yet supported")
                }
            }

            if (thumbnail != null) {
                ByteArrayOutputStream().use { byteArrayOutputStream ->
                    thumbnail.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
                    val byteArray = byteArrayOutputStream.toByteArray()
                    val base64String = "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.DEFAULT)
                    byteArrayOutputStream.close()
                    promise.resolve(base64String)
                }
            } else {
                Log.d(javaClass.simpleName, "empty thumbnail resolved!")
                promise.reject("THUMBNAIL_GEN_ERROR", "Error while generating thumbnail. resolved thumbnail is null.")
            }
        } catch (e: IOException) {
            Log.e(this.javaClass.simpleName, "Error while generating thumbnail ", e)
            promise.reject("THUMBNAIL_GEN_ERROR", "Error while generating thumbnail ", e)
        }
    }

    companion object {
        private data class NonMediaStoreMetadata(val latitude: Float?, val longitude: Float?, val cameraModel: String = "N/A")
    }
}