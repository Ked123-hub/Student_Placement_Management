# Frontend Implementation Guide

## 1. What has been built

The project currently has a React frontend for a College Placement Management System.

The frontend already contains the application foundation:

- A React and Vite project
- Tailwind CSS styling
- Student and TPO sections
- Responsive navigation
- Protected routes
- Authentication structure
- Temporary demo login accounts
- A central API client
- Backend service modules
- Reusable UI components
- Eligibility criteria controls
- File upload controls

The main placement features are not complete yet. Several routes currently show placeholder pages. The existing work prepares the project so those real pages can be added without changing the overall structure.

---

## 2. Technology used

The frontend uses:

- **React** for building the user interface
- **Vite** for development and production builds
- **React Router** for navigation between pages
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **clsx** and **tailwind-merge** for combining CSS classes

The frontend package is inside the `frontend/` directory.

Useful commands:

```text
npm run dev
npm run lint
npm run build
```

These commands must be run from the `frontend/` directory because the repository does not currently have a root `package.json`.

---

## 3. How the application starts

The application starts from [main.jsx](../frontend/src/main.jsx).

The startup flow is:

```text
main.jsx
   ↓
AuthProvider
   ↓
App.jsx
   ↓
AppRoutes
   ↓
The requested page
```

### `main.jsx`

This file:

- Loads the global CSS
- Loads the main `App` component
- Wraps the application with `AuthProvider`
- Enables React Strict Mode

Wrapping the application with `AuthProvider` makes authentication information available to all routes and components.

### `App.jsx`

[App.jsx](../frontend/src/App.jsx) is intentionally small. It loads the application route system and the application CSS.

---

## 4. Route structure

Routes are defined in [AppRoutes.jsx](../frontend/src/routes/AppRoutes.jsx).

The current route groups are:

### Public route

```text
/login
```

This displays the login screen.

### Student routes

```text
/student/dashboard
/student/drives
/student/applications
/student/notifications
/student/profile
/student/resume
```

### TPO routes

```text
/tpo/dashboard
/tpo/students
/tpo/companies
/tpo/drives
/tpo/notifications
```

The root path redirects to the student dashboard path. Unknown paths redirect back to the root path.

The student and TPO pages currently use layouts and placeholder content. The route names are already established so real pages can replace the placeholders later.

---

## 5. Role-based route protection

Route protection is implemented in [ProtectedRoute.jsx](../frontend/src/routes/ProtectedRoute.jsx).

It performs three checks:

1. If authentication is still loading, it shows a loading spinner.
2. If there is no authenticated user, it sends the visitor to `/login`.
3. If the user has the wrong role, it sends them to the correct dashboard.

For example:

```text
STUDENT user → can enter /student/*
TPO user     → can enter /tpo/*
```

This protects the user experience, but the backend must also enforce the same permissions. A user must never be allowed to access TPO data just because a frontend route was hidden.

---

## 6. Authentication system

Authentication is managed by:

- [AuthContext.jsx](../frontend/src/contexts/AuthContext.jsx)
- [useAuth.js](../frontend/src/contexts/useAuth.js)
- [authContext.js](../frontend/src/contexts/authContext.js)
- [authService.js](../frontend/src/services/authService.js)

### What the authentication context provides

The context makes these values available to the application:

- `user`
- `isLoading`
- `isAuthenticated`
- `login()`
- `logout()`

### Session restoration

When the application opens again:

```text
Frontend starts
   ↓
Check for a saved access token
   ↓
Call /auth/me
   ↓
Restore the user
   ↓
Allow the correct routes
```

This means the frontend does not need to forget the user every time the browser is refreshed.

### Real backend login

When demo authentication is disabled, login calls:

```text
POST /api/auth/login
```

The backend should return a user and an access token. The frontend saves the token and uses the returned role to decide whether the user belongs in the student or TPO portal.

### Logout

Logout calls the backend logout endpoint when real authentication is active. The saved access token is then removed from browser storage.

---

