package com.example.app.entities;

public class CheckResponse {
    private boolean blacklisted;

    public CheckResponse() {}

    public boolean isBlacklisted() {
        return blacklisted;
    }
    public void setBlacklisted(boolean blacklisted) {
        this.blacklisted = blacklisted;
    }
}
