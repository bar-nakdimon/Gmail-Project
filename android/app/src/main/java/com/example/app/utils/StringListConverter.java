package com.example.app.utils;

import androidx.room.TypeConverter;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.Collections;
import java.util.List;

public class StringListConverter {

    @TypeConverter
    public static String fromList(List<String> list) {
        return new Gson().toJson(list);
    }

    @TypeConverter
    public static List<String> toList(String json) {
        if (json == null) return Collections.emptyList();
        Type type = new TypeToken<List<String>>() {}.getType();
        return new Gson().fromJson(json, type);
    }
}
