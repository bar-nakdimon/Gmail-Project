package com.example.app.api;

import com.example.app.entities.User;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;

public interface UserAPI {

    // Create a new user (register)
    @POST("users")
    Call<User> createUser(@Body User user);

    @Multipart
    @POST("users")
    Call<User> register(
            @Part("username") RequestBody username,
            @Part("password") RequestBody password,
            @Part("name") RequestBody name,
            @Part MultipartBody.Part avatar
    );


    // Get user details by ID
    @GET("users/{id}")
    Call<User> getUserById(@Path("id") int id);
}
