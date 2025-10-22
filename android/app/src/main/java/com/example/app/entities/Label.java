package com.example.app.entities;

import androidx.room.Entity;
import androidx.room.PrimaryKey;
import androidx.annotation.NonNull;

@Entity(tableName = "label_table")
public class Label {

    @PrimaryKey
    @NonNull
    private String id;

    private String name;
    private String description;
    private int userId;

    public Label() {}

    public Label(@NonNull String id, String name, String description, int userId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.userId = userId;
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getUserId() { return userId; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setUserId(int userId) { this.userId = userId; }
}
