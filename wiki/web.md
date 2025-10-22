# Gmail Web App Documentation

## Table of Contents
- [Overview](#overview)
- [User Activities](#user-activities)

---

## Overview
This is a **React-based web application** for a Gmail-like system that connects to a **Node.js + MongoDB backend**, and a C++ TCP server for blacklist URL checking.

Users can:
- Sign up and log in  
- View received and sent emails  
- Compose, edit, and delete emails  
- Apply labels, star, delete, and mark as spam  
- Manage custom labels and search mails  
- Edit drafts and view mail details

---

## User Activities

### 1. Login Page
This is the login screen, where users can authenticate using their username and password.  
A link to the registration page is available for new users.

<p align="center">
  <img src="webDoc/login_screen.png" alt="Login Screen" width="600"/>
</p>

---

### 2. Register Page
This screen allows new users to register by filling out their username, full name, password, and confirming the password.  
Registration also allows users to upload an optional profile picture.

<p align="center">
  <img src="webDoc/sign_up_screen.png" alt="Sign Up Screen" width="600"/>
</p>

---

### 3. Inbox View
The inbox displays all received emails.  
Each email shows its subject, sender, timestamp, and action icons (e.g. star, delete).  
Users can toggle between light and dark mode.  
In the side menu, users can **filter emails by label** — clicking a label will display only the mails associated with it.


<p align="center">
  <img src="webDoc/inbox_screen.png" alt="Inbox Light Mode" width="600"/>
</p>

<p align="center">
  <img src="webDoc/inbox_screen_dark.png" alt="Inbox Dark Mode" width="600"/>
</p>

---

### 4. Mail Detail View
Clicking a mail opens its full content in a detail view.  
Users can reply, apply/remove labels, star, delete, or mark the mail as spam/unread.  
This screen also supports both light and dark modes.

<p align="center">
  <img src="webDoc/mail_details.png" alt="Mail Details Light" width="600"/>
</p>

<p align="center">
  <img src="webDoc/mail_details_dark.png" alt="Mail Details Dark" width="600"/>
</p>

---

### 5. Compose Mail
This is where users can write a new email by entering the recipient, subject, and body.  
There are options to send the email or save it as a draft.  
Supports both light and dark modes.

<p align="center">
  <img src="webDoc/compose_mail.png" alt="Compose Mail Light" width="600"/>
</p>

<p align="center">
  <img src="webDoc/compose_mail_dark.png" alt="Compose Mail Dark" width="600"/>
</p>

---

### 6. Edit Draft Email
Emails saved as drafts appear in the inbox when filtered by the "Drafts" label.  
Clicking a draft reopens the Compose Mail screen with pre-filled fields, allowing the user to edit and send it.

<p align="center">
  <img src="webDoc/draft_inbox_filter.png" alt="Draft Filter in Inbox" width="600"/>
</p>

<p align="center">
  <img src="webDoc/darft_open_compose.png" alt="Opened Draft" width="600"/>
</p>

---

### 7. Label Management
Users can create new labels or manage existing ones.  
Custom labels can be applied or removed from any mail.

<p align="center">
  <img src="webDoc/manage_new_lables.png" alt="Manage Labels" width="600"/>
</p>

<p align="center">
  <img src="webDoc/add_new_label.png" alt="Add New Label" width="600"/>
</p>

---

### 8. Search Emails
The search bar allows users to filter emails by keyword, subject, or sender in real-time.

<p align="center">
  <img src="webDoc/search_result.png" alt="Search Result" width="600"/>
</p>

---

### 9. Profile Menu
Clicking the user’s avatar opens a dropdown with profile info and a logout button.

<p align="center">
  <img src="webDoc/profile_popup.png" alt="Profile Menu" width="600"/>
</p>
