# COD26 — backend status

Backend is live. Payment provider is **Razorpay**.

Project: `Cod26 2.0` · `5409c200-771b-4986-886c-0eec2ce1e7a6` · region `ap-southeast`
Host: `https://9eah3y4t.ap-southeast.insforge.app`
Dashboard: https://insforge.dev/dashboard/project/5409c200-771b-4986-886c-0eec2ce1e7a6

---

## Done

| | |
|---|---|
| Project linked | `.insforge/project.json` (gitignored — contains an admin key) |
| Tables | `profiles`, `school_codes`, `quiz_questions`, `quiz_attempts`, `unit_progress`, `activity_logs`, `orders`, `pricing` + `leaderboard_view` |
| RLS | every table, plus `payments.razorpay_orders` and `payments.stripe_checkout_sessions` |
| Triggers | `on_auth_user_created`, `profiles_protect_columns`, `on_payment_webhook` |
| Quiz bank | **130 questions — 5 per unit across all 26**, 0 with a mismatched answer |
| Edge functions | `quiz`, `school-code`, `admin`, `chat` — all `active` |
| Frontend env | `.env` written with real URL + anon key |
| Build | `npm run build` → compiled successfully |
| Free Unit 1 | Readable signed-out; quiz allowed for signed-in free users |
| Course videos | `course-videos` bucket + `unit_videos` table, admin-upload only |
| AI assistant | `chat` function → OpenRouter, transcript in `chat_messages` |

Migrations applied:

```
20260731120000_cod26-schema
20260731120100_payments-fulfillment
20260731120200_seed-quiz-bank
20260801000000_pricing-and-amount-check
20260801001000_fix-profile-guard
20260809120000_videos-and-chat
```

---

## Routes

The app no longer opens on the login screen. `src/lib/router.js` is a ~40-line
pushState router (no dependency); `src/App.js` maps paths to screens.

| Path | Who sees it |
|---|---|
| `/` | Public home page — hero, units, features, benefits, pricing, footer |
| `/courses` | Public catalogue of all 17 units, free vs locked marked |
| `/unit/:id` | Free unit reader. A paid id shows the enrol prompt, never the content |
| `/login` | Sign in / register / school code. `?tab=register` deep-links a tab |
| `/dashboard` | Signed-in students. Redirects to `/login` when signed out |
| `/admin` | Admins only. Non-admins are bounced to `/dashboard` |
| anything else | 404 page with a way back |

**Deploying:** `vercel.json` rewrites every path to `index.html`. Without an
equivalent rule on another host, deep links like `/unit/1` will 404 on refresh.

---

## The course: 26 units, 156 chapters

The original course content was recovered from `COD26-FINAL-COMPLETE.zip`. The
version that had been running was a slimmed-down copy: 3 chapters per unit
where chapters 2 and 3 were the same two generated sentences repeated across
every unit. The real writing — six substantial chapters per unit, a worked
code example, a discussion question and an assignment — is now restored.

| | |
|---|---|
| Units | **26** — the original 17 plus 9 new ones |
| Chapters | **156** (6 per unit) |
| Worked examples | 26 |
| Discussion questions | 26 |
| Assignments | 26 |

**Ids now equal course order.** Units are numbered 1–26 in the sequence a
student studies them, with "Final Projects" as unit 26. The renumbering
migration (`20260810090000`) was safe because no student data existed at the
time; chapters, quiz questions and unit content all moved with their units
(verified: every unit still has 6 chapters, 5 questions and its content row).
From here on, treat ids as stable — student progress now references them.

The nine added units continue after Encapsulation & Abstraction:
comprehensions and lambdas, iterators and generators, decorators, regular
expressions, dates and times, JSON and APIs, SQLite, testing and debugging,
and virtual environments and packaging.

### Where content lives

| Table | Readable by | Holds |
|---|---|---|
| `units` | **everyone** | title, difficulty, duration, `is_free`, summary — catalogue data the marketing pages need |
| `chapters` | free unit or paying student | the actual chapter text |
| `unit_content` | free unit or paying student | worked example and discussion question |

`unit_content` exists because RLS is row-level, not column-level. The worked
example was briefly a column on `units` and was therefore readable by anyone;
moving it to its own gated table fixed that. Do not move it back.

## Course content is in the database

Units and chapters used to live in `src/data/unitdata.js`, so changing a word
meant a redeploy — and every unit's text shipped inside the JS bundle where
anyone could read it. They are now `public.units` and `public.chapters`,
edited from **Admin → 📘 Units & Chapters**.

Consequences worth knowing:

- Paid chapter text **never leaves the server** for a user without access.
  RLS filters it; the browser gets an empty array.
- Adding, editing, reordering and deleting units/chapters is live. No deploy.
- Unpublished units (`is_published = false`) are visible to admins only, so
  you can write a unit before students see it.

## Free units — one tick, every gate

The **Free unit** checkbox on a unit is the single source of truth. Ticking it
opens, in one move: the chapter text, the videos, the resources, and the quiz.

