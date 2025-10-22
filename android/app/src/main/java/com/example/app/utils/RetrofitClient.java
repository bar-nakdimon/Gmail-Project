package com.example.app.utils;

import android.content.Context;
import android.util.Log;

import com.example.app.auth.AuthInterceptor;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;    
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {
    private static Retrofit authRetrofit = null;
    private static Retrofit unauthRetrofit = null;
    private static String currentBaseUrl = null;

    private static String getBaseUrl(Context context) {
        ConfigManager configManager = new ConfigManager(context);
        return "http://" + configManager.getIpAddress() + ":" + configManager.getPort() + "/api/";
    }

    public static Retrofit getAuthenticatedInstance(Context context) {
        String baseUrl = getBaseUrl(context);
        if (authRetrofit == null || !baseUrl.equals(currentBaseUrl)) {
            Log.d("RetrofitClient", "Creating new AUTHENTICATED Retrofit instance with baseUrl: " + baseUrl);
            currentBaseUrl = baseUrl;

            //  Create and configure logging interceptor
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor(message -> Log.d("HTTP", message));
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            //  Build OkHttpClient with Auth + Logging
            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(new AuthInterceptor(context))
                    .addInterceptor(logging)            
                    .build();

            authRetrofit = new Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return authRetrofit;
    }

    public static Retrofit getUnauthenticatedInstance(Context context) {
        String baseUrl = getBaseUrl(context);
        if (unauthRetrofit == null || !baseUrl.equals(currentBaseUrl)) {
            Log.d("RetrofitClient", "Creating new UNAUTHENTICATED Retrofit instance with baseUrl: " + baseUrl);
            currentBaseUrl = baseUrl;

            HttpLoggingInterceptor logging = new HttpLoggingInterceptor(message -> Log.d("HTTP", message));
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(logging)           
                    .build();

            unauthRetrofit = new Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return unauthRetrofit;
    }

    public static void reset() {
        authRetrofit = null;
        unauthRetrofit = null;
        currentBaseUrl = null;
    }
}
