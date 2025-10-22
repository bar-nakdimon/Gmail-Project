package com.example.app.entities;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "user_table")
public class User {

    @PrimaryKey(autoGenerate = true)
    private int id;

    private String username;
    private String password;
    private String name;
    private String avatarUrl;

    // Required empty constructor for Retrofit / Gson
    public User() {
    }

    // Constructor
    public User(int id, String username, String password, String name, String avatarUrl) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.name = name;
        this.avatarUrl = avatarUrl;
    }

    // Getters and Setters

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
