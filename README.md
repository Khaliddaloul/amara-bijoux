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
# أنشئ قاعدة Postgres مجانية على https://neon.tech ثم ضع DATABASE_URL في `.env`
npx prisma migrate dev
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

## قاعدة البيانات / Database

- **Postgres** (موصى به محلياً وعلى Vercel) عبر `DATABASE_URL` — أنشئ مشروعاً مجانياً على [Neon](https://neon.tech) وانسخ سلسلة الاتصال إلى `.env` (انظر `.env.example`).
- الحقول المعقدة (قوائم، صور متعددة، خيارات المتغيرات…) ما زالت مخزّنة كنص **JSON داخل أعمدة `String`/`TEXT`** لتوافق المخطط التاريخي؛ يمكن لاحقاً ترحيلها إلى نوع `Json` في Prisma.

## النشر / Deployment

**دليل كامل خطوة بخطوة (عربي + إنجليزي):** [`DEPLOY.md`](./DEPLOY.md) — Vercel + Neon، اسم المشروع `amarat`، الرابط `https://amarat.vercel.app`.

### تحذير مهم: رفع الصور على Vercel / Image uploads on Vercel

- على الجهاز المحلي يمكن حفظ الملفات في `public/uploads/`.
- **على Vercel نظام الملفات للقراءة فقط** — لا يمكن الاعتماد على مجلد `uploads` الدائم. فعّل **Vercel Blob** (أو R2 / UploadThing) وأضف `BLOB_READ_WRITE_TOKEN`؛ راجع قسم التخزين في `DEPLOY.md`.

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
npm run db:migrate  # تطوير: إنشاء/تطبيق هجرات (migrate dev)
npm run db:deploy   # إنتاج: prisma migrate deploy
npm run db:seed     # إعادة تعبئة البيانات التجريبة (تحذير: تمسح البيانات الحالية ما لم تُضبط SEED_IF_EMPTY)
npm run db:studio   # واجهة Prisma Studio
npm run vercel-build # نفس أمر بناء Vercel (generate + migrate deploy + next build)
```

## ترخيص / License

خاص بالمشروع التجريبي — عدّلي حسب احتياجك.
