# Keycloak Setup for Movie Hub UI

## Overview

Movie Hub UI uses **OpenID Connect (OIDC)** to authenticate users via Keycloak.
When users click "Login" or "Register", the UI redirects to Keycloak's login/registration form.
After authentication, Keycloak redirects back to the UI with an authorization code.

## Architecture

```
UI → Keycloak (login/register) → JWT token → UI (stores token) → API (validates JWT)
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
   - **Client ID:** `movie-hub-client`
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

Update the `.env` file in the UI project:

```properties
# For local Keycloak
VITE_API_BASE_URL=http://localhost:8080
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=movie-hub
VITE_KEYCLOAK_CLIENT_ID=movie-hub-client

# For cloud Keycloak (production)
# VITE_API_BASE_URL=https://rest-api-movie-hub-latest.onrender.com
# VITE_KEYCLOAK_URL=https://lemur-2.cloud-iam.com/auth
# VITE_KEYCLOAK_REALM=kotedev
# VITE_KEYCLOAK_CLIENT_ID=movie-hub-client
```

## Backend Environment Variables

Update the `.env` file in the backend project:

```properties
# For local Keycloak
OAUTH2_RESOURCE_SERVER_ISSUER_URI=http://localhost:8180/realms/movie-hub

# For cloud Keycloak (production)
# OAUTH2_RESOURCE_SERVER_ISSUER_URI=https://lemur-2.cloud-iam.com/auth/realms/kotedev
```

## How Registration Works

1. User clicks "Register" button in the UI
2. UI redirects to Keycloak:
   ```
   http://localhost:8180/realms/movie-hub/protocol/openid-connect/auth?client_id=movie-hub-client&redirect_uri=http://localhost:5173&response_type=code&scope=openid&kc_action=register
   ```
3. Keycloak shows the registration form
4. User fills in the form and submits
5. Keycloak creates the user and redirects back to the UI
6. UI exchanges the authorization code for tokens
7. User is now logged in

## How Login Works

1. User clicks "Login" button in the UI
2. UI redirects to Keycloak:
   ```
   http://localhost:8180/realms/movie-hub/protocol/openid-connect/auth?client_id=movie-hub-client&redirect_uri=http://localhost:5173&response_type=code&scope=openid
   ```
3. Keycloak shows the login form
4. User enters credentials and submits
5. Keycloak validates and redirects back to the UI
6. UI exchanges the authorization code for tokens
7. User is now logged in

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

## ID Token Structure

The id token contains user identity information:

```json
{
  "sub": "uuid-of-user",
  "preferred_username": "malex",
  "email": "malex@email.com"
}
```

The UI uses this to display the username and check authentication state.

## Testing

### Test Registration Flow

1. Start the UI: `npm run dev`
2. Click "Register" button
3. Fill in the registration form on Keycloak
4. Verify redirect back to UI
5. Verify user is logged in

### Test Login Flow

1. Click "Login" button
2. Enter credentials
3. Verify redirect back to UI
4. Verify user is logged in

### Test with Postman (Backend)

1. Get a token from Keycloak:
   - **Grant Type:** Password
   - **Client ID:** `movie-hub-client`
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
| "Registration not available" | Ensure **User registration** is enabled in Realm Settings → Login |
| CORS errors | Check that `Web origins` in client settings includes the UI origin |
| Token missing roles | Verify the `realm-roles` mapper is configured on the `roles` client scope |
| "User not found" | Check if user was created in Keycloak and has a password set |
| Login loop | Clear browser storage and try again |

## Useful Links

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak OIDC Protocol](https://www.keycloak.org/docs/latest/operating-guides/)
- [react-oidc-context Documentation](https://github.com/authts/react-oidc-context)