## 7. Temporary demo login accounts

During Vite development, two temporary accounts are available so the other routes can be tested before the backend is ready.

### Student account

```text
Email: student@demo.local
Password: demo123
```

### TPO account

```text
Email: tpo@demo.local
Password: demo123
```

Demo authentication is enabled only during development. It is controlled in [env.js](../frontend/src/config/env.js).

It is enabled when:

- The app is running in Vite development mode
- `VITE_ENABLE_DEMO_AUTH` is not set to `false`

The demo session is stored using the same access-token storage mechanism as real authentication. This allows the user to refresh the page while remaining logged in.

The demo accounts are only for testing the frontend shell. They do not contain real student, company, application, or placement data.

---

## 8. Login screen

The login screen is implemented in [LoginPage.jsx](../frontend/src/pages/auth/LoginPage.jsx).

It currently includes:

- College email input
- Password input
- Required field validation from the browser
- Loading state while login is being processed
- Error message display
- Redirect based on the returned user role
- Demo credentials display during development

The login page does not decide whether an account is valid. With real authentication, the backend will decide that.

---

## 9. Student and TPO layouts

The shared layouts are:

- [StudentLayout.jsx](../frontend/src/layouts/StudentLayout.jsx)
- [TpoLayout.jsx](../frontend/src/layouts/TpoLayout.jsx)

Both layouts provide:

- A sidebar
- A topbar
- Responsive content spacing
- A page title based on the current URL
- An area where the selected child page is rendered

The child page is rendered through React Router's `Outlet` component.

### Student layout

The student layout uses student navigation and shows:

- Student Portal label
- Student menu items
- Student user role
- Student notification count

### TPO layout

The TPO layout uses placement-cell navigation and shows:

- Placement Cell label
- TPO menu items
- Placement officer role
- TPO notification count

---

## 10. Sidebar and topbar

The shared navigation components are:

- [Sidebar.jsx](../frontend/src/components/layout/Sidebar.jsx)
- [Topbar.jsx](../frontend/src/components/layout/Topbar.jsx)

### Sidebar features

- Different navigation links for students and TPO users
- Active link styling
- Desktop sidebar
- Mobile slide-out drawer
- Mobile overlay
- Settings button placeholder
- Working logout action
- Lucide icons

### Topbar features

- Current page title
- Mobile menu button
- Notification icon
- Notification count badge
- User name and role display
- Responsive behavior for small screens

The displayed names and notification counts are currently temporary values. They should later come from the authenticated user and notification API.

---

## 11. Reusable UI component library

Shared UI components are stored under `frontend/src/components/ui/` and exported from [index.js](../frontend/src/components/ui/index.js).

The current components include:

- `Button`
- `Badge`
- `Card`
- `Input`
- `Select`
- `Textarea`
- `Table`
- `StatCard`
- `Modal`
- `Tabs`
- `EmptyState`
- `LoadingSpinner`
- `Pagination`
- `SearchBar`
- `FileUpload`
- `EligibilityBuilder`

These components give future pages a common visual style and avoid writing the same controls repeatedly.

### Button

The button supports:

- Primary style
- Secondary style
- Outline style
- Ghost style
- Danger style
- Small, medium, and large sizes
- Loading state
- Disabled state

### Input and Select

These controls support labels, errors, disabled states, and normal form behavior.

### Table

The table components provide common styling for:

- Table containers
- Headers
- Rows
- Header cells
- Data cells

They will be useful for students, companies, applications, drives, and placements.

### Modal

The modal supports:

- A title
- Optional description
- Custom content
- Footer actions
- Multiple sizes
- Escape-key closing
- Overlay closing
- Body scroll locking

### Pagination and SearchBar

These components are ready for backend list endpoints that return paginated data.

### LoadingSpinner and EmptyState

These components are intended for normal API states:

```text
Loading data    → LoadingSpinner
No records      → EmptyState
Records found   → Table or cards
Request failed  → Error message
```

---

## 12. Eligibility builder

