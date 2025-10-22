package com.example.app.api;

import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface BlacklistAPI {

    @POST("blacklist")
    Call<Void> addToBlacklist(@Body Map<String, String> body);

    @DELETE("blacklist/{id}")
    Call<Void> removeFromBlacklist(@Path("id") int id);
}
