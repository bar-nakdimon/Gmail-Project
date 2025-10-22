package com.example.app.repositories;

import android.content.Context;
import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.app.api.MailAPI;
import com.example.app.auth.SessionManager;
import com.example.app.entities.BlacklistResponse;
import com.example.app.entities.CheckResponse;
import com.example.app.entities.Mail;
import com.example.app.entities.MailLabel;
import com.example.app.utils.RetrofitClient;
import com.example.app.utils.UrlUtils;
import com.example.app.entities.BlacklistResponse;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MailRepository {
    private final MailAPI mailApi;
    private final SessionManager sessionManager;

    public MailRepository(Context context) {
        this.mailApi = RetrofitClient
                .getAuthenticatedInstance(context)
                .create(MailAPI.class);
        this.sessionManager = new SessionManager(context);
    }

    //  Get inbox using JWT token
    public LiveData<List<Mail>> getInbox() {
        MutableLiveData<List<Mail>> liveData = new MutableLiveData<>();
        String token = sessionManager.getToken();

        mailApi.getInbox("Bearer " + token).enqueue(new Callback<List<Mail>>() {
            @Override
            public void onResponse(Call<List<Mail>> call, Response<List<Mail>> response) {
                if (response.isSuccessful()) {
                    liveData.setValue(response.body());
                } else {
                    Log.e("MailRepo", "Inbox response failed. Code: " + response.code());
                    liveData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<Mail>> call, Throwable t) {
                Log.e("MailRepo", "Inbox request failed: " + t.getMessage(), t);
                liveData.setValue(null);
            }
        });

        return liveData;
    }

    // Send mail using JWT token
    public void sendMail(Mail mail, Callback<ResponseBody> callback) {
        String token = sessionManager.getToken();
        mailApi.createMail(mail, "Bearer " + token).enqueue(callback);
    }

    // Get a single mail by ID
    public LiveData<Mail> getMailById(int mailId) {
        MutableLiveData<Mail> liveData = new MutableLiveData<>();
        String token = sessionManager.getToken();

        mailApi.getMailById("Bearer " + token, mailId)
                .enqueue(new Callback<Mail>() {
                    @Override
                    public void onResponse(Call<Mail> call, Response<Mail> response) {
                        if (response.isSuccessful()) {
                            liveData.setValue(response.body());
                        } else {
                            Log.e("MailRepo", "Mail by ID failed. Code: " + response.code());
                            liveData.setValue(null);
                        }
                    }

                    @Override
                    public void onFailure(Call<Mail> call, Throwable t) {
                        Log.e("MailRepo", "getMailById failed: " + t.getMessage(), t);
                        liveData.setValue(null);
                    }
                });

        return liveData;
    }

    /**
     * Trash or permanently delete a mail based on its current labels.
     */
    public void trashOrDeleteMail(Mail mail, Callback<Void> cb) {
        String token = sessionManager.getToken();
        boolean inTrash = false;
        if (mail.getLabels() != null) {
            for (MailLabel l : mail.getLabels()) {
                if ("trash".equalsIgnoreCase(l.getId())) {
                    inTrash = true;
                    break;
                }
            }
        }

        if (inTrash) {
            // permanently delete
            mailApi.deleteMail("Bearer " + token, mail.getId())
                    .enqueue(cb);
        } else {
            // add "trash" label
            List<String> ids = new ArrayList<>();
            if (mail.getLabels() != null) {
                for (MailLabel l : mail.getLabels()) {
                    ids.add(l.getId());
                }
            }
            ids.add("trash");

            Map<String,Object> body = new HashMap<>();
            body.put("labels", ids);

            mailApi.updateMailLabels("Bearer " + token, mail.getId(), body)
                    .enqueue(cb);
        }
    }

    // Toggle read/unread label
    public void toggleReadMail(Mail mail, Callback<Void> cb) {
        String token = sessionManager.getToken();
        List<String> current = new ArrayList<>();
        if (mail.getLabels() != null) {
            for (MailLabel l : mail.getLabels()) {
                current.add(l.getId());
            }
        }

        boolean isRead = current.contains("read");
        List<String> updated = new ArrayList<>(current);
        if (isRead) {
            updated.remove("read");
            if (!updated.contains("unread")) updated.add("unread");
        } else {
            updated.remove("unread");
            if (!updated.contains("read"))   updated.add("read");
        }

        Map<String,Object> body = new HashMap<>();
        body.put("labels", updated);
        mailApi.updateMailLabels("Bearer " + token, mail.getId(), body)
                .enqueue(cb);
    }

    public LiveData<List<MailLabel>> getAllLabels() {
        MutableLiveData<List<MailLabel>> live = new MutableLiveData<>();
        String token = sessionManager.getToken();

        mailApi.getAllLabels("Bearer " + token)
                .enqueue(new Callback<List<MailLabel>>() {
                    @Override public void onResponse(
                            Call<List<MailLabel>> c,
                            Response<List<MailLabel>> r
                    ) {
                        if (r.isSuccessful() && r.body() != null) {
                            live.setValue(r.body());
                        } else {
                            live.setValue(Collections.emptyList());
                        }
                    }
                    @Override public void onFailure(
                            Call<List<MailLabel>> c, Throwable t
                    ) {
                        Log.e("MailRepo", "getAllLabels failed", t);
                        live.setValue(Collections.emptyList());
                    }
                });
        return live;
    }

    public void updateMail(Mail mail, Callback<Mail> callback) {
        String token = sessionManager.getToken();
        mailApi.updateMail("Bearer " + token, mail.getId(), mail)
                .enqueue(callback);
    }

    public void createDraft(Mail draft, Callback<ResponseBody> cb) {
        String token = sessionManager.getToken();
        mailApi.createMail(draft, "Bearer " + token).enqueue(cb);
    }

    public void updateMailLabels(int mailId, List<String> labels, Callback<Void> cb) {
        String token = sessionManager.getToken();
        Map<String,Object> body = new HashMap<>();
        body.put("labels", labels);
        mailApi.updateMailLabels("Bearer " + token, mailId, body)
                .enqueue(cb);
    }

    public void fetchMailById(int mailId, Callback<Mail> cb) {
        String token = sessionManager.getToken();
        mailApi.getMailById("Bearer " + token, mailId)
                .enqueue(cb);
    }

    //  Permanently delete a mail
    public void deleteMail(int mailId, Callback<Void> callback) {
        String token = sessionManager.getToken();
        mailApi.deleteMail("Bearer " + token, mailId)
                .enqueue(callback);
    }

    public void addToBlacklist(String url, Callback<BlacklistResponse> cb) {
        String tok = "Bearer " + sessionManager.getToken();
        Map<String,String> body = new HashMap<>();
        body.put("url", url);
        mailApi.addToBlacklist(tok, body).enqueue(cb);
    }

    // Check whether a URL is blacklisted
    public void isUrlBlacklisted(String url, Callback<CheckResponse> cb) {
        String tok = "Bearer " + sessionManager.getToken();
        mailApi.isUrlBlacklisted(tok, url).enqueue(cb);
    }

    public void removeFromBlacklist(int blacklistId, Callback<Void> cb) {
        String token = sessionManager.getToken();
        mailApi.removeFromBlacklist("Bearer " + token, blacklistId)
                .enqueue(cb);
    }



}
