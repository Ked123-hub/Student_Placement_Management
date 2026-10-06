# TNP Student Placement Management System
## PROJECT_CONTEXT.md

> **IMPORTANT:** This file is the project source of truth for architecture, business rules, development workflow, and implementation status.
>
> Before implementing any feature:
> 1. Read this file completely.
> 2. Inspect the existing codebase.
> 3. Inspect `prisma/schema.prisma`.
> 4. Inspect existing routes, controllers, services, middleware, and migrations.
> 5. Reuse existing functionality instead of creating duplicates.
> 6. Do not change the database schema unless necessary.
> 7. If a schema change is required, explain it and create a proper Prisma migration.
> 8. Never assume a model, field, controller, route, or middleware exists without checking the repository.

---

# 1. PROJECT OVERVIEW

## Project Name

Student Placement Management System / TNP System

## Purpose

The system digitizes the college placement process that is currently handled through WhatsApp, spreadsheets, and manual communication.

The goal is to provide a centralized platform where:

- TPO/Admin manages students and companies.
- TPO creates and manages placement drives.
- Eligibility is automatically calculated.
- Students can view eligible placement drives.
- Students can apply to drives.
- TPO manages shortlisting.
- Recruitment rounds are managed digitally.
- Attendance and round results are recorded.
- Final selections and placement offers are managed.
- Students receive notifications.
- Placement statistics are available through dashboards.
- Communication happens through the website/email instead of WhatsApp.

---

# 2. TECHNOLOGY STACK

## Backend

- Node.js
- Express.js
- CommonJS modules
- PostgreSQL
- Prisma ORM
- JWT authentication
- Multer for file uploads
- XLSX for Excel processing
- Nodemon for development

## Database

PostgreSQL

Database:

`placement_management`

Default local connection:

`localhost:5432`

## Development

- VS Code / Cursor
- Postman
- Git + GitHub

## Backend Port

Current backend runs on:

`5000`

---

# 3. PROJECT STRUCTURE

Current backend structure is approximately:

```text
server/
├── prisma/
│   ├── schema.prisma
│   ├── prisma7.config.ts
│   └── migrations/
│
├── src/
│   ├── config/
│   ├── controller/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── uploads/
│   └── resumes/
│
├── package.json
├── package-lock.json
└── .env
```

### Important directory note

There has previously been both:

```text
src/controller/
```

and:

```text
src/controllers/
```

Do not create duplicate controller directories.

Before creating a controller, inspect the existing project and use the convention already established by the relevant module.

---

# 4. DEVELOPMENT PRINCIPLES

## General

Write simple, readable, beginner-friendly Node.js code.

Prefer:

- Small functions
- Clear variable names
- Simple control flow
- Explicit validation
- Consistent error responses

Avoid unnecessary abstraction.

Do not introduce additional frameworks or libraries unless necessary.

---

# 5. API RESPONSE FORMAT

All APIs should follow this structure.

## Success

```json
{
  "success": true,
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Do not randomly introduce different response formats.

---

# 6. AUTHENTICATION

Authentication uses JWT.

Protected endpoints use:

```text
Authorization: Bearer <JWT>
```

JWT contains information needed to identify the logged-in user.

Roles:

```text
TPO
STUDENT
```

Role-based authorization must be enforced on protected endpoints.

Example:

```text
TPO-only endpoint
→ authenticate
→ allowRoles("TPO")
→ controller
```

Student endpoint:

```text
authenticate
→ allowRoles("STUDENT")
→ controller
```

Never trust a user-provided `studentId` when the logged-in student can be identified from the JWT.

For student operations, derive the student from:

```text
req.user.userId
```

and the corresponding Student record.

---

# 7. DATABASE / PRISMA

Prisma is currently version 7.x.

Existing Prisma configuration includes:

```text
prisma7.config.ts
```

Typical commands:

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name <migration_name>
npx prisma generate
```

Do not upgrade Prisma major versions unless explicitly requested.

Current database must remain compatible with existing migrations.

Before changing the Prisma schema:

1. Inspect the current schema.
2. Determine whether the feature can use existing fields/models.
3. Only add fields/models when required.
4. Run format.
5. Validate.
6. Create migration.
7. Generate Prisma Client if necessary.
8. Test the affected API.

---

# 8. CURRENTLY IMPLEMENTED AND TESTED

The following modules have already been implemented and tested successfully.

## 8.1 Prisma + PostgreSQL

Working.

Database connection tested successfully.

Example:

```text
Database connected successfully
```

---

# 9. STUDENT IMPORT

