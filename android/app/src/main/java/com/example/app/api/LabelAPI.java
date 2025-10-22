package com.example.app.api;

import com.example.app.entities.Label;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface LabelAPI {

    @GET("labels")
    Call<List<Label>> getAllLabels();

    @POST("labels")
    Call<Label> createLabel(@Body Label label);

    @GET("labels/{id}")
    Call<Label> getLabelById(@Path("id") String  id);

    @PATCH("labels/{id}")
    Call<Label> updateLabel(@Path("id") String  id, @Body Label label);

    @DELETE("labels/{id}")
    Call<Void> deleteLabel(@Path("id") String  id);
}
