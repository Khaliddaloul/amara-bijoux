# Amara Bijoux — متجر + لوحة تحكم (Next.js 14)

Arabic-first RTL storefront plus an expansive admin console inspired by Shopify Admin (simplified UX for Arabic merchants).

## متطلبات التشغيل / Requirements

- Node.js 18+ (تم الاختبار مع Node 24)
- npm

## التثبيت السريع / Quick start

على **macOS**، إن ظهر خطأ `EMFILE: too many open files` أثناء `npm run dev`، ارفع حد الملفات المفتوحة في الجلسة قبل التشغيل:

```bash
ulimit -n 10240
```

المشروع يضبط كذلك **webpack watchOptions** في `next.config.mjs` (poll + تجاهل `node_modules`). يمكنك تفعيل وضع الاستطلاع عبر Watchpack بإضافة `WATCHPACK_POLLING=true` إلى `.env.local` (انظر `.env.example`).

```bash
cd /Users/user/amara-bijoux-clone
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

ثم افتح:

- المتجر: `http://localhost:3000`
- لوحة التحكم: `http://localhost:3000/admin`
- تسجيل الدخول: `http://localhost:3000/admin/login`

## بيانات الدخول الافتراضية / Default admin credentials

- البريد / Email: `admin@amara.ma`
- كلمة المرور / Password: `Admin@123`

**مهم جداً:** غيّري كلمة المرور فوراً في أي بيئة حقيقية، ولا ترفعي ملف `.env` إلى GitHub.

## البناء للإنتاج / Production build

```bash
npm run build
npm start
```

### SEO والاكتشاف (Google والذكاء الاصطناعي)

- عيّني المتغير **`NEXT_PUBLIC_SITE_URL`** إلى عنوان النطاق العام (مثل `https://amara-bijoux.ma`) في الإنتاج؛ بدونه يُستخدم `http://localhost:3000` كاحتياطي.
- بعد التشغيل يمكن التحقق من:
  - **`/sitemap.xml`**، **`/robots.txt`**، **`/feed.xml`**
  - **`/llms.txt`** (ثابت)، **`/llms-full.txt`** (ديناميكي من قاعدة البيانات)، **`/ai.txt`** (روابط للمساعدين)
  - صور Open Graph ديناميكية (nodejs): **`/api/og/product/[id]`**، **`/api/og/article/[id]`**، **`/api/og/category/[id]`**
- لتوليد **`public/og-default.jpg`** وأيقونات **`public/icons/*.png`** محلياً:

```bash
node scripts/generate-seo-assets.mjs
```

## قاعدة البيانات / Database

- التطوير المحلي يستخدم **SQLite** (`prisma/dev.db`) عبر متغير `DATABASE_URL="file:./dev.db"` في `.env`.
- تم تمثيل الحقول المعقدة (قوائم، صور، عناوين) كسلاسل JSON لضمان توافق SQLite مع Prisma في كل البيئات.

### الترقية إلى Postgres (موصى به للإنتاج)

1. أنشئ قاعدة بيانات Postgres (مثلاً **Neon** مجاناً).
2. حدّث `DATABASE_URL` إلى رابط Postgres.
3. شغّلي:

```bash
npx prisma db push
npx prisma db seed
```

## النشر على Vercel / Deploying to Vercel

1. اربطي المستودع بـ Vercel.
2. أضيفي متغيرات البيئة في لوحة Vercel:
   - `DATABASE_URL` — رابط Postgres (لا تستخدمي SQLite على Vercel للإنتاج).
   - `AUTH_SECRET` — قيمة عشوائية طويلة (`openssl rand -base64 32`).
   - `NEXTAUTH_URL` — عنوان النطاق النهائي، مثل `https://your-domain.com`.
3. نفّذي `prisma generate` أثناء البناء (الأمر موجود في `postinstall`).
4. بعد النشر، شغّلي migrations/seed ضد قاعدة الإنتاج من جهازك المحلي أو عبر pipeline آمن.

### ملاحظة عن التخزين / Storage note

رفع الصور محلياً إلى `public/uploads/` مناسب للتطوير. على Vercel يُفضّل **S3-compatible storage** أو خدمة وسائط خارجية لأن نظام الملفات غير دائم بين عمليات البناء.

### حملات البريد / Campaign email

لتفعيل الإرسال الفعلي من لوحة التحكم، أضيفي بيانات SMTP في `.env` (مثل `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) واربطيها في طبقة الإرسال. النسخة الحالية تعتبر زر «إرسال» تحديثاً للحالة المحلية فقط دون اتصال SMTP.

## بنية المشروع / Architecture

- `src/app` — واجهة المتجر + لوحة التحكم (`/admin/*`) + مسارات API (`/api/*`).
- `prisma/schema.prisma` — مخطط تجاري موسّع (منتجات، طلبات، عملاء، إعدادات، حملات، وسائط، إلخ).
- `prisma/seed.ts` — بيانات تجريبة غنية (24 منتجاً، 30 طلباً، عملاء، خصومات، صفحات، إلخ).
- `src/auth.ts` — NextAuth v5 (credentials).
- `src/middleware.ts` — حماية مسارات `/admin` ما عدا `/admin/login`.

## استنساخ الواجهة من المرجع / Reference storefront clone

- الواجهة العامة (`/`، `/collections`، `/category/*`، `/product/*`، السلة، الدفع، الصفحات الثابتة) مصممة لمطابقة **الهيكل والألوان** لمتجر YouCan المرجعي قدر الإمكان، مع **RTL وعربية**. تم استخراج HTML إلى `reference/html/` وتدوين الرموز في `reference/AUDIT.md`.
- **مهم:** هذا الموقع نسخة مطابقة للتعلم والتطوير من المرجع `amarabijouxx.youcan.store`. قبل أي إطلاق تجاري استبدلي المحتوى والصور والعلامة التجارية بموارد المتجر الفعلية، وراجعي حقوق الصور والنصوص.

## حالة الميزات / Feature status

- **يعمل اليوم:** المتجر يقرأ من قاعدة البيانات، السلة (Zustand + localStorage)، الدفع عند الاستلام عبر `/api/orders`، لوحة تحكم مع KPI ورسوم بيانية، جداول الطلبات/المنتجات، تفاصيل الطلب، صفحات CMS من جدول `Page`.
- **هيكل جاهز + قوالب Stub:** أغلب أقسام Shopify-level (تسويق متقدم، محرّر متجر كامل، تحليلات عميقة، صلاحيات STAFF التفصيلية، استيراد CSV ضخم…) لها مسارات وواجهات أساسية يمكن إكمالها فوق نفس الطبقة دون كسر التوجيه.

## السكربتات المفيدة / Useful scripts

```bash
npm run db:push     # مزامنة المخطط مع SQLite محلياً
npm run db:seed     # إعادة تعبئة البيانات التجريبية
npm run db:studio   # واجهة Prisma Studio
```

## ترخيص / License

خاص بالمشروع التجريبي — عدّلي حسب احتياجك.
