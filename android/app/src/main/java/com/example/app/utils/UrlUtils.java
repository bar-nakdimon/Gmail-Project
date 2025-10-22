package com.example.app.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UrlUtils {
    // Regex very similar to your JS version
    private static final Pattern URL_PATTERN = Pattern.compile(
            "((https?://)?(www\\.)?([A-Za-z0-9-]+\\.)+[A-Za-z]{2,}(/\\S*)?)"
    );

    public static List<String> extractUrls(String text) {
        List<String> urls = new ArrayList<>();
        if (text == null) return urls;
        Matcher matcher = URL_PATTERN.matcher(text);
        while (matcher.find()) {
            urls.add(matcher.group());
        }
        return urls;
    }
}
