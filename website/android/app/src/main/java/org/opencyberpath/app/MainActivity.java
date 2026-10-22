package org.opencyberpath.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Keep the manifest launch theme for the system splash, then use the
        // regular app theme before Capacitor creates the WebView and popups.
        setTheme(R.style.AppTheme_NoActionBar);
        super.onCreate(savedInstanceState);
        if (BuildConfig.DEBUG && getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
    }
}
