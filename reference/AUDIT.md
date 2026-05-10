# مراجعة معمارية — amarabijouxx.youcan.store

تم استخراج HTML إلى `reference/html/*.html` عبر `node scripts/fetch-reference-html.mjs`.

## Design tokens (من `:root` وملف الصفحة الرئيسية)

| Token | قيمة المرجع |
|--------|----------------|
| Primary | `#000000` |
| Secondary | `#4D4D4D` |
| Body background | `#FFFFFF` |
| خط السعر / تمييز | `#00BF0E` (يظهر في CSS المضمّن للمنتجات) |
| حدود البطاقات | `#f0f0f0` |
| Footer background | `#fefefe` |
| Danger | `#F44336` |

## الشريط العلوي (notice-bar)

- خلفية: `#000000`
- نص أبيض، وسط.
- المحتوى المرجعي (EN): **Every Piece Tells a Story** – Discover Yours Today.

## الرأس (desktop)

- خلفية بيضاء، حد سفلي `#f0f0f0`.
- ترتيب DOM في HTML المرجعي: عمود الروابط، ثم الشعار، ثم البحث والسلة.
- الروابط: Home → `/` ، About Us → `/pages/about-us` ، Contact → `/pages/contact-us` ، Collections → `/collections`.
- الشعار: PNG من CDN (`others/4HtQ6lTkZpKdv7Uw11W7RWs1q7vY2hjH4O5eKWTm.png`).

## الأقسام الرئيسية (الصفحة الرئيسية)

1. شريط إشعار أسود.
2. Header ثابت مع حد فاصل.
3. Hero / banners (صور من مجلد `others/*.jpg`).
4. عنوان **FEATURED COLLECTION** + وسيط "Find everything you want".
5. شبكة منتجات بأسعار قديمة وخطّ مخفّض بلون التمييز الأخضر.
6. قسم منتج مفصل مع نموذج حقول (Full Name, Phone, Home Address, Order Now).
7. عنوان **PROMOTIONS** + شبكة منتجات.
8. Footer أعمدة: Terms and conditions | Contact-us | About the store.

## الفئات في `/collections`

Earrings, Sets, Necklaces, Bangles, Rings — روابط `/collections/{slug}`.

## ملاحظات

- المرجع **LTR / إنجليزي**؛ النسخة هنا **RTL / عربي** مع الحفاظ على الهيكل والألوان والمسافات النسبية.
- عدد المنتجات الفريدة على المتجر الحي محدود؛ تم إثراء الـ seed محلياً مع صور من CDN محمّلة إلى `public/products/`.
