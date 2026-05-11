# Deploy to Vercel + Neon (Free) — English

Step-by-step deployment for project **Amarat** (`https://amarat.vercel.app`).  
You will use your **GitHub** account for Git, Vercel, and Neon.

---

## Prerequisites

- GitHub account (free) — [https://github.com](https://github.com)
- Vercel account (free) — sign up with GitHub at [https://vercel.com](https://vercel.com)
- Neon account (free) — sign up with GitHub at [https://neon.tech](https://neon.tech)

---

## Step 1: Push to GitHub

On your computer (after `git` is installed):

```bash
cd /Users/user/amara-bijoux-clone
git remote add origin https://github.com/YOUR_USERNAME/amara-bijoux.git
git branch -M main
git push -u origin main
```

- If the repo does not exist yet, create it first: [https://github.com/new](https://github.com/new) — name it **amara-bijoux** (public or private).

---

## Step 2: Create Neon database

1. Open [https://neon.tech](https://neon.tech) and sign in with GitHub.
2. Create a new project, e.g. **Amarat**.
3. Choose a region close to your customers (e.g. **EU** for Morocco / Europe).
4. Copy the **connection string** (starts with `postgresql://` or `postgres://`).
5. Keep it safe — you will paste it into Vercel as `DATABASE_URL`.

---

## Step 3: Deploy to Vercel

1. Open [https://vercel.com/new](https://vercel.com/new).
2. **Import** your GitHub repository **amara-bijoux**.
3. **Project name:** `amarat` (this gives you `https://amarat.vercel.app`).
4. Framework: **Next.js** (usually auto-detected).
5. Under **Environment Variables**, add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Paste from Neon (include `?sslmode=require` if Neon shows it). |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` on your machine; paste the output. |
| `AUTH_SECRET` | **Optional** — same value as `NEXTAUTH_SECRET` if you prefer the Auth.js name. |
| `NEXTAUTH_URL` | `https://amarat.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://amarat.vercel.app` |
| `ADMIN_EMAIL` | `admin@amara.ma` (or your admin email; must match what you expect after seed) |
| `ADMIN_PASSWORD` | A **strong** password you choose (seed uses `Admin@123` unless you change seed). |

6. **Image uploads (recommended):** In the Vercel project, add the **Vercel Blob** storage integration. This injects `BLOB_READ_WRITE_TOKEN`. Without it, `/api/upload` returns **503** on Vercel (filesystem is read-only).

7. Click **Deploy** and wait **2–5 minutes**.

---

## Step 4: Migrations and seed (first time)

Migrations run **during the Vercel build** (`prisma migrate deploy` in `vercel.json`).

**Seed** is **not** run automatically (it can **wipe** data). After the first successful deploy, from your machine:

```bash
export DATABASE_URL="postgresql://YOUR_NEON_CONNECTION_STRING"
npx prisma migrate deploy
npx prisma db seed
```

- **Idempotency:** Setting `SEED_IF_EMPTY=true` skips seed if a user already exists (safe re-runs).  
- Default seed **clears** most tables — use only when you want a full demo reset.

---

## Step 5: Visit the site

- Storefront: **https://amarat.vercel.app**
- Admin login: **https://amarat.vercel.app/admin/login**  
  (after seed: email `admin@amara.ma` / password `Admin@123` unless you changed them.)

---

## (Later) Custom domain

1. Buy a domain (e.g. from Namecheap or Cloudflare).
2. Vercel → Project → **Settings** → **Domains** → Add domain.
3. Add the DNS records Vercel shows (often a few minutes to propagate).
4. Update env vars: `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the new `https://...` URL.
5. **Redeploy** the project.

---

## Updating the site

Push to the `main` branch on GitHub — Vercel **auto-deploys**.

---

## What you cannot automate from this repo

These need **your** browser / credentials (about **10 minutes**):

1. Create the GitHub repository and push code (`git push`).
2. Sign up / log in to **Neon** and create the database; copy `DATABASE_URL`.
3. Sign up / log in to **Vercel** with GitHub.
4. Import the repo and set project name **amarat**.
5. Paste all **environment variables** in Vercel (see Step 3).
6. (Recommended) Enable **Vercel Blob** for uploads.
7. After first deploy, run **`npx prisma db seed`** locally with production `DATABASE_URL` if you want demo data.

---

## Gotchas

- **Secrets:** Never commit `.env` or real `DATABASE_URL` / passwords. Use `.env.example` and `.env.production.example` as templates only.
- **NEXTAUTH_URL / NEXT_PUBLIC_SITE_URL:** Must match the live URL (including `https://`) or auth and SEO canonical URLs will be wrong.
- **Uploads:** `public/uploads/` works **locally** only. On Vercel use **Blob** (or another object store).
- **Seed:** Destroys data unless you use `SEED_IF_EMPTY=true`.

---

---

# النشر على Vercel + Neon (مجاني) — العربية

دليل مبسّط لنشر مشروع **Amarat** على الرابط `https://amarat.vercel.app`.  
ستستخدم حساب **GitHub** نفسه لـ Git و Vercel و Neon.

## المتطلبات

- حساب GitHub مجاني — [https://github.com](https://github.com)
- حساب Vercel مجاني — سجّلي الدخول عبر GitHub: [https://vercel.com](https://vercel.com)
- حساب Neon مجاني — سجّلي الدخول عبر GitHub: [https://neon.tech](https://neon.tech)

## الخطوة 1: رفع الكود إلى GitHub

```bash
cd /Users/user/amara-bijoux-clone
git remote add origin https://github.com/YOUR_USERNAME/amara-bijoux.git
git branch -M main
git push -u origin main
```

إن لم يكن المستودع موجوداً: أنشئيه من [https://github.com/new](https://github.com/new) باسم **amara-bijoux**.

## الخطوة 2: إنشاء قاعدة بيانات Neon

1. ادخلي إلى [https://neon.tech](https://neon.tech) وسجّلي الدخول بـ GitHub.
2. أنشئي مشروعاً جديداً (مثلاً **Amarat**).
3. اختاري منطقة قريبة من زبائنك (مثلاً أوروبا للمغرب).
4. انسخي **رابط الاتصال** (`postgresql://...`).
5. احفظيه — سنلصقه في Vercel كـ `DATABASE_URL`.

## الخطوة 3: النشر على Vercel

1. افتحي [https://vercel.com/new](https://vercel.com/new).
2. **استيراد** مستودع GitHub **amara-bijoux**.
3. **اسم المشروع:** `amarat` (يصبح الموقع `https://amarat.vercel.app`).
4. الإطار: **Next.js** (يُكتشف تلقائياً عادة).
5. **متغيرات البيئة** — أضيفي:
   - `DATABASE_URL` — من Neon
   - `NEXTAUTH_SECRET` — من الأمر `openssl rand -base64 32`
   - `NEXTAUTH_URL` = `https://amarat.vercel.app`
   - `NEXT_PUBLIC_SITE_URL` = `https://amarat.vercel.app`
   - `ADMIN_EMAIL` و `ADMIN_PASSWORD` كما تريدين
6. **رفع الصور:** فعّلي تكامل **Vercel Blob** في المشروع ليُضاف `BLOB_READ_WRITE_TOKEN`. بدون ذلك، الرفع من لوحة التحكم لن يعمل على Vercel.
7. اضغطي **Deploy** وانتظري دقائق.

## الخطوة 4: الهجرة والبذور (أول مرة)

الهجرات تُنفَّذ أثناء البناء على Vercel. أما **البذور (seed)** فشغّليه يدوياً بعد أول نشر ناجح:

```bash
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
npx prisma db seed
```

- `SEED_IF_EMPTY=true` يتخطى الـ seed إن وُجد مستخدم مسبقاً.

## الخطوة 5: زيارة الموقع

- المتجر: **https://amarat.vercel.app**
- دخول الإدارة: **https://amarat.vercel.app/admin/login**

## تحديث الموقع

أي دفع `push` إلى فرع `main` يعيد النشر تلقائياً.

## نقاط انتباه

- لا ترفعي ملف `.env` الحقيقي إلى GitHub.
- رفع الملفات المحلي `public/uploads/` **لا يعمل** على Vercel — استخدمي Blob أو تخزيناً سحابياً.
- الـ seed الافتراضي **يمسح** بيانات كثيرة قبل إعادة التعبئة.
