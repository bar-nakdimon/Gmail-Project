package com.example.app.repositories;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.app.api.BlacklistAPI;
import com.example.app.utils.RetrofitClient;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BlacklistRepository {
    private final BlacklistAPI api;

    public BlacklistRepository(Context context) {
        this.api = RetrofitClient.getAuthenticatedInstance(context).create(BlacklistAPI.class);
    }

    public LiveData<Boolean> addToBlacklist(String url) {
        MutableLiveData<Boolean> result = new MutableLiveData<>();

        Map<String, String> body = new HashMap<>();
        body.put("url", url);

        api.addToBlacklist(body).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                result.postValue(response.isSuccessful());
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                result.postValue(false);
            }
        });

        return result;
    }

    public LiveData<Boolean> removeFromBlacklist(int id) {
        MutableLiveData<Boolean> result = new MutableLiveData<>();

        api.removeFromBlacklist(id).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                result.postValue(response.isSuccessful());
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                result.postValue(false);
            }
        });

        return result;
    }
}
