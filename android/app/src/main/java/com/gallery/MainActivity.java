package com.gallery;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "gallery";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
        // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
        );
  }
}





// package com.gallery

// import android.Manifest
// import android.app.Activity
// import android.content.Context
// import android.content.Intent
// import android.content.pm.PackageManager
// import android.content.res.Configuration
// import android.os.Build
// import android.os.Bundle
// import android.util.Log
// import android.widget.Toast
// import androidx.core.app.ActivityCompat
// import androidx.documentfile.provider.DocumentFile
// import com.facebook.react.ReactActivity
// import com.facebook.react.ReactActivityDelegate
// import com.facebook.react.ReactRootView
// import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView


// class MainActivity : ReactActivity() {
//     override fun createReactActivityDelegate(): ReactActivityDelegate {
//         return object : ReactActivityDelegate(this, mainComponentName) {
//             override fun createRootView(): ReactRootView {
//                 return RNGestureHandlerEnabledRootView(this@MainActivity)
//             }
//         }
//     }

//     /**
//      * Returns the name of the main component registered from JavaScript. This is used to schedule
//      * rendering of the component.
//      */
//     override fun getMainComponentName(): String {
//         return "gallery"
//     }

//     override fun onCreate(savedInstanceState: Bundle?) {
//         super.onCreate(savedInstanceState)
//         askMediaPermissionsIfNeeded()
//     }

//     private fun askMediaPermissionsIfNeeded() {
//         val permissions = listOf(
//             Manifest.permission.READ_EXTERNAL_STORAGE,
//             Manifest.permission.ACCESS_MEDIA_LOCATION
//         )

//         if (!isHasPermission(*permissions.toTypedArray())) {
//             askPermission(ACCESS_MEDIA_LOCATION_REQUEST_CODE, *permissions.toTypedArray())
//         }
//     }

//     private fun isHasPermission(vararg permissions: String?): Boolean {
//         var permissionFlag = true
//         for (singlePermission in permissions) {
//             permissionFlag = permissionFlag && applicationContext.checkSelfPermission(singlePermission!!) == PackageManager.PERMISSION_GRANTED
//         }
//         return permissionFlag
//     }

//     private fun askPermission(requestCode: Int, vararg permissions: String?) {
//         ActivityCompat.requestPermissions(this, permissions, requestCode)
//     }

//     override fun onActivityResult(requestCode: Int, resultCode: Int, intent: Intent?) {
//         super.onActivityResult(requestCode, resultCode, intent)
//         Log.w(javaClass.simpleName, "onActivityResult: $requestCode")
//         /*
//         when (requestCode) {
//             else -> {
//                 Log.w(javaClass.simpleName, "$requestCode not supported by MainActivity")
//             }
//         }
//          */
//     }


//     override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
//         super.onRequestPermissionsResult(requestCode, permissions, grantResults)
//         Log.w(javaClass.simpleName, "onRequestPermissionsResult: $requestCode")
//         when (requestCode) {
//             ACCESS_MEDIA_LOCATION_REQUEST_CODE -> {
//                 if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
//                     Log.i(javaClass.simpleName, "ACCESS_MEDIA_LOCATION granted.")
//                 } else {
//                     Toast.makeText(this, "App was not granted to read photo location metadata.", Toast.LENGTH_LONG).show()
//                 }
//             }
//             else -> {
//                 Log.w(javaClass.simpleName, "$requestCode not supported")
//             }
//         }
//     }

//     companion object {
//         private const val ACCESS_MEDIA_LOCATION_REQUEST_CODE = 360
//         const val DELETE_FILE_REQUEST_CODE = 361
//         const val SELECT_BACKUP_FOLDER_REQUEST_CODE = 362
//         const val TRASH_FILE_REQUEST_CODE = 363
//         const val INTERNET_CONNECTIVITY = 364
//     }
// }