The most important domain-specific UI component currently implemented is [EligibilityBuilder.jsx](../frontend/src/components/ui/EligibilityBuilder.jsx).

It allows a TPO user to create multiple eligibility rules for a placement drive.

Supported fields include:

- CGPA
- 10th percentage
- 12th percentage
- Diploma percentage
- Backlogs
- Year
- Branch

Supported operators include:

- Greater than
- Greater than or equal to
- Less than
- Less than or equal to
- Equal to
- `IN`
- `NOT_IN`

The available fields and operators are defined in [eligibility.js](../frontend/src/constants/eligibility.js).

The component can:

- Add a criterion
- Change the criterion field
- Change the operator
- Enter a value
- Enter comma-separated branch values
- Remove criteria
- Disable editing when required

The component only collects and displays criteria. It does not calculate whether students are eligible. The backend must calculate and finalize eligibility using database data.

The frontend should eventually send criteria in a shape similar to:

```json
{
  "field": "CGPA",
  "operator": "GREATER_THAN_EQUAL",
  "value": 8
}
```

---

## 13. File upload component

[FileUpload.jsx](../frontend/src/components/ui/FileUpload.jsx) provides the frontend upload experience.

It currently supports:

- File picker
- Drag and drop
- PDF validation
- Maximum file size validation
- Selected file display
- File removal
- Error messages
- Disabled state

This component is intended for:

- Student resume upload
- TPO or company shortlist upload

The component only selects and validates a file in the browser. The backend must still validate the file, store it safely, and enforce authorization.

---

## 14. Styling system

Global styling is in [index.css](../frontend/src/index.css).

The current design system includes:

- Primary blue colors
- Success, warning, and danger colors
- Neutral surface colors
- Global font settings
- Base page background
- Form control font inheritance
- Button cursor behavior
- Text selection colors
- Custom scrollbars

The application uses Tailwind utility classes inside components. [App.css](../frontend/src/App.css) is currently empty because most styling is handled through Tailwind.

---

## 15. Central API client

The central request helper is [api.js](../frontend/src/services/api.js).

Instead of writing `fetch()` in every page, pages should call a service. Services then call this API client.

The request flow is:

```text
React page
   ↓
Service module
   ↓
api.get(), api.post(), api.patch()
   ↓
apiRequest()
   ↓
Backend API
```

### Current API client responsibilities

- Add the configured API base URL
- Add `Content-Type: application/json` for JSON requests
- Support `FormData` uploads
- Add the bearer access token
- Convert JavaScript objects to JSON
- Parse standard backend responses
- Convert backend failures into JavaScript errors
- Preserve backend error codes and HTTP status codes

The default development API URL is:

```text
http://localhost:5000/api
```

It can be changed with:

```text
VITE_API_BASE_URL
```

The frontend expects the backend response format described in the API contract:

```json
{
  "success": true,
  "data": {}
}
```

