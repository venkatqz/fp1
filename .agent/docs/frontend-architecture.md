# Frontend Architecture Study Guide

## Overview

The frontend is a **React + TypeScript** application built with **Vite** and styled using **Material-UI (MUI)**. It follows a modern component-based architecture with context-based state management.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Material-UI (MUI)** | Component Library & Theming |
| **React Router v6** | Client-side Routing |
| **openapi-typescript-codegen** | Auto-generated API Client |

---

## Project Structure

```
fe/src/
├── main.tsx              # App entry point
├── App.tsx               # Root component with routing
├── theme.ts              # MUI theme configuration
├── index.css             # Global styles
│
├── Pages/                # Page-level components (routes)
│   ├── HomePage.tsx      # Landing page with search CTA
│   ├── SearchPage.tsx    # Hotel search results
│   ├── HotelDetailsPage.tsx  # Single hotel with booking
│   ├── LoginPage.tsx     # User login
│   ├── RegisterPage.tsx  # User registration
│   ├── ProfilePage.tsx   # User profile
│   ├── ManagerDashboard.tsx  # Hotel manager dashboard
│   └── ManageHotelPage.tsx   # Create/Edit hotel form
│
├── components/           # Reusable UI components
│   ├── Navbar.tsx        # Top navigation bar
│   ├── HotelCard.tsx     # Hotel display card
│   ├── HotelList.tsx     # Grid of hotel cards
│   ├── HotelForm.tsx     # Hotel create/edit form
│   ├── RoomTypeManager.tsx   # Manage room types
│   ├── BookedHotels.tsx  # User's bookings list
│   ├── BookingDialog.tsx # Booking modal
│   ├── PublicRoute.tsx   # Route guard for auth pages
│   └── Reusable/
│       ├── Toaster.tsx   # Toast notifications
│       └── GlobalLoader.tsx  # Loading spinner
│
├── context/              # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── UIContext.tsx     # Global UI state (toasts, loader)
│
├── client/               # Auto-generated API client
│   ├── index.ts          # Exports all services & models
│   ├── core/             # HTTP request handling
│   │   ├── OpenAPI.ts    # API configuration (BASE URL, TOKEN)
│   │   ├── request.ts    # HTTP request wrapper
│   │   └── ApiError.ts   # Error handling
│   ├── models/           # TypeScript interfaces
│   │   ├── Hotel.ts
│   │   ├── RoomType.ts
│   │   ├── Booking.ts
│   │   └── User.ts
│   └── services/         # API service classes
│       ├── AuthService.ts
│       ├── CustomerService.ts
│       ├── BookingsService.ts
│       └── ManagerService.ts
│
└── hooks/                # Custom React hooks
```

---

## Key Concepts

### 1. Entry Point (`main.tsx`)

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

- Wraps the app in MUI's `ThemeProvider` for consistent styling
- `CssBaseline` provides CSS reset

### 2. Routing (`App.tsx`)

```tsx
<UIProvider>
  <Router>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/hotel/:id" element={<HotelDetailsPage />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        
        {/* Protected routes for non-authenticated users */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  </Router>
</UIProvider>
```

**Route Types:**
- **Public**: `/`, `/search`, `/hotel/:id` (anyone can access)
- **Auth-only**: `/login`, `/register` (redirects if already logged in)
- **Protected**: `/manager/dashboard`, `/admin/hotel/*` (requires authentication)

### 3. Context Providers

#### AuthContext - Authentication State
```tsx
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}
```

**Features:**
- Stores user & JWT token in `sessionStorage`
- Automatically sets `OpenAPI.TOKEN` for API calls
- Listens for `auth:unauthorized` events for global logout
- Provides `useAuth()` hook

#### UIContext - Global UI State
```tsx
interface UIContextType {
    isLoading: boolean;
    toasts: ToastConfig[];
    showLoader: () => void;
    hideLoader: () => void;
    showToast: (config: ToastConfig) => void;
    removeToast: (id: string) => void;
}
```

**Features:**
- Global loading spinner control
- Toast notification system
- Provides `useUI()` hook

### 4. API Client (Auto-Generated)

