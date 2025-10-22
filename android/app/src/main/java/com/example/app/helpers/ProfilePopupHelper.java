package com.example.app.helpers;

import android.app.Activity;
import android.content.Intent;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.PopupWindow;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.example.app.R;
import com.example.app.activities.LoginActivity;
import com.example.app.auth.SessionManager;

public class ProfilePopupHelper {

    public static void showProfilePopup(Activity activity, View anchor, SessionManager sessionManager) {
        View popupView = activity.getLayoutInflater().inflate(R.layout.profile_popup, null);

        TextView nameText = popupView.findViewById(R.id.textProfileName);
        TextView usernameText = popupView.findViewById(R.id.textProfileUsername);
        ImageView popupProfileImage = popupView.findViewById(R.id.imageProfile);
        Button logoutButton = popupView.findViewById(R.id.buttonLogout);

        nameText.setText(sessionManager.getName());
        usernameText.setText("@" + sessionManager.getUsername());

        String avatarUrlPopup = sessionManager.getAvatarUrl();
        if (avatarUrlPopup != null && !avatarUrlPopup.isEmpty()) {
            if (avatarUrlPopup.contains("localhost")) {
                avatarUrlPopup = avatarUrlPopup.replace("localhost", "10.0.2.2");
            }
            Glide.with(activity)
                    .load(avatarUrlPopup)
                    .placeholder(R.drawable.ic_profile)
                    .circleCrop()
                    .into(popupProfileImage);
        } else {
            popupProfileImage.setImageResource(R.drawable.ic_profile);
        }

        logoutButton.setOnClickListener(btn -> {
            sessionManager.clearAll();
            activity.startActivity(new Intent(activity, LoginActivity.class));
            activity.finish();
        });

        final PopupWindow popupWindow = new PopupWindow(
                popupView,
                RelativeLayout.LayoutParams.WRAP_CONTENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT,
                true
        );

        popupWindow.setWidth(activity.getResources().getDimensionPixelSize(R.dimen.popup_width));

        int[] location = new int[2];
        anchor.getLocationOnScreen(location);

        popupWindow.showAtLocation(anchor, android.view.Gravity.TOP | android.view.Gravity.START,
                location[0],
                location[1] + anchor.getHeight());
    }
}
