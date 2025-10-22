package com.example.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.SpannableString;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.app.R;
import com.example.app.repositories.TokenRepository;
import com.example.app.auth.SessionManager;

public class LoginActivity extends AppCompatActivity {

    private EditText usernameEditText, passwordEditText;
    private Button loginButton;
    private TokenRepository tokenRepository;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        usernameEditText = findViewById(R.id.editTextUsername);
        passwordEditText = findViewById(R.id.editTextPassword);
        loginButton = findViewById(R.id.buttonLogin);
        TextView buttonGoToRegister = findViewById(R.id.buttonGoToRegister);
        String text = "Don't have an account? Sign Up";
        SpannableString content = new SpannableString(text);
        content.setSpan(new android.text.style.UnderlineSpan(), text.indexOf("Sign Up"), text.length(), 0);
        buttonGoToRegister.setText(content);

        tokenRepository = new TokenRepository(getApplicationContext());
        sessionManager = new SessionManager(getApplicationContext());

        loginButton.setOnClickListener(v -> {
            String username = usernameEditText.getText().toString().trim();
            String password = passwordEditText.getText().toString().trim();

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
                return;
            }

            if (!username.endsWith("@gmail.com")) {
                Toast.makeText(this, "Username must end with @gmail.com", Toast.LENGTH_SHORT).show();
                return;
            }

            tokenRepository.login(username, password).observe(this, loginResponse -> {
                if (loginResponse != null) {
                    Log.d("LoginActivity", "LoginResponse: token=" + loginResponse.getToken());
                    Log.d("LoginActivity", "SessionManager saved userId = " + sessionManager.getUserId());
                    Log.d("LoginActivity", "SessionManager saved username = " + sessionManager.getUsername());

                    Log.d("LoginActivity", "SessionManager saved userId = " + sessionManager.getUserId());
                    Toast.makeText(this, "Logged in! User ID: " + sessionManager.getUserId(), Toast.LENGTH_SHORT).show();

                    startActivity(new Intent(this, MainActivity.class));
                    finish();
                } else {
                    Toast.makeText(this, "Login failed", Toast.LENGTH_SHORT).show();
                }
            });

        });

        buttonGoToRegister.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });

    }
}
