package com.example.app.utils;

import androidx.room.TypeConverter;

import com.example.app.entities.MailLabel;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.List;

public class MailLabelListConverter {

    @TypeConverter
    public static String fromLabelList(List<MailLabel> labels) {
        if (labels == null) return null;
        Gson gson = new Gson();
        return gson.toJson(labels);
    }

    @TypeConverter
    public static List<MailLabel> toLabelList(String json) {
        if (json == null) return null;
        Type type = new TypeToken<List<MailLabel>>() {}.getType();
        return new Gson().fromJson(json, type);
    }
}
