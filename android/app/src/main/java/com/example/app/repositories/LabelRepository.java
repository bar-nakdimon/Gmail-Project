package com.example.app.repositories;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.app.api.LabelAPI;
import com.example.app.entities.Label;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import android.util.Log;

public class LabelRepository {

    private final LabelAPI labelAPI;
    private final int userId;
    private static final String TAG = "LabelRepository";

    public LabelRepository(LabelAPI labelAPI, int userId) {
        this.labelAPI = labelAPI;
        this.userId = userId;
    }

    public LiveData<List<Label>> getAllLabels() {
        MutableLiveData<List<Label>> data = new MutableLiveData<>();

        labelAPI.getAllLabels().enqueue(new Callback<>() {
            @Override
            public void onResponse(Call<List<Label>> call, Response<List<Label>> response) {
                if (response.isSuccessful()) {
                    List<Label> labels = response.body();
                    if (labels != null) {
                        Log.d(TAG, "✅ SUCCESS → size = " + labels.size());
                        for (Label l : labels) {
                            Log.d(TAG, "→ Label ID: " + l.getId() + ", Name: " + l.getName());
                        }
                    } else {
                        Log.w(TAG, "⚠️ SUCCESS → body is NULL");
                    }
                    data.setValue(labels);
                } else {
                    Log.e(TAG, "❌ RESPONSE NOT SUCCESSFUL → code = " + response.code());
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<Label>> call, Throwable t) {
                Log.e(TAG, "❌ FAILURE → " + t.getMessage());
                data.setValue(null);
            }
        });

        return data;
    }

    public void createLabel(Label label, Callback<Label> callback) {
        labelAPI.createLabel(label).enqueue(callback);
    }

    public void updateLabel(String  id, Label label, Callback<Label> callback) {
        labelAPI.updateLabel(id, label).enqueue(callback);
    }

    public void deleteLabel(String  id, Callback<Void> callback) {
        labelAPI.deleteLabel(id).enqueue(callback);
    }
}
