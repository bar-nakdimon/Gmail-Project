package com.example.app.auth;

import android.content.Context;
import android.util.Log;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class AuthInterceptor implements Interceptor {

    private final SessionManager sessionManager;

    public AuthInterceptor(Context context) {
        this.sessionManager = new SessionManager(context);
    }

    @Override
    public Response intercept(Chain chain) throws IOException {
        Log.d("AuthInterceptor", "Interceptor activated");
        Request originalRequest = chain.request();
        String token = sessionManager.getToken();
        int userId = sessionManager.getUserId();

        if (token != null && userId != -1) {
            Request request = originalRequest.newBuilder()
                    .header("Authorization", "Bearer " + token)
                    .header("x-user-id", String.valueOf(userId))
                    .build();
            return chain.proceed(request);
        }

        return chain.proceed(originalRequest);
    }

}
