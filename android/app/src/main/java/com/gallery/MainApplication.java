package com.gallery;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.gallery.mediametadata.RNMediaMetadataPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();

          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          packages.add(new RNMediaMetadataPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }
}


// Kotlin


// package com.gallery

// import android.app.Application
// import android.content.Context
// import com.gallery.mediametadata.RNMediaMetadataPackage
// import com.facebook.react.*
// import com.facebook.soloader.SoLoader
// import java.lang.reflect.InvocationTargetException
// import com.facebook.react.bridge.JSIModulePackage

// class MainApplication : Application(), ReactApplication {
//     private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
//         override fun getUseDeveloperSupport(): Boolean {
//             return com.agilitytechnologies.fl360xp.BuildConfig.DEBUG
//         }

//         override fun getPackages(): List<ReactPackage> {
//             // Packages that cannot be autolinked yet can be added manually here, for example:
//             // packages.add(new MyReactNativePackage());
//             val packages: MutableList<ReactPackage> = PackageList(this).packages
//             packages.add(RNMediaMetadataPackage())
//             return packages
//         }

//         override fun getJSMainModuleName(): String {
//             return "index"
//         }
//     }

//     override fun getReactNativeHost(): ReactNativeHost {
//         return mReactNativeHost
//     }

//     override fun onCreate() {
//         super.onCreate()
//         SoLoader.init(this,  /* native exopackage */false)
//         initializeFlipper(this, reactNativeHost.reactInstanceManager)
//     }

//     companion object {
//         /**
//          * Loads Flipper in React Native templates. Call this in the onCreate method with something like
//          * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
//          *
//          * @param context
//          * @param reactInstanceManager
//          */
//         private fun initializeFlipper(
//                 context: Context, reactInstanceManager: ReactInstanceManager) {
//             if (com.agilitytechnologies.fl360xp.BuildConfig.DEBUG) {
//         //         try {
//         //             /*
//         //  We use reflection here to pick up the class that initializes Flipper,
//         // since Flipper library is not available in release mode
//         // */
//         //             val aClass = Class.forName("com.agilitytechnologies.fl360xp.ReactNativeFlipper")
//         //             aClass
//         //                     .getMethod("initializeFlipper", Context::class.java, ReactInstanceManager::class.java)
//         //                     .invoke(null, context, reactInstanceManager)
//         //         } catch (e: ClassNotFoundException) {
//         //             e.printStackTrace()
//         //         } catch (e: NoSuchMethodException) {
//         //             e.printStackTrace()
//         //         } catch (e: IllegalAccessException) {
//         //             e.printStackTrace()
//         //         } catch (e: InvocationTargetException) {
//         //             e.printStackTrace()
//         //         }
//             }
//         }
//     }
// }
