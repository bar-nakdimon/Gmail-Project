package com.example.app.api;

import com.example.app.auth.LoginResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import java.util.Map;

public interface TokenAPI {
    @POST("tokens")
    Call<LoginResponse> login(@Body Map<String, String> credentials);
}
