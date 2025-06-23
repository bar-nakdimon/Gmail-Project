// mailService.js
import { fetchWithAuth } from './interceptor';

const API = 'http://localhost:3000/api';

export async function getMails(token, logout) {
  return fetchWithAuth(
    `${API}/mails`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    logout
  );
}

export async function getMailById(token, id, logout) {
  return fetchWithAuth(
    `${API}/mails/${id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    logout
  );
}

export async function searchMails(token, query, logout) {
  return fetchWithAuth(
    `${API}/mails/search/${query}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    logout
  );
}

export async function deleteMail(token, id, logout) {
  return fetchWithAuth(
    `${API}/mails/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    logout
  );
}

export async function updateMail(token, mailId, updateFields, logout) {
  return fetchWithAuth(
    `${API}/mails/${mailId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify( updateFields ),
    },
    logout
  );
}

export async function updateMailLabel(token, mailId, labels, logout) {
  return fetchWithAuth(
    `${API}/mails/${mailId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ labels }),
    },
    logout
  );
}

export async function blacklistSender(token, fromUserId, logout) {
  return fetchWithAuth(
    `${API}/blacklist`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: `http://user-${fromUserId}.blocked` }),
    },
    logout
  );
}

export async function createMail(token, { toUsername, subject, body ,isDraft = false }, logout) {
  return fetchWithAuth(
    `${API}/mails`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ toUsername, subject, body, isDraft }),
    },
    logout
  );
}


export async function getLabels(token, logout) {
  return fetchWithAuth(
    `${API}/labels`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    logout
  );
}

export async function createLabel(token, name, description, logout) {
  return fetchWithAuth(
    `${API}/labels`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    },
    logout
  );
}


export async function deleteLabel(token, id, logout) {
  return fetchWithAuth(
    `${API}/labels/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    logout
  );
}

export async function updateLabel(token, id, name, logout) {
  return fetchWithAuth(
    `${API}/labels/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    },
    logout
  );
}
