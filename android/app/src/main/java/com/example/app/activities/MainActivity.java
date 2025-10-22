package com.example.app.activities;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.appcompat.widget.SearchView;

import com.example.app.R;
import com.example.app.api.LabelAPI;
import com.example.app.auth.SessionManager;
import com.example.app.fragments.InboxFragment;
import com.example.app.helpers.AvatarLoader;
import com.example.app.helpers.LabelDialogHelper;
import com.example.app.helpers.LabelMenuHelper;
import com.example.app.helpers.ProfilePopupHelper;
import com.example.app.helpers.SearchHandler;
import com.example.app.repositories.LabelRepository;
import com.example.app.utils.RetrofitClient;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.navigation.NavigationView;

import android.view.Menu;
import android.view.View;
import android.widget.ImageView;

public class MainActivity extends AppCompatActivity {

    private DrawerLayout drawerLayout;
    private NavigationView navView;
    private LabelRepository labelRepository;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        MaterialToolbar topAppBar = findViewById(R.id.topAppBar);
        setSupportActionBar(topAppBar);

        drawerLayout = findViewById(R.id.drawer_layout);
        navView = findViewById(R.id.nav_view);

        sessionManager = new SessionManager(this);

        int userId = sessionManager.getUserId();
        labelRepository = new LabelRepository(
                RetrofitClient.getAuthenticatedInstance(this).create(LabelAPI.class),
                userId
        );

        refreshLabels();

        topAppBar.setNavigationOnClickListener(v -> drawerLayout.openDrawer(navView));

        navView.setNavigationItemSelectedListener(item -> {
            if (item.getItemId() == R.id.nav_add_label) {
                LabelDialogHelper.showAddLabelDialog(this, labelRepository, this::refreshLabels);
                drawerLayout.closeDrawer(navView);
                return true;
            }

            String labelId = item.getTitleCondensed() != null ? item.getTitleCondensed().toString() : "";
            Bundle bundle = new Bundle();
            bundle.putString("labelId", labelId);

            InboxFragment inboxFragment = new InboxFragment();
            inboxFragment.setArguments(bundle);

            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, inboxFragment)
                    .commit();

            drawerLayout.closeDrawer(navView);
            return true;
        });

        SearchView searchView = findViewById(R.id.searchView);
        searchView.setQueryHint("Search mails…");
        searchView.setIconified(true);

        findViewById(R.id.fakeContainer).setOnClickListener(v -> {
            searchView.setIconified(false);
            searchView.requestFocus();
        });

        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                SearchHandler.performSearch(MainActivity.this, query);
                return true;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                return false;
            }
        });

        ImageView profileIcon = findViewById(R.id.profileIcon);
        AvatarLoader.loadAvatar(this, profileIcon, sessionManager.getAvatarUrl());

        profileIcon.setOnClickListener(v ->
                ProfilePopupHelper.showProfilePopup(this, profileIcon, sessionManager)
        );

        if (savedInstanceState == null) {
            Bundle bundle = new Bundle();
            bundle.putString("labelId", "received");

            InboxFragment inboxFragment = new InboxFragment();
            inboxFragment.setArguments(bundle);

            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, inboxFragment)
                    .commit();
        }
    }

    public void refreshLabels() {
        labelRepository.getAllLabels().observe(this, labels -> {
            Menu menu = navView.getMenu();
            Menu labelsGroup = menu.findItem(R.id.nav_group_labels).getSubMenu();
            labelsGroup.clear();

            LabelMenuHelper.populateLabelMenu(labelsGroup, labels, labelRepository, this, this);
        });
    }
}
