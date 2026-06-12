# Role-based Backend (Node, Express, MongoDB, Socket.IO)

Features:
- JWT authentication with access + refresh tokens
- Roles: `admin` and `user`
- Users can create posts with status `pending|approved|rejected`
- Admin can list posts, change status
- Pagination using `offset` and `limit` query params
- Sessions tracked (multiple sessions allowed) via refresh tokens
- Socket.IO chat with simple rooms and message persistence


API overview
- `POST /api/auth/register` { name, email, password, role? , adminSecret? }
- `POST /api/auth/login` { email, password } => returns `accessToken`, `refreshToken` (cookie)
- `POST /api/auth/refresh` => rotate access token using refresh cookie
- `POST /api/auth/logout` => clear refresh session
- `POST /api/posts` => create post (authenticated)
- `GET /api/posts?offset=0&limit=10` => list posts (non-admin sees only approved)
- `GET /api/posts/mine` => my posts
- `GET /api/admin/posts` => admin list (requires admin role)
- `PATCH /api/admin/posts/:id/status` => admin change status
- `GET /api/sessions` => list my sessions
- `DELETE /api/sessions/:id` => revoke session
- `GET /api/chat/history/:userId` => get chat history with user

Socket.IO
Connect with auth token in `auth` payload:

```js
const socket = io('http://localhost:4000', { auth: { token: accessToken } });
```

Events:
- `joinWith` — join a 1:1 room with given other user id
- `message` — send { to, text }
- `message` (received by room members)
