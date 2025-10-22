package com.example.app.daos;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;
import androidx.room.Delete;

import com.example.app.entities.Label;

import java.util.List;

@Dao
public interface LabelDao {

    @Insert
    void insert(Label label);

    @Update
    void update(Label label);

    @Delete
    void delete(Label label);

    @Query("SELECT * FROM label_table WHERE id = :id LIMIT 1")
    Label getById(String id);

    @Query("SELECT * FROM label_table")
    LiveData<List<Label>> getAll();

    @Query("DELETE FROM label_table")
    void clear();
}