TPO can import student data through Excel.

Technology:

```text
multer
xlsx
```

Student import supports validation.

Previously tested sample import:

```text
totalRows: 5
validRows: 5
invalidRows: 0
errors: []
```

The import process checks existing students using identifiers such as:

- PRN
- Email

Do not duplicate the import logic.

---

# 10. STUDENT DATA

Student information includes fields such as:

- Name
- Roll number
- PRN
- Email
- Phone
- Branch
- Year
- CGPA
- 10th percentage
- 12th percentage
- Diploma percentage
- Backlogs
- User relationship
- Resume relationship

Email was added as a unique Student field through migration:

```text
add_student_email
```

Do not assume fields blindly. Always inspect the current Prisma schema.

---

# 11. STUDENT REGISTRATION

Student registration flow has been implemented and tested.

General flow:

```text
Imported Student
        ↓
Student registration
        ↓
OTP generation
        ↓
OTP verification
        ↓
User account creation/linking
        ↓
Student login
```

OTP testing has been successful.

---

# 12. LOGIN

Login is working.

TPO login has been tested successfully.

Student login also exists.

Successful authentication returns a JWT token.

Example conceptual response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "student@college.edu",
      "role": "STUDENT",
      "status": "ACTIVE"
    },
    "token": "JWT_TOKEN"
  }
}
```

Never expose passwords.

Passwords must be stored securely as hashes.

---

# 13. USER STATUS

Existing user statuses include:

```text
ACTIVE
LOCKED
DISABLED
```

Do not allow disabled/locked users to authenticate unless the existing authentication design explicitly supports it.

---

# 14. RESUME MANAGEMENT

Resume upload is implemented.

Students upload PDF resumes.

Current restrictions:

```text
PDF only
Maximum size: 5 MB
```

Resume files are stored privately under:

```text
uploads/resumes/
```

Uploads must not be publicly exposed.

Resume upload endpoint exists under the student resume API.

The system supports:

```text
Upload resume
Get resume metadata
Secure resume download
```

Resume download checks that the requested resume belongs to the logged-in student.

Do not remove old resume records automatically.

Reason:

A future application must be able to preserve the exact resume version used during application.

---

# 15. COMPANY MANAGEMENT

TPO can create companies.

Company contains information such as:

- Company ID
- Company name
- Status
- Created/updated timestamps

Company creation API is implemented and tested.

Conceptual endpoint:

```text
POST /api/admin/companies
```

TPO-only.

---

# 16. PLACEMENT DRIVE

TPO can create placement drives.

Drive information includes:

- Company
- Job role
- Package
- Internship stipend
- Location
- Job description
- Joining date
- Number of openings
- Selection process
- Required skills
- Application deadline
- Status

Drive creation is implemented and tested.

Example endpoint:

```text
POST /api/admin/drives
```

TPO-only.

---

# 17. DRIVE STATUS

Current drive lifecycle includes:

```text
DRAFT
   ↓
PUBLISHED
```

Only TPO can publish a drive.

Publishing has already been implemented and tested.

A drive should not be published before eligibility has been evaluated.

Do not silently bypass this business rule.

---

# 18. ELIGIBILITY CRITERIA

Eligibility criteria are configurable per drive.

Supported conceptual fields include:

```text
CGPA
TENTH_PERCENT
TWELFTH_PERCENT
DIPLOMA_PERCENT
BACKLOGS
BRANCH
YEAR
```

Supported operators:

```text
GTE
LTE
GT
LT
EQ
IN
NOT_IN
```

Example:

```text
CGPA >= 7.5
AND
BACKLOGS <= 2
AND
BRANCH IN ["IT", "CS"]
```

Current MVP behavior:

All configured criteria are combined using AND logic.

---

# 19. ELIGIBILITY ENGINE

Eligibility evaluation has been implemented and tested.

General process:

```text
EligibilityCriteria
        ↓
Evaluate Students
        ↓
DriveEligibility
```

The engine checks every relevant student against all criteria.

For every student, it stores:

- driveId
- studentId
- eligible
- reason

Example reason:

```text
All eligibility criteria satisfied
```

or:

```text
Failed: CGPA GTE 7.5, BACKLOGS LTE 2
```

---

# 20. ELIGIBILITY PREVIEW

TPO can preview eligibility results.

The response includes:

- Total students
- Eligible count
- Ineligible count
- Student details
- Eligibility status
- Reason

Do not expose unnecessary internal eligibility information to students.

---

# 21. IMPORTANT ELIGIBILITY RULE

Eligibility must be treated as a snapshot for the relevant drive/application workflow.

Do not create behavior where a student becomes eligible/ineligible unpredictably just because their profile changed later.

Example:

```text
Drive requires CGPA >= 7.5

