package com.example.app.api;


import com.example.app.entities.Mail;
import com.example.app.entities.MailLabel;
import com.example.app.entities.BlacklistResponse;
import com.example.app.entities.CheckResponse;

import java.util.List;
import java.util.Map;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PATCH;
import retrofit2.http.Path;
import retrofit2.http.Query;


public interface MailAPI {

    //  GET /api/mails (inbox)
    @GET("mails")
    Call<List<Mail>> getInbox(@Header("Authorization") String token);

    //  GET /api/mails/search/:query
    @GET("mails/search/{query}")
    Call<List<Mail>> searchMails(@Header("Authorization") String token, @Path("query") String query);

    // GET /api/mails/:id
    @GET("mails/{id}")
    Call<Mail> getMailById(@Header("Authorization") String token, @Path("id") int mailId);

    //  POST /api/mails
    // AFTER
    @POST("mails")
    Call<ResponseBody> createMail(@Body Mail mail, @Header("Authorization") String token);

    @PATCH("mails/{id}")
    Call<Mail> updateMail(@Header("Authorization") String token, @Path("id") int mailId, @Body Mail updatedFields);



    //  PATCH /api/mails/:id
    @PATCH("mails/{id}")
    Call<Void> updateMailLabels(
            @Header("Authorization") String token,
            @Path("id")           int    mailId,
            @Body                 Map<String, Object> body
    );

    @DELETE("mails/{id}")
    Call<Void> deleteMail(
            @Header("Authorization") String token,
            @Path("id")           int    mailId
    );

    @GET("labels")
    Call<List<MailLabel>> getAllLabels(@Header("Authorization") String token);

    @POST("blacklist")
    Call<BlacklistResponse> addToBlacklist(
            @Header("Authorization") String token,
            @Body Map<String,String> body
    );

    // GET /blacklist/check?url=…
    @GET("blacklist/check")
    Call<CheckResponse> isUrlBlacklisted(
            @Header("Authorization") String token,
            @Query("url") String url
    );

    @DELETE("blacklist/{id}")
    Call<Void> removeFromBlacklist(
            @Header("Authorization") String token,
            @Path("id")               int blacklistId
    );




}
