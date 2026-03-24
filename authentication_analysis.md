# Authentication Analysis: Legacy ASP vs. New .NET API

This report provides a technical comparison of the authentication mechanisms in the legacy Classic ASP system (`Web.JobFileZ`) and the modern ASP.NET Core API (`JobFileZ_RevampJobFileZ_API`).

## Part 1: Legacy Authentication Analysis

The legacy system uses a traditional **stateful, session-based** authentication model.

*   **Logic Location**: [login/login.asp](file:///c:/JobFilez/Source/JobFileZAzure/Web.JobFileZ/login/login.asp)
*   **Identification**: Users log in using a `clientKey.username` format (e.g., `NWS.admin`).
*   **Mechanisms**:
    *   **Server-Side Sessions**: State is stored in the standard ASP `Session` object. Key variables include `session("loggedIn")`, `session("userid")`, and `session("clientId")`.
    *   **Cookies**: Used primarily for tracking the `clientId` (`uc`) and facilitating persistent "auto-login" via user ID (`ui`) and MD5 password hash (`up`).
    *   **MD5 Hashing**: Passwords are hashed using MD5 (via [includes/functions/md5.asp](file:///c:/JobFilez/Source/JobFileZAzure/Web.JobFileZ/includes/functions/md5.asp)) before being verified against the database.
*   **Authorization**: Enforced on every page using the `requireLogin()` function (found in [includes/functions/general.asp](file:///c:/JobFilez/Source/JobFileZAzure/Web.JobFileZ/includes/functions/general.asp)). This function checks if `session("loggedIn")` is true; if not, it redirects to `/login`.
*   **JWT Usage**: **No**, JWT is not used in any capacity in the legacy system.
*   **Expiration**: Sessions expire based on server inactivity (default 20 minutes) or until the browser is closed.

---

## Part 2: New System JWT Analysis

The new .NET API implements a **stateless, token-based** authentication model using the industry-standard **JWT (JSON Web Token)**.

*   **Implementation**: Framework-based using the `Microsoft.AspNetCore.Authentication.JwtBearer` library.
*   **Token Generation**: Handled by the custom `JwtTokenService.cs` class.
*   **JWT Configuration**:
    *   **Algorithm**: `HmacSha256` (HMAC with SHA-256).
    *   **Expiration**: **480 minutes (8 hours)**, as defined in `appsettings.json`.
    *   **Claims Included**:
        *   `userId`: The unique ID of the user.
        *   `username`: The user's login name.
        *   `clientKey`: The corporate identifier (e.g., "NWS").
        *   `clientId`: The division ID.
        *   `sub` (Subject): Maps to the `userId`.
        *   `jti`: A unique identifier for the token to prevent replay attacks.
*   **Validation**: Configured in `Program.cs` to validate the **Issuer**, **Audience**, **Lifetime**, and **Signing Key**. It uses a symmetric secret key for signing.

---

## Part 3: Comparison

| Feature | Legacy (Classic ASP) | New (.NET Core API) |
| :--- | :--- | :--- |
| **Auth Type** | Stateful (Session) | Stateless (JWT) |
| **Transport** | Cookies (`ASP.NET_SessionId`) | Header (`Authorization: Bearer <token>`) |
| **Logic** | MD5 Hash + `usp_getUser` | Replicated MD5 Hash + `usp_getUser` |
| **Data Storage** | Server Memory / Cookies | Client-side (in the Token) |
| **Expiration** | Sliding (Inactivity-based) | Fixed (8 hours) |
| **Security** | Susceptible to CSRF (uses tokens) | Inherently resistant to CSRF; XSS risk |

---

## Part 4: Final Answer

**The JWT implementation in the new system is a completely new, modern implementation.**

JWT did not exist in the legacy system. However, the **authentication logic** (how the user is verified) was meticulously **replicated from legacy** to ensure compatibility:
1.  It still accepts the `clientKey.username` format.
2.  It still uses **MD5 hashing** for password verification to match the existing database records.
3.  It calls the same stored procedure (`usp_getUser`).

The transition is a **modernization of the transport layer** (moving from Sessions to JWT) while keeping the **verification core** identical.

---

## Part 5: Migration Impact

*   **What remains the same**: The database schema, user credentials, and the stored procedure logic. Users do not need to reset passwords.
*   **What has changed**: The frontend must now store the JWT (usually in `localStorage`) and send it in the `Authorization` header for every API request.
*   **Risks & Mismatches**:
    *   **Token Revocation**: Since JWTs are stateless, they cannot be "killed" instantly on the server (logout only removes them from the client).
    *   **Security Protocol**: MD5 is considered cryptographically weak by modern standards; while necessary for legacy compatibility, it should be flagged for future upgrade to BCrypt or Argon2.