Student applies with:
CGPA = 7.2

Student is NOT eligible.

Later:
CGPA = 8.0

The old application must NOT automatically become valid.
```

---

# 22. STUDENT DRIVE LISTING

Student-side published-drive listing has been implemented.

Conceptual endpoint:

```text
GET /api/student/drives
```

Only:

```text
STUDENT
```

can access it.

Students should see:

- Company
- Job role
- Package
- Internship stipend
- Location
- Job description
- Joining date
- Openings
- Selection process
- Required skills
- Application deadline
- Whether they are eligible
- Whether they already applied
- Application status

Do not expose internal eligibility reasons unless explicitly required by the product design.

---

# 23. APPLICATION MODULE — NEXT MAJOR TASK

This is the next major backend module.

Required functionality:

```text
Student
   ↓
View published drive
   ↓
Check eligibility
   ↓
Check deadline
   ↓
Check duplicate application
   ↓
Check placement/dream-company rules
   ↓
Capture resume snapshot
   ↓
Create Application
```

---

# 24. APPLICATION BUSINESS RULES

The application API must enforce:

### Rule 1 — Student only

Only authenticated students can apply.

### Rule 2 — Drive must be published

Students cannot apply to DRAFT drives.

### Rule 3 — Eligibility

Student must have a valid eligible status for the drive.

### Rule 4 — Deadline

Application cannot be submitted after the application deadline.

### Rule 5 — Duplicate prevention

A student cannot apply to the same drive twice.

### Rule 6 — Resume

Application should preserve the resume version used at application time.

Do NOT simply reference the student's current resume if the business requirement is snapshot behavior.

### Rule 7 — Profile snapshot

Important student information used for the application should be preserved where required.

Reason:

Student data can change after application.

---

# 25. DREAM COMPANY RULE

Dream company threshold:

```text
20 LPA
```

This means:

```text
₹20,00,000 annual package
```

The database currently stores package values numerically.

Be consistent about units.

Do not compare:

```text
20
```

with:

```text
2000000
```

without explicitly converting units.

Dream-company rules must be implemented centrally rather than duplicated across controllers.

---

# 26. APPLICATION STATUS

The exact current Prisma enum/status should be inspected before implementation.

Do not create a duplicate enum if one already exists.

Typical lifecycle:

```text
APPLIED
   ↓
SHORTLISTED
   ↓
IN_PROGRESS
   ↓
SELECTED
   ↓
OFFERED
```

Alternative terminal states may include:

```text
REJECTED
WITHDRAWN
```

Use the actual schema as the source of truth.

---

# 27. SHORTLISTING — UPCOMING

TPO needs to:

- View applicants
- Filter applicants
- Shortlist students
- Reject students
- Perform bulk shortlisting
- Preserve application history

Shortlisting must never allow a student who did not apply to suddenly appear as shortlisted.

---

# 28. RECRUITMENT ROUNDS

Recruitment round schema already exists.

The system has already had migrations related to:

```text
add_recruitment_round
```

Rounds may represent:

- Online assessment
- Technical interview
- HR interview
- Group discussion
- Other college-specific rounds

TPO should eventually be able to:

- Create round
- Order rounds
- Set round type
- Set date/time
- Set capacity/details
- Add candidates
- Mark attendance
- Record result
- Move successful candidates to next round

---

# 29. ATTENDANCE

Attendance schema already exists.

Migration:

```text
add_attendance
```

Expected functionality:

```text
Candidate
   ↓
Recruitment Round
   ↓
Present / Absent
```

Only authorized TPO/admin users should modify recruitment attendance.

---

# 30. ROUND RESULTS

Round result schema already exists.

Migration:

```text
add_round_result
```

Expected flow:

```text
Round
 ↓
Candidate
 ↓
Attendance
 ↓
Result
 ↓
Pass / Fail
 ↓
Next round
```

Do not allow candidates to skip required recruitment stages.

---

# 31. PLACEMENT OFFER

Placement offer schema already exists.

Important existing enums:

```text
PlacementOfferStatus

