# COD26 — 30 manual test cases

Live site: **https://9eah3y4t.insforge.site**

Cases 1–13 have been run against the live site and passed. Cases 14–30 need a
signed-in browser session and are still open — record your result in the
Status column as you go.

| | |
|---|---|
| Last run | 2026-08-09, against live |
| Automated tests | 71 passing across 9 suites (`npm test`) |
| Admin account | `iofficialcod70@gmail.com` — promoted, ready to use |
| Razorpay | **Not configured.** Case 19 will fail until keys are set |

---

## A. Public site — no account needed

| # | Do this | Expect | Status |
|---|---|---|---|
| 1 | Open the site root | Home page, **not** the login form | ✅ hero rendered |
| 2 | Scroll the home page | Hero → about → units → features → benefits → pricing → footer | ✅ all 4 sections + footer |
| 3 | Check the price | ₹500 / 6 months, read live from the database | ✅ ₹0 and ₹500 tiers |
| 4 | Click "See all 26 units" | 26 units, Beginner 9 / Intermediate 9 / Advanced 8 | ✅ 26 units |
| 5 | Look at the catalogue | Unit 1 FREE badge; 25 others locked | ✅ 1 free, 25 locked |
| 6 | Open `/totally-made-up` | 404 page with a way back | ✅ "Page not found" |
| 7 | Open `/dashboard` signed out | Redirected to login | ✅ → `/login` |
| 8 | Open on a 375px phone | ☰ opens the menu, nothing overflows sideways | ✅ menu works, no h-scroll |

## B. Free chapter access

| # | Do this | Expect | Status |
|---|---|---|---|
| 9 | Click "Start Chapter 1 free" | Unit 1 opens, no signup, green FREE bar | ✅ |
| 10 | Read chapter 1 | "Chapter 1: What Python is" + 3 key points | ✅ |
| 11 | Click through Ch 1 → 6 | 6 chapters, all different real content | ✅ 6 distinct titles |
| 12 | Reach chapter 6 | Code block + Copy, "🤔 Think about it", assignment | ✅ all three |
| 13 | Type `/unit/9` in the address bar | Enrol gate — **chapter text must not appear** | ✅ no content leaked |

## C. Registration & login

| # | Do this | Expect | Status |
|---|---|---|---|
| 14 | "Get started" → Register | Name, email, phone, class, school, student ID, password | ⬜ |
| 15 | Submit a 5-character password | Clear rejection, no crash | ⬜ |
| 16 | Register properly, then sign in | Lands on the dashboard | ⬜ |
| 17 | Signed in but unpaid, view units | Unit 1 open, 25 locked, unlock banner | ⬜ |
| 18 | Click "Unlock all units" | Enrolment screen with price | ⬜ |
| 19 | Click "Pay & Get Access" | ⚠️ Fails until Razorpay keys are set | ⬜ |

## D. Student dashboard

| # | Do this | Expect | Status |
|---|---|---|---|
| 20 | Open a chapter → "Mark this chapter complete" | "✓ Chapter complete", rail chip turns green | ⬜ |
| 21 | Log out, log back in, reopen it | Still complete | ⬜ |
| 22 | Open 📅 Attendance | Streak, days studied, 12-week grid | ⬜ |
| 23 | 👤 Profile → change phone → Save | Saves; email and access are read-only | ⬜ |
| 24 | 💬 → "explain lists vs tuples" | Real answer in a few seconds. Try Hinglish | ⬜ |

## E. Admin

| # | Do this | Expect | Status |
|---|---|---|---|
| 25 | Log in as admin | Admin dashboard, not the student one | ⬜ |
| 26 | 📘 Units & Chapters → edit unit 2 title → Save | Changes on the public catalogue instantly | ⬜ |
| 27 | Edit a chapter's text → Save | New text live for students immediately | ⬜ |
| 28 | Tick "Free unit" on unit 2, open `/unit/2` **signed out** | Readable. Untick → locks again | ⬜ |
| 29 | 🎬 Videos → upload a small MP4 to unit 1 | Appears and plays for a student | ⬜ |
| 30 | 🔔 Announcements → send to everyone | Bell badge appears; "Mark all read" clears it | ⬜ |

---

## Also worth testing now

The quiz bank was rebuilt — it previously had 36 rows but only 8 distinct
questions, with units 3–17 sharing two placeholders and 18–26 having none.
Every unit now has 5 real questions.

| # | Do this | Expect |
|---|---|---|
| A | Finish unit 1 → "Take Quiz" | 5 questions about Python, not "What is a good practice when learning a new unit?" |
| B | Answer 3 of 5 correctly | 60% — passes, and the unit is marked complete |
| C | Answer 2 of 5 | 40% — fails, with an explanation shown for every question |
| D | Open a unit in the 18–26 range as an enrolled student | The quiz loads instead of "No questions for this unit yet" |

## Known blockers

| | |
|---|---|
| Razorpay | Not configured in test or live. Case 19 blocked |
| Webhook | Payment success does not grant access — a webhook-driven trigger does. It has never been exercised because webhooks cannot reach localhost. Now the site is on a public HTTPS URL, this is finally testable, and it is the highest-risk untested path in the project |

## Automated coverage

`npm test` — 71 tests, 9 suites. Covers the free/paid access rules, attendance
streak maths, chapter progress grouping, notification read-state merging,
profile validation, file upload validation for videos and resources, and route
parsing. These are the pure-logic paths behind the screens nobody has clicked.