It works because `public.is_free_unit()` reads `units.is_free`, and everything
else calls that function — the RLS policies on `chapters`, `resources` and
`unit_videos`, plus the `quiz` edge function. There is no list to keep in sync
any more.

Verified end to end: ticking free on a unit immediately makes its chapters
readable to signed-out visitors; unticking closes it again.

---

## Course videos

Admin → **🎬 Videos** uploads an MP4/WebM (≤100 MB) against a unit. Students see
it inside the unit reader; Unit 1's videos are visible to everyone.

⚠️ **The `course-videos` bucket is public.** Direct object GETs bypass RLS —
that is what makes `<video>` streaming and seeking work. Object keys are
unguessable, and the database row for a paid unit is hidden from
non-paying users, but anyone given a video URL can watch it. If videos for paid
units must be strictly private, switch the bucket to private and issue signed
URLs per request.

---

## AI assistant

The 💬 button on the student dashboard. Signed-in users only.

- Model: `anthropic/claude-haiku-4.5`, overridable with the
  `OPENROUTER_CHAT_MODEL` backend secret.
- Limit: 30 messages per user per hour (`HOURLY_LIMIT` in `functions/chat.ts`).
- The OpenRouter key is a backend secret; it never reaches the browser.
- Every call costs money. Watch spend in the InsForge dashboard.

```bash
npx @insforge/cli functions deploy chat --file functions/chat.ts
```

---

## Notes &amp; resources

**Admin → 📎 Resources.** Upload a file (≤25 MB, `course-resources` bucket) or
add an external link, attached to a unit. Students see them in the unit reader
under the video. Gated by the same free/paid rule as chapters.

## Attendance

A student is marked present for a day the first time they open their dashboard
— `public.mark_attendance()` upserts one row per student per day, so repeat
visits are idempotent.

- Student: **📅 Attendance** — streak, days studied, 12-week heatmap.
- Admin: **📅 Attendance** — active students, daily bars, per-student rate.

It measures *logins with intent to study*, not time spent. If you need
time-on-task, that is a different (larger) feature.

## Announcements

**Admin → 🔔 Announcements.** Send to every student or to one student. Students
see them under the bell in the dashboard header, with an unread count.

A broadcast is one row with `user_id = NULL`; read state lives in
`notification_reads`, so one message serves everyone without a fan-out.

## Student profile

**👤 Profile** in the dashboard. Students edit their name, phone, class, school
and student ID. Email, role and access status are read-only — the
`profiles_protect_columns` trigger reverts any attempt to change them from the
browser, so the form does not offer them.

---

## Left to do — 3 things, all yours

### 1. Razorpay keys

Secret — you set this, not me.

```bash
npx @insforge/cli payments razorpay config set --environment test --key-id rzp_test_XXXX --key-secret YOUR_KEY_SECRET
```

Then confirm:

```bash
npx @insforge/cli payments razorpay status
```

### 2. Razorpay webhook — manual, in the Razorpay Dashboard

Razorpay does **not** auto-register webhooks. Without this, payments succeed
and nobody gets access.

1. InsForge Dashboard → Payments → Settings → Webhooks. Copy the **URL** and
   the **secret**.
2. Razorpay Dashboard → Settings → Webhooks → Add New Webhook. Paste both.
3. Tick at minimum: `order.paid`, `payment.captured`, `payment.failed`.

Razorpay only delivers to a public HTTPS URL — `localhost` will not receive
webhooks. To test the full flow you need the app deployed.

### 3. Admin — **done**

`iofficialcod70@gmail.com` is `role='admin'`, `access_status='active'`. Sign in
with it to reach the admin dashboard.

To promote somebody else, or to undo this:

```bash
npx @insforge/cli db query "UPDATE public.profiles SET role='admin', access_status='active' WHERE email='OTHER_EMAIL'"
```

```bash
npx @insforge/cli db query "UPDATE public.profiles SET role='student' WHERE email='iofficialcod70@gmail.com'"
```

---

## Run it

```bash
npm start
```

---

## Changing the fee

The price is **not** in code. It lives in one database row:

```bash
npx @insforge/cli db query "SELECT * FROM public.pricing"
```

```bash
npx @insforge/cli db query "UPDATE public.pricing SET amount_minor=70000, access_months=6 WHERE id='class_fee'"
```

`amount_minor` is **paise** — 70000 = ₹700. The checkout screen, the Razorpay
order, and the server-side amount check all read this same row, so they cannot
drift apart.

## Going live

Only after you have tested with Razorpay test keys:

```bash
npx @insforge/cli payments razorpay config set --environment live --key-id rzp_live_XXXX --key-secret YOUR_LIVE_SECRET
```

Add a second webhook in the Razorpay Dashboard pointing at the **live** URL,
then set `REACT_APP_PAYMENT_ENV=live` in `.env` and rebuild.

## Security note

Razorpay order amounts are sent by the browser, so a crafted request could
create a ₹1 order. The fulfillment trigger re-checks `razorpay_orders.amount_paid`
against `public.pricing` before granting access — an underpaid order buys
nothing. Do not remove that check.