The `client/` folder is **auto-generated** from the OpenAPI specification using:
```bash
npm run generate-api
# Runs: openapi-typescript-codegen --input ../be/openapi.yaml --output ./src/client
```

**Services Available:**
| Service | Methods |
|---------|---------|
| `AuthService` | `registerUser()`, `loginUser()` |
| `CustomerService` | `searchAvailableHotels()`, `getHotelById()` |
| `BookingsService` | `createBookingIntent()`, `confirmBooking()`, `cancelBooking()` |
| `ManagerService` | `getMyHotels()`, `createHotel()`, `createRoomType()`, `deleteHotel()` |

**Usage Example:**
```tsx
import { CustomerService, ManagerService } from '../client';

// Fetch hotels (unauthenticated)
const hotels = await CustomerService.searchAvailableHotels({
  query: 'Mumbai',
  checkIn: '2024-12-01',
  checkOut: '2024-12-05'
});

// Create a hotel (requires auth token)
await ManagerService.createHotel({
  name: 'My Hotel',
  city: 'Delhi',
  // ...
});
```

---

## User Flows

### 1. Customer Flow
```
HomePage → Search (Navbar) → SearchPage → HotelDetailsPage → Booking
                                              ↓
                                        BookingDialog
                                              ↓
                                     Payment / Pay at Hotel
```

### 2. Manager Flow
```
Login → ManagerDashboard
            ├── My Hotels Tab → Edit/Delete Hotels
            │        ↓
            │   ManageHotelPage → HotelForm + RoomTypeManager
            │
            └── Bookings Tab → View all bookings
```

---

## Key Components Deep Dive

### Navbar (`components/Navbar.tsx`)
- Displays logo, search bar, user actions
- Conditionally shows different options based on auth state
- Search bar submits to `/search?query=...&checkIn=...&checkOut=...`

### HotelDetailsPage (`Pages/HotelDetailsPage.tsx`)
- Fetches hotel by ID from URL param
- Displays hotel info, images, amenities
- Lists room types with booking buttons
- Opens `BookingDialog` for booking flow

### RoomTypeManager (`components/RoomTypeManager.tsx`)
- Used in `ManageHotelPage`
- Displays table of room types
- Add/Edit room type form (modal)
- Delete confirmation
- Calls `ManagerService.createRoomType()` and `deleteRoomType()`

### BookingDialog (`components/BookingDialog.tsx`)
- Modal for creating a booking
- Collects guest details
- Calculates price
- Supports two payment modes:
  - `ONLINE` - Would integrate Stripe (mocked)
  - `PAY_AT_HOTEL` - Direct confirmation

---

## Data Flow Example: Search Hotels

```
1. User enters search in Navbar
     ↓
2. Navigate to /search?query=Mumbai&checkIn=2024-12-01&checkOut=2024-12-05
     ↓
3. SearchPage.useEffect() extracts query params
     ↓
4. Calls CustomerService.searchAvailableHotels(params)
     ↓
5. API Client makes GET /hotels/search with params
     ↓
6. Backend returns { data: Hotel[], meta: { total, page, limit } }
     ↓
7. SearchPage sets state: setHotels(response.data)
     ↓
8. HotelList component renders HotelCard for each hotel
```

---

## Authentication Flow

```
1. User submits login form
     ↓
2. LoginPage calls AuthService.loginUser({ email, password })
     ↓
3. Backend returns { token, user }
     ↓
4. LoginPage calls auth.login(token, user) from useAuth()
     ↓
5. AuthContext stores in sessionStorage & sets OpenAPI.TOKEN
     ↓
6. All subsequent API calls include Authorization header
     ↓
7. If 401/403 occurs, AuthContext receives 'auth:unauthorized' event
     ↓
8. Auto-logout and redirect to /login
```

---

## Styling

- **Theme**: Custom MUI theme in `theme.ts`
- **Fonts**: Inter (primary), Roboto (fallback)
- **Color Palette**: Dark mode with accent colors
- **Components**: MUI components with `sx` prop for inline styles

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Regenerate API client from OpenAPI spec
npm run generate-api
```

---

## Next Steps

1. Study the backend architecture
2. Understand the database schema
3. Review the OpenAPI specification
4. Trace end-to-end flows
