# Keycloak Setup for Movie Hub UI

## Overview

Movie Hub UI uses **OpenID Connect (OIDC)** with Keycloak.
The app now has a single **Sign in** button. Keycloak provides both login and self-registration on its own screen, so registration is not exposed as a separate button in the UI.

After the Keycloak callback, the UI rehydrates auth state automatically:

- the header switches from `Sign in` to the user's name and `Logout`
- the app reads the access token from the correct OIDC storage key
- API requests send `Bearer <access_token>` automatically

## Architecture

```text
UI -> Keycloak sign-in page -> authorization code -> UI
UI reads OIDC session from localStorage
UI sends access token to API
API validates JWT
```

## Prerequisites

- Docker installed (for running Keycloak locally)
- Node.js installed (for running the UI)

## Quick Start: Run Keycloak Locally

### 1. Start Keycloak with Docker

```bash
docker run -p 8180:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

Keycloak Admin Console: http://localhost:8180
- **Username:** `admin`
- **Password:** `admin`

### 2. Access Admin Console

Open http://localhost:8180/admin and log in with the credentials above.

## Step-by-Step Configuration

### Step 1: Create Realm

1. Click the dropdown in the top-left (next to "Master")
2. Click **Create realm**
3. Enter:
   - **Name:** `movie-hub`
   - **Enabled:** On
4. Click **Create**

### Step 2: Create Client

The UI needs an OIDC client to authenticate users.

1. Go to **Clients** → **Create client**
2. Enter:
   - **Client type:** `OpenID Connect`
   - **Client ID:** the client id used by the UI `.env` file
3. Click **Next**
4. Configure:
   - **Client authentication:** Off (public client - no secret needed for browser apps)
   - **Authorization:** Off
   - **Valid redirect URIs:** `http://localhost:5173/*`
   - **Web origins:** `http://localhost:5173`
5. Click **Next**
6. Click **Save**

### Step 3: Enable User Registration

1. Go to **Realm Settings** → **Login** tab
2. Enable the following:
   - **User registration:** On
   - **Verify email:** Off (for development)
   - **Login with email:** On
   - **Remember me:** On
3. Click **Save**

### Step 4: Create Roles

1. Go to **Roles** → **Create role**
2. Create role:
   - **Role name:** `admin`
   - **Description:** Full access: create, update, delete movies
3. Click **Create**
4. Create another role:
   - **Role name:** `user`
   - **Description:** Authenticated user: create comments, rate movies
5. Click **Create**

### Step 5: Create Users (Optional)

You can also create users manually in addition to self-registration.

#### Create Admin User:

1. Go to **Users** → **Add user**
2. Enter:
   - **Username:** `admin`
   - **Email:** `admin@email.com`
   - **Email verified:** On
3. Click **Create**
4. Go to **Credentials** tab:
   - Click **Set password**
   - Enter password
   - Click **Save**
5. Go to **Role mappings** tab:
   - Select `admin` role
   - Click **Assign**

#### Create Regular User:

1. Go to **Users** → **Add user**
2. Enter:
   - **Username:** `malex`
   - **Email:** `malex@email.com`
   - **Email verified:** On
3. Click **Create**
4. Go to **Credentials** tab:
   - Click **Set password**
   - Enter password
   - Click **Save**
5. Go to **Role mappings** tab:
   - Select `user` role
   - Click **Assign**

### Step 6: Configure JWT Mappers (for Backend)

The backend expects specific claims in the JWT token. Configure mappers to include these claims.

#### 6.1 Realm Roles Mapper

1. Go to **Client scopes** → `roles` (default scope)
2. Go to **Mappers** tab → **Add mapper** → **By configuration**
3. Select **User Realm Role**
4. Configure:
   - **Name:** `realm-roles`
   - **Token Claim Name:** `realm_access.roles`
   - **Add to ID token:** On
   - **Add to access token:** On
   - **Add to userinfo:** On
   - **JSON type:** On
5. Click **Save**

#### 6.2 Verify Username Mapper

