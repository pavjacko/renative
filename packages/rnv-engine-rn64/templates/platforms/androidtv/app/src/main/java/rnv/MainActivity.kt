package {{APPLICATION_ID}}

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView

{{PLUGIN_ACTIVITY_IMPORTS}}

/**
 * Created by ReNative (https://renative.org)
 */

class MainActivity : ReactActivity() {
    override fun getMainComponentName(): String? = "App"

    override fun onCreate(savedInstanceState: Bundle?) {
        {{INJECT_ON_CREATE}}
        {{PLUGIN_ON_CREATE}}
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        {{PLUGIN_ON_ACTIVITY_RESULT}}
    }

    override fun onNewIntent(intent:Intent) {
      setIntent(intent)
      super.onNewIntent(intent)
    }

    {{PLUGIN_ACTIVITY_METHODS}}
}
