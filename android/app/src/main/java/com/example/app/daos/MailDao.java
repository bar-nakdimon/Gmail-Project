package com.example.app.daos;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import com.example.app.entities.Mail;

import java.util.List;

@Dao
public interface MailDao {

    @Insert
    void insert(Mail mail);

    @Update
    void update(Mail mail);

    @Delete
    void delete(Mail mail);

    @Query("SELECT * FROM mail_table ORDER BY timestamp DESC")
    List<Mail> getAllMails();

    @Query("SELECT * FROM mail_table WHERE id = :mailId")
    Mail getMailById(int mailId);
}
