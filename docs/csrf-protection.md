# CSRF Protection in TrailFrames

## 📋 Table of Contents

1. [What is a CSRF Attack?](#what-is-a-csrf-attack-)
2. [The Protection Principle](#the-protection-principle)
3. [Solution Architecture](#solution-architecture)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Complete Request Flow](#complete-request-flow)
7. [Testing and Verification](#testing-and-verification)
8. [Best Practices and Pitfalls](#best-practices-and-pitfalls)
9. [Resources](#resources)

---

## What is a CSRF Attack?

### The Problem

**CSRF** (Cross-Site Request Forgery) is an attack that forces an authenticated user to perform unwanted actions on a web application.

### Typical Attack Scenario

```
1. User is logged into TrailFrames
   → Session cookies active in the browser

2. User visits a malicious site (evil.com)
   → In another tab or through an ad

3. The malicious site contains a hidden form:
   <form action="https://trailframes.com/api/activities/123" method="POST">
     <input type="hidden" name="action" value="delete" />
   </form>
   <script>document.forms[0].submit();</script>

4. The browser sends the request WITH session cookies
   → TrailFrames thinks it's the legitimate user

5. The action is executed without user consent
   → Activity deleted, data modified, etc.
```

### Why is it Dangerous?

- ❌ The attacker can **force actions** (delete, modify, create)
- ❌ The user **doesn't realize it**
- ❌ **Cookies are sent automatically** by the browser
- ❌ All **mutating requests** are vulnerable (POST, PUT, DELETE)

---

## The Protection Principle

### Double Submit Cookie Pattern

TrailFrames uses the **"Double Submit Cookie"** pattern:

```
┌──────────────────────────────────────────────────────────┐
│                   CSRF Protection                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Cookie (HttpOnly)          Header (Manual)              │
│  ┌──────────────┐           ┌──────────────┐             │
│  │   _csrf:     │           │ X-CSRF-Token:│             │
│  │   secret123  │           │   abc-xyz    │             │
│  └──────────────┘           └──────────────┘             │
│         │                          │                     │
│         └──────────┬───────────────┘                     │
│                    │                                     │
│              ┌─────▼──────┐                              │
│              │  Backend   │                              │
│              │ verifies:  │                              │
│              │ Match ? ✅ │                              │
│              └────────────┘                              │
└──────────────────────────────────────────────────────────┘
```

### Why Does It Work?

| Malicious Site (evil.com)                     | Legitimate Site (TrailFrames)          |
| --------------------------------------------- | -------------------------------------- |
| ✅ Can trigger a POST request                 | ✅ Can trigger a POST request          |
| ✅ Browser sends `_csrf` cookie               | ✅ Browser sends `_csrf` cookie        |
| ❌ Cannot read the token (Same-Origin Policy) | ✅ Retrieved token via GET /csrf-token |
| ❌ Cannot add `X-CSRF-Token` header           | ✅ Automatically adds the header       |
| ❌ **Request rejected (403)**                 | ✅ **Request accepted**                |

---

## Solution Architecture

### Involved Components

```
frontend/src/lib/api.ts
  ├─ Configured Axios instance
  ├─ fetchCsrfToken() → Retrieves the token
  ├─ Request Interceptor → Automatically adds the token
  └─ Response Interceptor → Handles CSRF errors

backend/src/middlewares/csrf.ts
  ├─ csrfProtection → Protection middleware
  ├─ getCsrfToken() → Endpoint to retrieve the token
  └─ csrfErrorHandler → 403 error handling

backend/src/index.ts
  ├─ GET /csrf-token → Public endpoint
  ├─ app.use(csrfProtection) → Global protection
  └─ app.use(csrfErrorHandler) → Error handling
```

### Global Flow

```
┌─────────────┐                              ┌─────────────┐
│   Frontend  │                              │   Backend   │
└─────────────┘                              └─────────────┘
       │                                            │
       │  1️⃣ GET /csrf-token                        │
       │───────────────────────────────────────────>│
       │                                            │
       │        Generates token + cookie            │
       │<───────────────────────────────────────────│
       │   Cookie: _csrf=secret (HttpOnly)          │
       │   Body: { csrfToken: "abc-xyz" }           │
       │                                            │
       │  2️⃣ Saves token in memory                  │
       │     csrfToken = "abc-xyz"                  │
       │                                            │
       │  3️⃣ POST /auth/login                       │
       │     Header: X-CSRF-Token: abc-xyz          │
       │     Cookie: _csrf=secret                   │
       │───────────────────────────────────────────>│
       │                                            │
       │        Verifies token vs cookie            │
       │        ✅ Match → Processes request        │
       │<───────────────────────────────────────────│
       │   200 OK                                   │
       │                                            │
```

---

## Backend Implementation

### 1. CSRF Middleware Configuration

**File**: `backend/src/middlewares/csrf.ts`

```typescript
import csurf from "csurf";

const isProduction = process.env.NODE_ENV === "production";

export const csrfProtection = csurf({
  cookie: {
    httpOnly: true, // Inaccessible in JavaScript (XSS protection)
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? "none" : "lax", // Additional protection
  },
  value: (req) => {
    // Reads the token from request header
    return req.headers["x-csrf-token"] as string;
  },
});
```

**Options Explained**:

- **`httpOnly: true`**: Cookie cannot be read by JavaScript
  - ✅ Protects against XSS attacks (cookie theft)
  - Browser sends the cookie automatically with each request

- **`secure: isProduction`**: Cookie transmitted only over HTTPS in production
  - ✅ Protects against interception in transit (man-in-the-middle)

- **`sameSite`**: Controls cookie sending between sites
  - `"lax"` (dev): Cookie sent for normal navigations (GET)
  - `"none"` (prod): Necessary if frontend/backend on different domains
  - ⚠️ With `"none"`, `secure: true` is mandatory

- **`value`**: Function that extracts the token from header
  - This is where verification happens
  - The `csurf` library automatically compares token (header) vs secret (cookie)

### 2. Endpoint to Retrieve Token

```typescript
export function getCsrfToken(req: Request, res: Response) {
  // req.csrfToken() generates a token derived from the cookie secret
  res.json({ success: true, csrfToken: req.csrfToken() });
}
```

**How It Works?**

1. The `csurf` middleware generates a secret and stores it in the `_csrf` cookie
2. `req.csrfToken()` generates a token derived from this secret
3. The token is sent to the client in the JSON response
4. The client must send this token back in the `X-CSRF-Token` header
5. The middleware verifies that the token matches the cookie secret

### 3. CSRF Error Handler

```typescript
export function csrfErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Checks if it's a specific CSRF error
  if ("code" in error && error.code === "EBADCSRFTOKEN") {
    logError(error, {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: req.user?.userId,
    });

    return res.status(403).json({
      success: false,
      error: "Invalid CSRF token. Please refresh the page and try again.",
    });
  }

  // Passes to next error handler if not a CSRF error
  next(error);
}
```

### 4. Express Integration

**File**: `backend/src/index.ts`

```typescript
import {
  csrfProtection,
  getCsrfToken,
  csrfErrorHandler,
} from "./middlewares/csrf";

// 1. Endpoint to retrieve token (BEFORE global protection)
app.get("/csrf-token", csrfProtection, getCsrfToken);

// 2. CSRF protection for ALL following routes
app.use(csrfProtection);

// 3. Application routes
app.use(routes);

// 4. CSRF error handler (BEFORE global error handler)
app.use(csrfErrorHandler);
app.use(errorHandler);
```

**Important Execution Order**:

```
Incoming request
    ↓
app.get("/csrf-token") → Allows retrieving a token (GET)
    ↓
app.use(csrfProtection) → Verifies token for ALL routes
    ↓
app.use(routes) → Application routes (POST, PUT, DELETE)
    ↓
app.use(csrfErrorHandler) → Handles 403 CSRF errors
    ↓
app.use(errorHandler) → Handles other errors
```

---

## Frontend Implementation

### 1. Axios Configuration

**File**: `frontend/src/lib/api.ts`

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ⚠️ ESSENTIAL: Sends cookies with each request
});

// Global variable to store token in memory
let csrfToken: string | null = null;
```

**Why `withCredentials: true`?**

Without this option:

- ❌ Cookies are not sent with requests
- ❌ The `_csrf` cookie is never transmitted
- ❌ CSRF verification always fails

With this option:

- ✅ Cookies are included in each request
- ✅ Backend receives the `_csrf` cookie
- ✅ Verification can be performed

### 2. CSRF Token Retrieval

```typescript
export async function fetchCsrfToken(): Promise<void> {
  try {
    const response = await api.get("/csrf-token");
    csrfToken = response.data.csrfToken; // Saves in memory
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    throw error;
  }
}
```

**Why store in memory and not in localStorage?**

❌ **localStorage**:

- Vulnerable to XSS attacks
- If a malicious script is injected, it can read the token
- Attacker can then make requests with this token

✅ **In-memory variable**:

- Lost on page refresh (not a problem, retrieved automatically)
- More secure against XSS
- Accessible only within the application context

### 3. Request Interceptor (automatic token addition)

```typescript
api.interceptors.request.use(
  async (config) => {
    // Only for methods that modify data
    if (
      config.method &&
      ["post", "put", "delete", "patch"].includes(config.method.toLowerCase())
    ) {
      // If we don't have a token yet, retrieve it
      if (!csrfToken) {
        await fetchCsrfToken();
      }

      // Add the token to the request header
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
```

**Advantages of this approach**:

✅ **Automatic**: No need to manually add the header everywhere
✅ **Lazy loading**: Token is retrieved only when needed
✅ **DRY**: Centralized code, avoids duplication
✅ **GET unaffected**: GET requests don't require CSRF token

**Comparison**:

```typescript
// ❌ Without interceptor (to repeat everywhere)
const token = await fetchCsrfToken();
await api.post("/auth/login", data, {
  headers: { "X-CSRF-Token": token },
});

// ✅ With interceptor (automatic!)
await api.post("/auth/login", data);
// Token is automatically added by the interceptor
```

### 4. Response Interceptor (error handling and retry)

```typescript
api.interceptors.response.use(
  (response) => response, // Success → returns the response

  async (error) => {
    const originalRequest = error.config;

    // Detects a CSRF error (403 with message containing "CSRF")
    if (
      error.response?.status === 403 &&
      error.response?.data?.error?.includes("CSRF") &&
      !originalRequest._retry // Prevents infinite loops
    ) {
      originalRequest._retry = true;

      // Retrieves a new token
      await fetchCsrfToken();

      // Updates the header with the new token
      if (csrfToken) {
        originalRequest.headers["X-CSRF-Token"] = csrfToken;
      }

      // Retries the original request
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);
```

**Use case: Expired token**

```
User remains inactive for 1 hour
  ↓
CSRF token expires server-side
  ↓
User clicks "Save"
  ↓
Request with old token → 403 Forbidden
  ↓
Interceptor detects CSRF error
  ↓
Automatically retrieves a new token
  ↓
Retries request with the new token
  ↓
✅ Success! Transparent for the user
```

**Protection against infinite loops**:

```typescript
!originalRequest._retry; // Checks we haven't already attempted a retry
```

Without this protection:

```
403 → Retry → 403 → Retry → 403 → Retry → ... ∞
```

With this protection:

```
403 → Retry (_retry = true) → 403 → ❌ No retry, error returned
```

---

## Complete Request Flow

### First POST Request (login)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User: login(email, password)                                 │
│    ↓                                                            │
│ 2. api.post('/auth/login', { email, password })                 │
│    ↓ Request interceptor                                        │
│                                                                 │
│ 3. config.method === "post" → true                              │
│    csrfToken === null → true                                    │
│    ↓                                                            │
│ 4. await fetchCsrfToken()                                       │
│    GET /csrf-token                                              │
│    ← Response: { csrfToken: "abc123" }                          │
│    ← Set-Cookie: _csrf=secret; HttpOnly; Secure; SameSite=lax   │
│    csrfToken = "abc123"                                         │
│    ↓                                                            │
│ 5. config.headers["X-CSRF-Token"] = "abc123"                    │
│    ↓                                                            │
│ 6. POST /auth/login                                             │
│    Headers: {                                                   │
│      "X-CSRF-Token": "abc123",                                  │
│      "Content-Type": "application/json"                         │
│    }                                                            │
│    Cookies: { _csrf: "secret" }                                 │
│    Body: { email, password }                                    │
│    ↓                                                            │
│ 7. Backend: csrfProtection middleware                           │
│    - Reads token from header: "abc123"                          │
│    - Reads secret from cookie: "secret"                         │
│    - Verifies that the token matches the secret                 │
│    - ✅ Match! Passes to next route                             │
│    ↓                                                            │
│ 8. Controller: authController.login()                           │
│    - Validates email/password                                   │
│    - Creates JWT session                                        │
│    - Returns 200 OK                                             │
│    ↓                                                            │
│ 9. User logged in ✅                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Subsequent POST Request (token already in memory)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. api.post('/activities/sync')                                 │
│    ↓ Request interceptor                                        │
│                                                                 │
│ 2. config.method === "post" → true                              │
│    csrfToken === "abc123" → true (already in memory)            │
│    ↓                                                            │
│ 3. config.headers["X-CSRF-Token"] = "abc123"                    │
│    ↓                                                            │
│ 4. POST /activities/sync                                        │
│    Headers: { "X-CSRF-Token": "abc123" }                        │
│    Cookies: { _csrf: "secret" }                                 │
│    ↓                                                            │
│ 5. Backend verifies → ✅ Match                                  │
│    ↓                                                            │
│ 6. Sync performed → 200 OK                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Request with Expired Token (automatic retry)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User inactive for 2 hours                                    │
│    → CSRF token expires server-side                             │
│    ↓                                                            │
│ 2. api.post('/auth/logout')                                     │
│    Headers: { "X-CSRF-Token": "abc123" } (old token)            │
│    ↓                                                            │
│ 3. Backend verifies → ❌ Invalid/expired token                  │
│    ← 403 Forbidden { error: "Invalid CSRF token..." }           │
│    ↓ Response interceptor                                       │
│                                                                 │
│ 4. Detects: status === 403 && error.includes("CSRF")            │
│    originalRequest._retry === undefined → true                  │
│    ↓                                                            │
│ 5. originalRequest._retry = true                                │
│    await fetchCsrfToken()                                       │
│    ← New token: "xyz789"                                        │
│    csrfToken = "xyz789"                                         │
│    ↓                                                            │
│ 6. originalRequest.headers["X-CSRF-Token"] = "xyz789"           │
│    return api(originalRequest)                                  │
│    ↓                                                            │
│ 7. POST /auth/logout (retry)                                    │
│    Headers: { "X-CSRF-Token": "xyz789" }                        │
│    ↓                                                            │
│ 8. Backend verifies → ✅ Match with new token                   │
│    ← 200 OK                                                     │
│    ↓                                                            │
│ 9. Logout successful ✅ (transparent for user)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Testing and Verification

### Manual Testing with curl

#### 1. Retrieve CSRF Token

```bash
# Retrieve token and save cookies
curl -X GET http://localhost:3000/csrf-token \
  -c cookies.txt \
  -v

# Expected response:
# < Set-Cookie: _csrf=xxx; Path=/; HttpOnly
# { "success": true, "csrfToken": "abc123" }
```

#### 2. Test Without Token (should fail)

```bash
# Login attempt WITHOUT CSRF token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"email":"test@example.com","password":"password"}' \
  -v

# Expected response:
# < HTTP/1.1 403 Forbidden
# { "success": false, "error": "Invalid CSRF token..." }
```

#### 3. Test With Token (should succeed)

```bash
# Login WITH CSRF token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: abc123" \
  -b cookies.txt \
  -d '{"email":"test@example.com","password":"password"}' \
  -v

# Expected response:
# < HTTP/1.1 200 OK
# { "success": true, "user": {...} }
```

### Verification in DevTools

1. **Open DevTools** → **Network** tab
2. **Perform an action** (login, logout, sync, etc.)
3. **Click on the request** in the list
4. **Verify**:

```
Request Headers:
  X-CSRF-Token: abc123xyz... ✅
  Cookie: _csrf=secret...   ✅

Response:
  Status: 200 OK            ✅
```

### Automated Testing

**File**: `backend/tests/helpers/testCsrf.ts`

```typescript
import { TestServer } from "./testServer";

export async function getCsrfToken(server: TestServer): Promise<string> {
  const response = await server.request.get("/csrf-token").expect(200);

  return response.body.csrfToken;
}

export async function makeProtectedRequest(
  server: TestServer,
  csrfToken: string,
) {
  return server.request
    .post("/api/auth/logout")
    .set("X-CSRF-Token", csrfToken)
    .expect(200);
}
```

**Unit Test**:

```typescript
describe("CSRF Protection", () => {
  it("should reject requests without CSRF token", async () => {
    await server.request.post("/api/auth/logout").expect(403);
  });

  it("should accept requests with valid CSRF token", async () => {
    const token = await getCsrfToken(server);

    await server.request
      .post("/api/auth/logout")
      .set("X-CSRF-Token", token)
      .expect(200);
  });
});
```

---

## Best Practices and Pitfalls

### ✅ Best Practices

#### 1. Protect Only Mutating Methods

```typescript
// ✅ GOOD: Protect POST, PUT, DELETE, PATCH
if (["post", "put", "delete", "patch"].includes(method)) {
  // Add CSRF token
}

// ❌ BAD: Also protect GET
if (["get", "post", "put", "delete"].includes(method)) {
  // Unnecessary for GET, can cause problems
}
```

**Why?**

- GET requests should not modify data (REST principle)
- CSRF attacks target mutations
- Protecting GET complicates code without benefit

#### 2. Store Token in Memory (not localStorage)

```typescript
// ✅ GOOD: In-memory variable
let csrfToken: string | null = null;

// ❌ BAD: localStorage (XSS vulnerable)
localStorage.setItem("csrfToken", token);
```

**Why?**

- localStorage accessible in JavaScript → vulnerable to XSS
- In-memory variable more secure
- Lost on refresh but retrieved automatically

#### 3. Implement Automatic Retry

```typescript
// ✅ GOOD: Automatic retry on CSRF error
if (error.response?.status === 403 && error.includes("CSRF")) {
  await fetchCsrfToken();
  return api(originalRequest);
}

// ❌ BAD: Let user handle error
if (error.response?.status === 403) {
  throw error; // Poor UX
}
```

**Why?**

- Transparency for the user
- Automatically handles token expiration
- Better user experience

#### 4. Use HttpOnly for Secret Cookie

```typescript
// ✅ GOOD: HttpOnly cookie
cookie: {
  httpOnly: true,
  secure: true,
  sameSite: "lax"
}

// ❌ BAD: Cookie accessible in JS
cookie: {
  httpOnly: false // XSS vulnerable!
}
```

**Why?**

- HttpOnly = inaccessible in JavaScript
- Protects against XSS attacks
- Browser sends cookie automatically

#### 5. Combine CSRF with SameSite

```typescript
// ✅ GOOD: Double protection
cookie: {
  httpOnly: true,
  secure: true,
  sameSite: "lax" // Additional protection
}

// ❌ BAD: Rely only on SameSite
cookie: {
  sameSite: "strict" // Not sufficient alone
}
```

**Why?**

- SameSite = defense in depth
- Not supported by all browsers
- Does not replace CSRF protection

### ❌ Pitfalls to Avoid

#### Pitfall #1: Forgetting `withCredentials: true`

```typescript
// ❌ COMMON ERROR
const api = axios.create({
  baseURL: "http://localhost:3000",
  // withCredentials missing!
});

// Consequence: Cookies are never sent
// → The _csrf cookie is not transmitted
// → All requests fail with 403
```

**Solution**:

```typescript
// ✅ CORRECT
const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // ← ESSENTIAL!
});
```

#### Pitfall #2: Wrong Middleware Order

```typescript
// ❌ BAD ORDER
app.use(routes); // Routes BEFORE CSRF protection
app.use(csrfProtection);

// Consequence: Routes are not protected!
```

**Solution**:

```typescript
// ✅ CORRECT ORDER
app.get("/csrf-token", csrfProtection, getCsrfToken); // Endpoint BEFORE
app.use(csrfProtection); // Protection BEFORE routes
app.use(routes); // Protected routes
```

#### Pitfall #3: Forgetting Infinite Loop Protection

```typescript
// ❌ INFINITE LOOP
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      await fetchCsrfToken();
      return api(error.config); // Retry without limit!
    }
  },
);

// Consequence: 403 → Retry → 403 → Retry → ... ∞
```

**Solution**:

```typescript
// ✅ PROTECTION
if (
  error.response?.status === 403 &&
  !originalRequest._retry // ← Prevents loops
) {
  originalRequest._retry = true;
  await fetchCsrfToken();
  return api(originalRequest);
}
```

#### Pitfall #4: CSRF Token in URL

```typescript
// ❌ DANGEROUS
await api.post(`/auth/login?csrfToken=${token}`);

// Consequence:
// - Token visible in logs
// - Token in browser history
// - Token can leak via Referer header
```

**Solution**:

```typescript
// ✅ SECURE: Header only
await api.post("/auth/login"); // Token added automatically by interceptor
```

#### Pitfall #5: Confusing CSRF and XSS

```typescript
// ❌ CONFUSION: "HttpOnly protects against CSRF"
// FALSE! HttpOnly protects against XSS (cookie theft)
// CSRF requires separate protection (token)

// ❌ CONFUSION: "CSRF token protects against XSS"
// FALSE! CSRF token only protects against CSRF
// XSS requires other protections (sanitization, CSP, etc.)
```

**Understanding the differences**:

| Attack                                | Protection                  | Purpose                      |
| ------------------------------------- | --------------------------- | ---------------------------- |
| **XSS** (Cross-Site Scripting)        | HttpOnly, CSP, sanitization | Cookie theft, code injection |
| **CSRF** (Cross-Site Request Forgery) | CSRF token, SameSite        | Force unauthorized actions   |

---

## Resources

### Official Documentation

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- [MDN - SameSite Cookie Attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [csurf Library Documentation](https://github.com/expressjs/csurf)

### Articles and Tutorials

- [Understanding CSRF Attacks](https://owasp.org/www-community/attacks/csrf)
- [Axios Interceptors Documentation](https://axios-http.com/docs/interceptors)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### Testing Tools

- [OWASP ZAP](https://www.zaproxy.org/) - Security scanner
- [Burp Suite](https://portswigger.net/burp) - Web security testing
- [CSRF Tester (Chrome Extension)](https://chromewebstore.google.com/) - CSRF testing

---

## Summary

### The Mechanism in One Sentence

**TrailFrames** uses the **"Double Submit Cookie"** pattern: a secret in an HttpOnly cookie, a token in a header, and Axios that automatically adds the token to each mutating request thanks to interceptors.

### The 3 Pillars of Protection

1. **Backend**: `csurf` middleware that generates and verifies tokens
2. **Frontend**: Axios interceptors that automatically add the token
3. **Communication**: HttpOnly cookie + manual header = impossible to forge from a third-party site

### Key Takeaways

- ✅ CSRF protects against **unauthorized actions**
- ✅ HttpOnly protects against **cookie theft** (XSS)
- ✅ SameSite is **additional defense** (not sufficient alone)
- ✅ Token in memory = **more secure** than localStorage
- ✅ Automatic retry = **better UX**
- ✅ Axios interceptors = **DRY and maintainable code**

---

**Last updated**: February 4, 2026
