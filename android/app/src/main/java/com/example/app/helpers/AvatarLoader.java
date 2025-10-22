package com.example.app.helpers;

import android.content.Context;
import android.widget.ImageView;

import com.bumptech.glide.Glide;
import com.example.app.R;

public class AvatarLoader {

    public static void loadAvatar(Context context, ImageView target, String avatarUrl) {
        if (avatarUrl != null && !avatarUrl.isEmpty()) {
            if (avatarUrl.contains("localhost")) {
                avatarUrl = avatarUrl.replace("localhost", "10.0.2.2");
            }
            Glide.with(context)
                    .load(avatarUrl)
                    .placeholder(R.drawable.ic_profile)
                    .circleCrop()
                    .into(target);
        } else {
            target.setImageResource(R.drawable.ic_profile);
        }
    }
}
