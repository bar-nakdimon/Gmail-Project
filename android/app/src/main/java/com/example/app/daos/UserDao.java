package com.example.app.daos;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;

import com.example.app.entities.User;

@Dao
public interface UserDao {

    @Insert
    void insert(User user);  //  POST

    @Query("SELECT * FROM user_table WHERE id = :id")
    User getUserById(int id);  //  GET

    @Query("SELECT * FROM user_table WHERE username = :username")
    User getUserByUsername(String username);  // (tokens)
}
