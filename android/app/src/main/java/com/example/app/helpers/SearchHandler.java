package com.example.app.helpers;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import com.example.app.R;
import com.example.app.fragments.InboxFragment;

public class SearchHandler {

    public static void performSearch(AppCompatActivity activity, String query) {
        Bundle bundle = new Bundle();
        bundle.putString("searchQuery", query);

        InboxFragment inboxFragment = new InboxFragment();
        inboxFragment.setArguments(bundle);

        activity.getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, inboxFragment)
                .commit();
    }
}