OFFERED
ACCEPTED
REJECTED
WITHDRAWN
```

Placement offer contains information such as:

- Student
- Drive
- Role
- Package
- Selection date
- Status

---

# 32. FINAL PLACEMENT

Final placement schema already exists.

Status:

```text
ACTIVE
CANCELLED
```

There are unique constraints ensuring:

```text
One student → one final placement
One offer → one final placement
```

Do not bypass these database constraints.

---

# 33. PLACEMENT OFFER / FINAL PLACEMENT RULES

Important:

```text
Offer
  ↓
Student accepts
  ↓
Final Placement
```

Final placement should not be created arbitrarily.

It should respect:

- Student application
- Selection result
- Offer
- Dream-company rules
- Existing final placement
- College placement policy

---

# 34. NOTIFICATIONS

Notification-related schema/migration already exists.

Migration:

```text
add_notifications_audit_updates
```

Future notifications include:

- New drive published
- Eligible for drive
- Application submitted
- Shortlisted
- Rejected
- Round scheduled
- Round result
- Selected
- Offer received
- Final placement

Use the existing notification model before creating another one.

---

# 35. AUDIT

Audit functionality/schema may already exist.

All important TPO actions should eventually be auditable:

- Student import
- Company creation
- Drive creation
- Drive publishing
- Eligibility evaluation
- Shortlisting
- Round result updates
- Offer creation
- Final placement

Do not implement duplicate audit systems.

---

# 36. TPO DASHBOARD

Eventually provide:

```text
Total Students
Placed
Unplaced
Placement Rate
Active Drives
Applications
```

Current example dashboard numbers used during planning:

```text
Students: 1000
Placed: 620
Unplaced: 380
Active Drives: 3
Applications: 750
Placement Rate: 62%
```

These are example/mock values only.

Dashboard must eventually calculate real values from the database.

---

# 37. STUDENT DASHBOARD

Student dashboard should eventually show:

```text
Profile
Resume
Available Drives
Eligible Drives
Applied Drives
Application Status
Recruitment Progress
Offers
Final Placement
Notifications
```

---

# 38. ADMIN/TPO FILTERS

TPO should eventually be able to filter students by:

```text
Branch
Year
CGPA
Backlogs
Placement Status
Company Selected
Name
PRN
```

Use database queries efficiently.

Do not fetch the entire database unnecessarily if filtering can be performed in Prisma.

---

# 39. COMMUNICATION POLICY

The system is intended to replace WhatsApp-based placement communication.

Professional communication should happen through:

- Website
- Email
- In-app notifications

Do not introduce WhatsApp dependency unless explicitly requested.

---

# 40. STUDENT PROFILE EDIT RULES

Some fields are controlled by TPO/imported data.

Some fields may be editable by students.

Resume can be updated.

Important:

If a student changes their resume after applying to a drive, the old application must still reference/preserve the resume used during that application.

---

# 41. DATABASE MIGRATION RULES

Before running:

```bash
npx prisma migrate dev
```

always:

```bash
npx prisma format
npx prisma validate
```

Then create the migration:

```bash
npx prisma migrate dev --name meaningful_name
```

After schema changes:

```bash
npx prisma generate
```

Do not edit already-applied migration files casually.

---

# 42. GIT WORKFLOW

Current working branch:

```text
kedar/backend-foundation
```

Main branch:

```text
main
```

Before committing:

```bash
git status
git diff
```

Then:

```bash
git add .
git commit -m "meaningful message"
git push origin kedar/backend-foundation
```

Do not commit:

```text
.env
uploads/
node_modules/
private student resumes
```

Check `.gitignore` before committing.

---

# 43. DEBUGGING WORKFLOW

When an error occurs:

1. Read the complete error.
2. Identify the exact file and line.
3. Inspect the existing implementation.
4. Check Prisma schema.
5. Check generated Prisma Client if relevant.
6. Check route → middleware → controller → service flow.
7. Make the smallest correct fix.
8. Restart server if required.
9. Test the endpoint again.
10. Test the failure case as well.

Do not randomly rewrite working code.

---

# 44. PRISMA ERROR RULE

If Prisma says:

```text
Unknown argument "email"
```

or similar:

DO NOT immediately rewrite the controller.

First check:

```text
prisma/schema.prisma
```

Then:

```bash
npx prisma generate
```

if the schema already contains the field.

If the field does not exist:

- determine whether it should exist,
- modify schema,
- migrate,
- generate,
- retest.

---

# 45. FILE UPLOAD RULES

Uploaded files are private.

Never:

```js
app.use(express.static("uploads"));
```

for private resumes.

Resume access must go through authenticated controller logic.

Validate:

- MIME type
- extension where appropriate
- file size
- ownership

Never trust a filename supplied by the client for authorization.

---

# 46. SECURITY RULES

Never expose:

- Password hashes
- JWT secrets
- Database connection strings
- `.env`
- Private resume storage paths unnecessarily
- Internal audit information to students

Validate all user input.

Enforce role permissions server-side.

Never rely only on frontend restrictions.

---

# 47. CURRENT DEVELOPMENT STATUS

## Completed

```text
[✓] PostgreSQL setup
[✓] Prisma setup
[✓] Prisma migrations
[✓] Database connection
[✓] TPO authentication
[✓] Student authentication
[✓] JWT
[✓] Student import
[✓] Student email
[✓] OTP registration
[✓] Student validation
[✓] Company creation
[✓] Placement drive creation
[✓] Eligibility criteria
[✓] Eligibility engine
[✓] Eligibility preview
[✓] Drive publishing
[✓] Student drive listing
[✓] Resume upload
[✓] Resume metadata
[✓] Secure resume download
[✓] Recruitment round schema
[✓] Attendance schema
[✓] Round result schema
[✓] Placement offer schema
[✓] Final placement schema
[✓] Notification/audit schema
```

## Next

```text
[ ] Student Apply to Drive
[ ] Resume snapshot
[ ] Application snapshot
[ ] Application deadline enforcement
[ ] Duplicate application prevention
[ ] Dream-company application rules
[ ] TPO applicant management
[ ] Shortlisting
[ ] Recruitment round APIs
[ ] Attendance APIs
[ ] Round result APIs
[ ] Candidate progression
[ ] Placement offer APIs
[ ] Offer acceptance/rejection
[ ] Final placement APIs
[ ] Notifications
[ ] Audit logging
[ ] TPO dashboard
[ ] Student dashboard
[ ] Email integration
[ ] Complete testing
[ ] Security hardening
```

---

# 48. HOW CURSOR SHOULD WORK

When asked to implement a feature:

### Step 1

Inspect the existing repository.

### Step 2

Inspect:

```text
prisma/schema.prisma
```

### Step 3

Inspect related:

```text
routes
controllers
services
middleware
```

### Step 4

Reuse existing models and utilities.

### Step 5

Implement the smallest complete feature.

### Step 6

If schema changes are necessary:

```text
Explain schema change
→ modify schema
→ prisma format
→ prisma validate
→ prisma migrate dev
→ prisma generate
```

### Step 7

Test success case.

### Step 8

Test important failure cases.

### Step 9

Do not move to unrelated features until the current feature works.

---

# 49. IMPORTANT — DO NOT DUPLICATE EXISTING CODE

Before creating:

```text
controller
service
middleware
route
utility
Prisma model
enum
```

search the repository first.

If similar functionality exists:

```text
extend it
```

instead of creating:

```text
duplicate implementation
```

---

# 50. IMPORTANT — CURRENT PROJECT IS ALREADY FUNCTIONAL

Do not treat this as a blank project.

There is already working code.

The objective is:

```text
Improve and extend
```

not:

```text
Rewrite everything
```

Do not replace working authentication, registration, import, resume, company, drive, or eligibility functionality without a strong reason.

---

# 51. EXPECTED DEVELOPMENT STYLE

Prefer this flow:

```text
Inspect
 ↓
