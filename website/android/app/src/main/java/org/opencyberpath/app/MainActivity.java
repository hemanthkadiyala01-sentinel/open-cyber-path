package org.opencyberpath.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Keep the manifest launch theme for the system splash, then use the
        // regular app theme before Capacitor creates the WebView and popups.
        setTheme(R.style.AppTheme_NoActionBar);
        super.onCreate(savedInstanceState);
    }
}