1. Go to **Client scopes** → `profile`
2. Open **Mappers** tab
3. Ensure **username** mapper exists (it's there by default)

#### 6.3 Verify Email Mapper

1. Go to **Client scopes** → `email`
2. Open **Mappers** tab
3. Ensure **email** mapper exists (it's there by default)

## UI Environment Variables

Update the `.env` file in the UI project so it matches the Keycloak realm and client you configured:

```properties
# Local example
VITE_API_BASE_URL=http://localhost:8080
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=movie-hub
VITE_KEYCLOAK_CLIENT_ID=movie-hub-client

# Current cloud values used by this project
VITE_API_BASE_URL=https://rest-api-movie-hub-latest.onrender.com
VITE_KEYCLOAK_URL=https://lemur-15.cloud-iam.com/auth
VITE_KEYCLOAK_REALM=kotedev
VITE_KEYCLOAK_CLIENT_ID=movie-hub-postman
```

If you create a dedicated browser client in Keycloak, update `VITE_KEYCLOAK_CLIENT_ID` to that client id.

## Backend Environment Variables

The backend must validate tokens from the same realm:

```properties
OAUTH2_RESOURCE_SERVER_ISSUER_URI=http://localhost:8180/realms/movie-hub

# Cloud example
# OAUTH2_RESOURCE_SERVER_ISSUER_URI=https://lemur-15.cloud-iam.com/auth/realms/kotedev
```

## How Sign In Works Now

1. User clicks `Sign in` in the UI.
2. The browser is redirected to Keycloak.
3. Keycloak shows the login page with the built-in registration link.
4. The user can either log in or create a new account there.
5. Keycloak redirects back to the UI with the authorization response.
6. The UI stores the OIDC session in `localStorage` and updates the header immediately.
7. The app shows the username and `Logout` without requiring `F5`.

## How Registration Works Now

1. User clicks `Sign in` in the UI.
2. On the Keycloak page, the user chooses `Register`.
3. Keycloak shows the registration form.
4. The user creates the account and confirms it.
5. Keycloak redirects back to the UI.
6. The UI restores auth state from the stored OIDC session and shows the logged-in state immediately.

## UI Auth Implementation Notes

- `AuthProvider` uses the same Keycloak `authority` and `client_id` as the environment variables.
- The OIDC user is stored in `localStorage`, not in a browser tab-only cache.
- The app reads the exact OIDC storage key `oidc.user:<authority>:<client_id>`.
- `useAuth` listens for OIDC user events so the header rerenders after login and logout.
- API requests attach the access token from the stored OIDC session.
- Realm roles are read from the access token, so the `admin` check works without a refresh.

## JWT Token Types

Keycloak issues two types of tokens:

| Token | Purpose | Used By |
|-------|---------|---------|
| `id_token` | Identifies the user (contains user info) | UI (for display) |
| `access_token` | Authorizes API access (contains roles) | Backend (for authorization) |

**Important:** The UI sends `access_token` to the backend, NOT `id_token`.

## Access Token Structure

After authentication, the access token contains:

```json
{
  "sub": "uuid-of-user",
  "preferred_username": "malex",
  "email": "malex@email.com",
  "realm_access": {
    "roles": ["user"]
  }
}
```

The backend uses these claims to:
- Identify the user (`sub` → `keycloak_id` in database)
- Display the username (`preferred_username`)
- Check authorization (`realm_access.roles`)

## Testing

### Test Registration Flow

1. Start the UI: `npm run dev`
2. Click `Sign in`
3. On the Keycloak screen, choose `Register`
4. Fill in the registration form on Keycloak
5. Verify redirect back to UI
6. Verify the header shows the user name and `Logout` immediately

### Test Login Flow

1. Click `Sign in`
2. Enter credentials on the Keycloak login page
3. Verify redirect back to UI
4. Verify the header shows the user name and `Logout` immediately

### Test with Postman (Backend)

1. Get a token from Keycloak:
   - **Grant Type:** Password
   - **Client ID:** the same client id configured in your `.env` file
   - **Username:** `admin`
   - **Password:** `admin`
   - **Token URL:** `http://localhost:8180/realms/movie-hub/protocol/openid-connect/token`

2. Use the **access_token** (NOT id_token) in API requests:
   - **Authorization:** Bearer `<access_token>`

3. Verify the token contains roles:
   ```json
   {
     "realm_access": {
       "roles": ["admin"]
     }
   }
   ```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid redirect_uri" | Check that `Valid redirect URIs` in client settings matches the UI origin |
| "Registration not available" | Ensure **User registration** is enabled in Realm Settings -> Login |
| CORS errors | Check that `Web origins` in client settings includes the UI origin |
| Token missing roles | Verify the `realm-roles` mapper is configured on the `roles` client scope |
| "User not found" | Check if user was created in Keycloak and has a password set |
| UI still shows `Sign in` after callback | Check that `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, and `VITE_KEYCLOAK_CLIENT_ID` match the active Keycloak client |
| UI still shows old auth state | Clear browser storage and sign in again |
| Direct URL like `/login` returns 404 on Render | Configure a static-site rewrite rule to serve `/index.html` for client-side routes. Render supports rewrites for React Router-style SPAs. |

## Useful Links

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak OIDC Protocol](https://www.keycloak.org/docs/latest/operating-guides/)
- [react-oidc-context Documentation](https://github.com/authts/react-oidc-context)
