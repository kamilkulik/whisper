# Session ID Architecture Analysis

This document describes how `sessionId` gets created, saved to the database, cached, and used across components, routes, and middleware in the application.

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant OTPRoute as /api/confirm/otp
    participant UserRoute as /api/users
    participant AuthCheck as /api/auth/check
    participant LogoutRoute as /api/logout
    participant TempCache as DB: SessionIdCache<br/>(TemporarySessionIdCache)
    participant SessionCache as DB: KeyValue<br/>(sessionIdCache)
    participant PrismaUser as DB: User<br/>(Prisma)
    
    %% OTP Request Flow
    Note over Client, OTPRoute: 1. Request OTP Flow (Temporary Session)
    Client->>OTPRoute: GET /api/confirm/otp?phoneNumber/email
    OTPRoute->>OTPRoute: Generate UUID (tempSessionId) & OTP Code
    OTPRoute->>TempCache: set(tempSessionId, { code, expiresAt })
    OTPRoute->>Client: Send SMS/Email with OTP
    OTPRoute-->>Client: Return tempSessionId
    
    %% OTP Confirmation Flow
    Note over Client, PrismaUser: 2. Confirm OTP & Session Creation
    Client->>OTPRoute: POST /api/confirm/otp (body: tempSessionId, code, email/phone)
    OTPRoute->>TempCache: get(tempSessionId)
    TempCache-->>OTPRoute: return { code, expiresAt }
    OTPRoute->>OTPRoute: Verify Code & Expiry
    OTPRoute->>OTPRoute: Generate UUID (authenticatedSessionId)
    
    opt If isLoginMode (Existing User)
        OTPRoute->>PrismaUser: update(where: phone/email, data: { sessionId: authenticatedSessionId })
    end
    
    OTPRoute->>SessionCache: set(key: phoneNumber/email, value: authenticatedSessionId)
    OTPRoute->>TempCache: delete(tempSessionId)
    OTPRoute->>Client: Set-Cookie: sessionId=authenticatedSessionId (HttpOnly, 14 days)
    OTPRoute->>Client: Set-Cookie: x-csrf-token=...
    OTPRoute-->>Client: Return { success: true } (or redirectUrl to signup)
    
    %% New User Registration (if applies)
    Note over Client, PrismaUser: 3. Create/Update Profile Route (Extra Verification)
    Client->>UserRoute: POST /api/users (body: user details)
    UserRoute->>Client: Read Cookie: sessionId
    UserRoute->>SessionCache: get(phoneNumber)
    SessionCache-->>UserRoute: return cachedSessionId
    UserRoute->>UserRoute: Security Verify (Cookie sessionId == cachedSessionId)
    UserRoute->>PrismaUser: create/update(user where sessionId = cookie.sessionId)
    UserRoute-->>Client: Return success
    
    %% Authenticated Requests
    Note over Client, PrismaUser: 4. Using Session in App
    Client->>Middleware: Request /dashboard/* (Sends Cookie: sessionId)
    Middleware->>Middleware: Verify cookie exists
    Middleware-->>Client: Proceed to route
    
    Client->>AuthCheck: GET /api/auth/check (or Server Actions)
    AuthCheck->>Client: Read Cookie: sessionId
    AuthCheck->>PrismaUser: findUnique({ where: { sessionId } })
    PrismaUser-->>AuthCheck: return User
    AuthCheck-->>Client: Return { authenticated: true, sessionId }
    
    %% Logout Flow
    Note over Client, PrismaUser: 5. Logout Flow
    Client->>LogoutRoute: POST /api/logout
    LogoutRoute->>Client: Read Cookie: sessionId
    LogoutRoute->>PrismaUser: update({ where: { sessionId }, data: { sessionId: null } })
    LogoutRoute->>Client: Clear Cookie: sessionId & x-csrf-token
    LogoutRoute-->>Client: Redirect to /
```

## Session Types & Caching Breakdown
- **Temporary Session (`TemporarySessionIdCache` mapping to `SessionIdCache` DB Table)**: Created during OTP request, holds the OTP `confirmationCode` and expiry date. It acts as a bridge before a real user session is verified. Deleted once the code is successfully verified.
- **Authenticated Session Cookie**: Created securely as an HttpOnly cookie after OTP confirmation. It lasts 14 days and tracks the user across browser instances.
- **Verified Cached Session (`sessionIdCache` mapping to `KeyValue` DB Table)**: Stored as a secondary validation layer mapping a user's phone number or email to their current `sessionId`. Used heavily in `POST /api/users` as security verification to ensure the active session cookie matches the last generated session for that phone number.
- **User Record (`Prisma User Table`)**: Holds the `sessionId` directly on the `User` object. Route handlers (`GET /api/auth/check`, `PUT /api/users`) and server actions (`userIdFromCookie`) query this index to pull full user details based on the cookie. During logout, it is nulled out (`sessionId: null`).
