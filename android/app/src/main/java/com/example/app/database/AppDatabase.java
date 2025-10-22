package com.example.app.database;

import android.content.Context;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import androidx.room.TypeConverters;

import com.example.app.entities.Mail;
import com.example.app.entities.Label;
import com.example.app.entities.User;
import com.example.app.daos.MailDao;
import com.example.app.daos.LabelDao;
import com.example.app.daos.UserDao;
import com.example.app.utils.StringListConverter;

@Database(entities = {Mail.class, Label.class, User.class}, version = 1, exportSchema = false)
@TypeConverters({StringListConverter.class})
public abstract class AppDatabase extends RoomDatabase {

    private static volatile AppDatabase instance;

    public abstract MailDao mailDao();
    public abstract LabelDao labelDao();
    public abstract UserDao userDao();

    public static synchronized AppDatabase getInstance(Context context) {
        if (instance == null) {
            instance = Room.databaseBuilder(context.getApplicationContext(),
                            AppDatabase.class, "mail_database")
                    .fallbackToDestructiveMigration()
                    .build();
        }
        return instance;
    }
}