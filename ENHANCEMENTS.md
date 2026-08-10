# Feature Enhancements & Future Roadmap

This document outlines proposed future enhancements, architectural upgrades, and enterprise integrations.

---

## 1. Enterprise LDAP Authentication (Scheduled for v2.0)
- **Protocol**: Standard LDAP / Active Directory connection using `ldapjs`.
- **Features**:
  - Enterprise Single Sign-On (SSO) using corporate directory credentials.
  - User Group mapping to role-based access control (RBAC).
  - Configurable LDAP server URI, Bind DN, Search Base, and SSL/TLS certificates.
  - Fallback authentication strategy for offline local users.

---

## 2. Peer-to-Peer Direct File & Stream Sharing (Toffeeshare P2P WebRTC)
- Integration of WebRTC Data Channels for direct browser-to-browser P2P file transfers without file size limits.
- End-to-End Encryption (E2EE) key generation per share session.

---

## 3. AI Smart Assistant Integration
- Natural language task parsing (e.g., typing *"Remind me to buy groceries tomorrow at 5 PM"* auto-populates date, time, and tag).
- Voice notes transcription and summary generation.

---

## 4. Offline Progressive Web App (PWA) Support
- ServiceWorker offline caching for notes and tasks.
- IndexedDB background sync when reconnecting to Supabase cloud.

---

## 5. Rich Code Editor with Live Collaborative Typing (Codeshare Sync)
- Integration of Monaco Editor / CodeMirror with Yjs CRDT real-time multi-user cursor sync.
