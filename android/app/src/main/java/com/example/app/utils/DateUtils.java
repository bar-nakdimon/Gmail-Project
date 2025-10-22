package com.example.app.utils;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class DateUtils {
    public static String formatMailTs(String rawIso) {
        try {
            SimpleDateFormat iso = new SimpleDateFormat(
                    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
            iso.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date d = iso.parse(rawIso);
            SimpleDateFormat out = new SimpleDateFormat(
                    "d.M.yyyy, HH:mm:ss", Locale.getDefault());
            return out.format(d);
        } catch (Exception e) {
            return rawIso;
        }
    }
}

