package com.example.app.entities;

public class BlacklistResponse {
    private String message;
    private int    id;

    // empty constructor
    public BlacklistResponse() {}

    // getters & setters
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
}
