package com.example.app.entities;

import androidx.room.TypeConverters;
import com.example.app.utils.MailLabelListConverter;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import com.google.gson.annotations.SerializedName;

import java.util.List;

@Entity(tableName = "mail_table")
public class Mail {

    @PrimaryKey(autoGenerate = true)
    private int id;

    private int fromUserId;
    private int toUserId;

    @SerializedName("toUsername")
    private String toUsername;

    @SerializedName("fromUsername")
    private String fromUsername;

    @SerializedName("isDraft")
    private Boolean isDraft;

    private String subject;
    private String body;
    private String timestamp;

    @TypeConverters(MailLabelListConverter.class)
    private List<MailLabel> labels;  // Only one definition here

    public Mail() {}

    public Mail(int fromUserId, int toUserId, String subject, String body,
                String timestamp, List<MailLabel> labels) {

        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.subject = subject;
        this.body = body;
        this.timestamp = timestamp;
        this.labels = labels;
    }

    // Getters & Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getFromUserId() { return fromUserId; }
    public void setFromUserId(int fromUserId) { this.fromUserId = fromUserId; }

    public int getToUserId() { return toUserId; }
    public void setToUserId(int toUserId) { this.toUserId = toUserId; }

    public String getToUsername() { return toUsername; }
    public void setToUsername(String toUsername) { this.toUsername = toUsername; }


    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public List<MailLabel> getLabels() { return labels; }
    public void setLabels(List<MailLabel> labels) { this.labels = labels; }

    public String getFromUsername() { return fromUsername; }
    public void setFromUsername(String fromUsername) { this.fromUsername = fromUsername; }

    public Boolean getIsDraft() { return isDraft; }
    public void setIsDraft(Boolean isDraft) { this.isDraft = isDraft; }
}
