package com.example.app.repositories;

import android.content.Context;
import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.auth0.android.jwt.JWT;
import com.example.app.api.TokenAPI;
import com.example.app.api.UserAPI;
import com.example.app.entities.User;
import com.example.app.auth.LoginResponse;
import com.example.app.utils.RetrofitClient;
import com.example.app.auth.SessionManager;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class TokenRepository {
    private final TokenAPI tokenAPI;
    private final SessionManager sessionManager;
    private final Context context;

    public TokenRepository(Context context) {
        this.context = context; 
        tokenAPI = RetrofitClient.getUnauthenticatedInstance(context).create(TokenAPI.class);
        sessionManager = new SessionManager(context);
    }

    public LiveData<LoginResponse> login(String username, String password) {
        MutableLiveData<LoginResponse> loginData = new MutableLiveData<>();

        Map<String, String> credentials = new HashMap<>();
        credentials.put("username", username);
        credentials.put("password", password);

        tokenAPI.login(credentials).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse loginResponse = response.body();

                    String token = loginResponse.getToken();
                    JWT jwt = new JWT(token);
                    String userIdString = jwt.getClaim("userId").asString();
                    int userId = -1;

                    try {
                        userId = Integer.parseInt(userIdString);
                    } catch (NumberFormatException e) {
                        Log.e("TokenRepository", "Invalid userId in JWT: " + userIdString);
                    }

                    Log.d("TokenRepository", "Decoded userId from token: " + userId);

                    UserAPI userAPI = RetrofitClient.getAuthenticatedInstance(context).create(UserAPI.class);
                    int finalUserId = userId; 
                    userAPI.getUserById(userId).enqueue(new Callback<User>() {
                        @Override
                        public void onResponse(Call<User> call, Response<User> userResponse) {
                            if (userResponse.isSuccessful() && userResponse.body() != null) {
                                String name = userResponse.body().getName();
                                String avatarUrl = userResponse.body().getAvatarUrl();
                                Log.d("TokenRepository", "Avatar URL from API: " + avatarUrl);

                                sessionManager.saveLoginData(
                                        token,
                                        finalUserId,
                                        username,
                                        name,
                                        avatarUrl
                                );

                                Log.d("TokenRepository", "Got name from API: " + name);

                                loginData.postValue(loginResponse);
                            } else {
                                Log.e("TokenRepository", "Failed to get user details for name");
                                loginData.postValue(null);
                            }
                        }

                        @Override
                        public void onFailure(Call<User> call, Throwable t) {
                            Log.e("TokenRepository", "Error calling getUserById", t);
                            loginData.postValue(null);
                        }
                    });

                } else {
                    loginData.postValue(null);
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                loginData.postValue(null);
            }
        });

        return loginData;
    }

    public void logout() {
        sessionManager.clearAll();
    }

    public String getSavedToken() {
        return sessionManager.getToken();
    }

    public int getSavedUserId() {
        return sessionManager.getUserId();
    }

    public String getSavedUsername() {
        return sessionManager.getUsername();
    }

    public String getSavedName() {
        return sessionManager.getName();
    }
}
