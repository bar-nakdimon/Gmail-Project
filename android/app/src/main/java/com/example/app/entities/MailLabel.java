package com.example.app.entities;

public class MailLabel {
    private String id;
    private String name;

    public MailLabel() {}

    public MailLabel(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() { return id; }
    public String getName() { return name; }

    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
}
