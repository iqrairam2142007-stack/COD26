# COD26 — 30 manual test cases

Live site: **https://9eah3y4t.insforge.site**

Tick each box. If one fails, note the case number and what you saw.

## Before you start

Cases 20–30 need an admin account. There is none yet — sign up through the
site, then run:

```bash
npx @insforge/cli db query "UPDATE public.profiles SET role='admin', access_status='active' WHERE email='YOUR_EMAIL'"
```

Cases 17–19 need Razorpay keys, which are not configured yet.

---

## A. Public site — no account (1–8)

| # | Do this | Expect |
|---|---|---|
| 1 | Open the site root | Home page loads. **Not** the login form |
| 2 | Scroll the home page | Hero → what COD26 is → units → features → benefits → pricing → footer, all present |
| 3 | Check the price on the home page | Shows ₹500 / 6 months, read live from the database |
| 4 | Click "See all 26 units" | Catalogue: 26 units in Beginner (9) / Intermediate (9) / Advanced (8) |
| 5 | Look at the catalogue | Unit 1 has a green FREE badge; the other 25 show 🔒 "Locked — enrol to unlock" |
| 6 | Open `/totally-made-up` | A 404 page with "Go home" and "Browse units", not a blank screen |
| 7 | Open `/dashboard` while signed out | Redirected to the login page, not an error |
| 8 | Open the site on a phone | Nav collapses to ☰; tapping it opens the menu; nothing overflows sideways |

## B. Free chapter access (9–13)

| # | Do this | Expect |
|---|---|---|
| 9 | Click "Start Chapter 1 free" | Unit 1 opens with no signup. Green "FREE" bar at the top |
| 10 | Read chapter 1 | Title "Chapter 1: What Python is", real content, "What this unit covers" key points above it |
| 11 | Click through Ch 1 → 6 | Six chapters, each with different real content. Rail chips jump between them |
| 12 | Reach chapter 6 | Worked example in a dark code block with a Copy button, "🤔 Think about it" question, and the assignment |
| 13 | Open `/unit/9` directly in the address bar | "Unit 9 is part of the full course" — **the chapter text must not appear** |

## C. Registration and login (14–19)

| # | Do this | Expect |
|---|---|---|
| 14 | Click "Get started" → Register | Form with name, email, phone, class, school, student ID, password |
| 15 | Submit with a 5-character password | Rejected with a clear message, not a crash |
| 16 | Register properly, then sign in | Lands on the dashboard, not back on the login form |
| 17 | While signed in but unpaid, open the units list | Unit 1 open; the other 25 locked; an "Unlock all units" banner |
| 18 | Click "Unlock all units" | Enrolment screen with the price and a "Pay & Get Access" button |
| 19 | Click "Pay & Get Access" | ⚠️ Fails until Razorpay keys are set — that is expected right now |

## D. Student dashboard (20–24)

| # | Do this | Expect |
|---|---|---|
| 20 | Open a chapter and click "Mark this chapter complete" | Turns into "✓ Chapter complete"; the rail chip turns green |
| 21 | Log out, log back in, reopen that chapter | Still marked complete — progress survives a session |
| 22 | Open 📅 Attendance | Streak, days studied, and a 12-week grid with today filled in |
| 23 | Open 👤 Profile, change your phone, save | Saves and shows "Profile saved". Email and access status are read-only |
| 24 | Click 💬 (bottom right), ask "explain lists vs tuples" | A real answer within a few seconds. Try a Hinglish question too |

## E. Admin (25–30) — needs the admin account

| # | Do this | Expect |
|---|---|---|
| 25 | Log in as admin | Admin dashboard, not the student one |
| 26 | 📘 Units & Chapters → Edit unit 2 → change the title → Save | Title changes on the public catalogue immediately, no redeploy |
| 27 | Open a unit's Chapters → edit a chapter's text → Save | The new text appears for students right away |
| 28 | Tick "Free unit" on unit 2 and save, then open `/unit/2` **signed out** | Unit 2 is now readable. Untick it and confirm it locks again |
| 29 | 🎬 Videos → upload a small MP4 to unit 1 → open unit 1 as a student | The video appears and plays |
| 30 | 🔔 Announcements → send to every student → open a student account | Bell shows an unread badge; the message is there; "Mark all read" clears it |

---

## Known blockers

| | |
|---|---|
| Razorpay | Not configured in test or live. Enrolment cannot complete (case 19) |
| Admin account | None exists. Cases 25–30 are blocked until one is promoted |

## What has not been verified by anyone yet

Cases 20–30 have not been run end to end — they need a signed-in account,
which was not available during development. Everything in sections A and B
has been verified directly.