Plan
 ↓
Implement
 ↓
Validate
 ↓
Test
 ↓
Report
```

When implementing a feature, explain:

```text
What is being changed
Which files are affected
Whether schema changes are required
How to test it
```

Keep explanations concise but clear.

---

# 52. CURRENT IMMEDIATE TASK

The next feature to implement is:

## STUDENT APPLICATION TO PLACEMENT DRIVE

Requirements:

```text
POST /api/student/drives/:driveId/apply
```

It must:

1. Authenticate student.
2. Find Student using JWT userId.
3. Find PlacementDrive.
4. Ensure drive exists.
5. Ensure drive status is PUBLISHED.
6. Check application deadline.
7. Check DriveEligibility.
8. Ensure student is eligible.
9. Prevent duplicate application.
10. Check existing placement/application restrictions.
11. Capture the current resume.
12. Preserve resume snapshot information.
13. Preserve important student/application information where required.
14. Create application.
15. Return application details.

Important:

Before implementing this endpoint, inspect the current Prisma `Application` model and all related models. Do not assume field names.

---

# 53. FINAL RULE

When uncertain about an existing implementation:

DO NOT GUESS.

Inspect the repository first.

The actual codebase and Prisma schema are the final source of truth.

This document provides architecture and business context, but existing implementation takes precedence where it reflects an intentional project decision.