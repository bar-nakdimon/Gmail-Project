package com.example.app.repositories;

import android.content.Context;
import android.net.Uri;
import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.app.api.UserAPI;
import com.example.app.entities.User;
import com.example.app.utils.RetrofitClient;

import java.io.InputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserRepository {

    private final UserAPI userAPI;

    public UserRepository(Context context) {
        userAPI = RetrofitClient.getUnauthenticatedInstance(context).create(UserAPI.class);
        Log.d("UserRepository", "Using unauthenticated Retrofit instance for registration");
    }

    public LiveData<User> createUser(User user) {
        MutableLiveData<User> userData = new MutableLiveData<>();

        userAPI.createUser(user).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if (response.isSuccessful()) {
                    userData.setValue(response.body());
                } else {
                    userData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                userData.setValue(null);
            }
        });

        return userData;
    }

    /**
     *
     * @param username 
     * @param password 
     * @param name     
     * @param avatarFileUri 
     */
    public LiveData<Boolean> register(String username, String password, String name, Uri avatarFileUri, Context context) {
        MutableLiveData<Boolean> result = new MutableLiveData<>();

        RequestBody usernameBody = RequestBody.create(MediaType.parse("text/plain"), username);
        RequestBody passwordBody = RequestBody.create(MediaType.parse("text/plain"), password);
        RequestBody nameBody = RequestBody.create(MediaType.parse("text/plain"), name);

        MultipartBody.Part avatarPart = null;

        if (avatarFileUri != null) {
            try {
                InputStream inputStream = context.getContentResolver().openInputStream(avatarFileUri);
                byte[] bytes = new byte[inputStream.available()];
                inputStream.read(bytes);
                inputStream.close();

                RequestBody requestFile = RequestBody.create(MediaType.parse("image/*"), bytes);

                avatarPart = MultipartBody.Part.createFormData(
                        "avatar",
                        "profile.jpg",
                        requestFile
                );

                Log.d("REGISTER", "Avatar file prepared, size: " + bytes.length);

            } catch (Exception e) {
                Log.e("REGISTER", "Error reading image URI", e);
            }
        }

        Log.d("REGISTER", "Sending multipart: " + username);

        userAPI.register(usernameBody, passwordBody, nameBody, avatarPart).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                Log.d("REGISTER", "onResponse - success: " + response.isSuccessful());
                result.setValue(response.isSuccessful());
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                Log.e("REGISTER", "onFailure", t);
                result.setValue(false);
            }
        });

        return result;
    }

    public LiveData<User> getUserById(int id) {
        MutableLiveData<User> userData = new MutableLiveData<>();

        userAPI.getUserById(id).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if (response.isSuccessful()) {
                    userData.setValue(response.body());
                } else {
                    userData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                userData.setValue(null);
            }
        });

        return userData;
    }
}
