package com.example.app.utils;

import android.content.Context;

import com.example.app.R;

import java.io.InputStream;
import java.util.Properties;

public class ConfigManager {
    private final Properties properties;

    public ConfigManager(Context context) {
        properties = new Properties();
        try {
            InputStream inputStream = context.getResources().openRawResource(R.raw.config);
            properties.load(inputStream);
            inputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String getIpAddress() {
        return properties.getProperty("ip_address", "10.0.2.2"); // Default fallback
    }

    public String getPort() {
        return properties.getProperty("port", "3000"); // Default fallback
    }

    public String getJwtSecret() {
        return properties.getProperty("jwt_secret", "");
    }
}