For errors:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Readable error message"
  }
}
```

---

## 16. Service layer

The service files provide named functions for backend operations. This keeps endpoint details out of visual components.

### Authentication service

[authService.js](../frontend/src/services/authService.js) handles:

- Login
- Current-user lookup
- Logout
- Temporary development authentication

### Student service

[studentService.js](../frontend/src/services/studentService.js) is prepared for:

- Getting the current student profile
- Updating editable profile fields
- Getting the student dashboard
- Getting placement information
- Uploading the current resume
- Getting the current resume

### Drive service

[driveService.js](../frontend/src/services/driveService.js) is prepared for:

- Listing current drives
- Getting drive details
- Getting recruitment rounds
- TPO drive listing
- Creating and updating drives
- Publishing, closing, and cancelling drives
- Adding eligibility criteria
- Calculating eligibility
- Finalizing eligibility

### Application service

[applicationService.js](../frontend/src/services/applicationService.js) is prepared for:

- Applying to a drive
- Listing the student's applications
- Withdrawing an application
- Getting recruitment progress
- Recording a final result as TPO

### Notification service

[notificationService.js](../frontend/src/services/notificationService.js) is prepared for:

- Listing notifications
- Marking a notification as read

### Admin service

[adminService.js](../frontend/src/services/adminService.js) is prepared for:

- TPO dashboard data
- Student listing
- Company listing
- Creating companies
- Updating companies
- Placement listing

The service layer is prepared, but most services are not yet being called by completed page components because those pages still need to be built.

---

## 17. What is currently only a placeholder

The following routes exist, but their full screens have not been implemented yet:

### Student side

- Student dashboard
- Placement drive list
- Drive details
- My applications
- Application progress
- Notifications
- Student profile
- Resume management
- Placement information

### TPO side

- TPO dashboard
- Student management
- Company management
- Drive management
- Drive creation and editing
- Eligibility calculation and finalization screens
- Shortlist management
- Recruitment rounds
- Attendance
- Round results
- Final selection
- Placement management
- TPO notifications

At present, these routes display a simple placeholder message. The route structure is ready, but the real business screens still need to be added.

---

## 18. How the frontend will integrate with the backend

The frontend and backend are intentionally separated.

### Frontend responsibilities

The frontend is responsible for:

- Showing pages
- Collecting user input
- Showing loading states
- Showing success and error messages
- Sending requests
- Displaying backend results
- Providing convenient client-side validation
- Navigating according to the authenticated role

### Backend responsibilities

The backend is responsible for:

- Authenticating users
- Checking roles and permissions
- Validating all submitted data
- Calculating eligibility
- Freezing eligibility results
- Enforcing application rules
- Checking deadlines
- Enforcing placement restrictions
- Applying Dream Company rules
- Creating resume snapshots
- Validating shortlists
- Managing rounds, attendance, and results
- Creating notifications
- Recording audit logs
- Protecting database integrity

For example, when a student applies:

```text
Student clicks Apply
        ↓
Frontend sends { driveId }
        ↓
Backend checks eligibility and placement rules
        ↓
Backend creates the application
        ↓
Frontend displays success or the backend error
```

The frontend must not send or trust academic values supplied by the user for this decision. The backend already knows the authenticated student's data.

---

## 19. Current frontend status

### Completed

- Project setup
- Styling foundation
- Responsive application shell
- Student and TPO navigation
- Route definitions
- Role-based route protection
- Auth context
- Login and logout structure
- Development demo users
- Central API client
- Domain service layer
- Reusable UI components
- Eligibility builder
- File upload component
- Lint validation
- Production build validation

### Not completed

- Real student pages
- Real TPO pages
- Backend server
- Database connection
- Real API data display
- Full forms and workflows
- Error boundaries and global notifications
- Automated frontend tests
- End-to-end tests

A simple way to describe the current state is:

```text
The application shell and integration foundation are ready.
The actual placement-management screens are the next major development phase.
```

---

## 20. Recommended next implementation order

The next work should be done in small, testable stages.

### Stage 1: Student experience

1. Student dashboard
2. Student profile
3. Resume upload
4. Current placement status
5. Placement drive list
6. Drive details
7. Apply and withdraw actions
8. Applications list
9. Recruitment progress
10. Notifications

### Stage 2: TPO foundation

1. TPO dashboard
2. Student search and filters
3. Company list and company forms
4. Drive list
5. Drive creation and editing
6. Eligibility criteria form
7. Eligibility calculation and finalization

### Stage 3: Recruitment management

1. Shortlist calculation
2. Shortlist upload
3. Shortlist publication
4. Recruitment round creation
5. Attendance management
6. Round results
7. Final results
8. Placement management

### Stage 4: Quality and integration

1. Connect every screen to the backend
2. Add consistent API loading and error handling
3. Test role permissions
4. Test expired deadlines and invalid applications
5. Test resume snapshot behavior
6. Test Dream and Ordinary placement rules
7. Test mobile layouts
8. Add automated tests

This order starts with the student workflow, then adds the TPO tools needed to operate the placement process.
