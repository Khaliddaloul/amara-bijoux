import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&auto=format&fit=crop&q=80`;

const pi = (urls: string[]) => urls.map((u, i) => ({ url: u, alt: `صورة ${i + 1}` }));
const j = (v: unknown) => JSON.stringify(v);

async function clear() {
  await prisma.inventoryMovement.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.abandonedCart.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.marketingCampaign.deleteMany();
  await prisma.storePopup.deleteMany();
  await prisma.pixelConfig.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.page.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.media.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.shippingZone.deleteMany();
  await prisma.taxRate.deleteMany();
  await prisma.navigationMenu.deleteMany();
  await prisma.homeBanner.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();
}

async function main() {
  await clear();

  const passwordHash = bcrypt.hashSync("Admin@123", 12);
  const owner = await prisma.user.create({
    data: {
      email: "admin@amara.ma",
      passwordHash,
      name: "مالك المتجر",
      role: "OWNER",
    },
  });

  const catRings = await prisma.category.create({
    data: {
      slug: "rings",
      name: "خواتم",
      description: "خواتم فاخرة بأشكال عصرية وكلاسيكية",
      sortOrder: 1,
      image: img("1617038220319-276d3dafab21"),
      seoTitle: "خواتم ذهبية وفضية",
      seoDescription: "تشكيلة واسعة من الخواتم",
    },
  });
  const catGold = await prisma.category.create({
    data: {
      slug: "gold-rings",
      name: "خواتم ذهبية",
      parentId: catRings.id,
      sortOrder: 1,
      image: img("1605100803763-24700667edf4"),
    },
  });
  const catSilver = await prisma.category.create({
    data: {
      slug: "silver-rings",
      name: "خواتم فضية",
      parentId: catRings.id,
      sortOrder: 2,
      image: img("1611591437281-460bfbe1220a"),
    },
  });
  const catDiamond = await prisma.category.create({
    data: {
      slug: "diamond-rings",
      name: "خواتم ماسية",
      parentId: catRings.id,
      sortOrder: 3,
      image: img("1515562141207-7a88fb7ce338"),
    },
  });

  const catNecklaces = await prisma.category.create({
    data: {
      slug: "necklaces",
      name: "قلائد",
      sortOrder: 2,
      image: img("1599643478513-773809661adf"),
    },
  });
  const catBracelets = await prisma.category.create({
    data: {
      slug: "bracelets",
      name: "أساور",
      sortOrder: 3,
      image: img("1611591437281-460bfbe1220a"),
    },
  });
  const catEarrings = await prisma.category.create({
    data: {
      slug: "earrings",
      name: "أقراط",
      sortOrder: 4,
      image: img("1535632066927-ab7c9ab60908"),
    },
  });
  const catSets = await prisma.category.create({
    data: {
      slug: "sets",
      name: "أطقم",
      sortOrder: 5,
      image: img("1515562141207-7a88fb7ce338"),
    },
  });

  const baseProducts: Array<{
    slug: string;
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number;
    costPerItem?: number;
    sku: string;
    vendor: string;
    status: string;
    featured: boolean;
    qty: number;
    cats: string[];
    imgs: ReturnType<typeof pi>;
    tags: string[];
    variants?: Array<{ title: string; price: number; qty: number; options: Record<string, string> }>;
  }> = [
    {
      slug: "tricolor-bangle-ring-set",
      name: "طقم أسورة وخاتم ثلاثي الألوان",
      description: "<p>مجموعة فاخرة تجمع الذهبي والفضي والوردي بلمسة عصرية.</p>",
      shortDescription: "طقم كامل بإطلالة برّاقة",
      price: 320,
      compareAtPrice: 520,
      costPerItem: 140,
      sku: "PRD-1001",
      vendor: "Amara",
      status: "ACTIVE",
      featured: true,
      qty: 48,
      cats: [catRings.id, catGold.id],
      imgs: pi([img("1617038220319-276d3dafab21"), img("1611591437281-460bfbe1220a")]),
      tags: ["جديد", "الأكثر مبيعاً"],
      variants: [
        { title: "أس 52", price: 320, qty: 24, options: { size: "52" } },
        { title: "أس 56", price: 330, qty: 24, options: { size: "56" } },
      ],
    },
    {
      slug: "triple-layer-sparkle-set",
      name: "طقم لامع ثلاثي الطبقات",
      description: "<p>قلادة وأقراط وخاتم متناسقون بلمعان فاخر.</p>",
      price: 280,
      compareAtPrice: 450,
      sku: "PRD-1002",
      vendor: "Amara",
      status: "ACTIVE",
      featured: true,
      qty: 32,
      cats: [catSets.id],
      imgs: pi([img("1599643478513-773809661adf"), img("1515562141207-7a88fb7ce338")]),
      tags: ["طقم"],
      variants: [
        { title: "فضي", price: 280, qty: 16, options: { color: "silver" } },
        { title: "ذهبي", price: 295, qty: 16, options: { color: "gold" } },
      ],
    },
    {
      slug: "butterfly-bangle-ring-set",
      name: "طقم فراشة — أسورة وخاتم",
      description: "<p>تصميم فراشات بحجارة لامعة بلون فضي أنيق.</p>",
      price: 195,
      compareAtPrice: 320,
      sku: "PRD-1003",
      vendor: "Amara",
      status: "ACTIVE",
      featured: true,
      qty: 40,
      cats: [catSets.id],
      imgs: pi([img("1523760474687-dba67d1e0ed9")]),
      tags: ["هدايا"],
    },
    {
      slug: "leaf-necklace-earrings",
      name: "طقم ورق شجر ملون",
      description: "<p>قلادة وأقراط بألوان نابضة للصيف.</p>",
      price: 210,
      compareAtPrice: 360,
      sku: "PRD-1004",
      vendor: "Amara",
      status: "ACTIVE",
      featured: false,
      qty: 28,
      cats: [catNecklaces.id, catEarrings.id],
      imgs: pi([img("1599643478513-773809661adf")]),
      tags: ["صيفي"],
    },
    {
      slug: "queen-waterdrop-crystal-set",
      name: "طقم كريستال قطرة الماء",
      description: "<p>قلادة طويلة مع أقراط متدلية وخاتم متناسق.</p>",
      price: 380,
      compareAtPrice: 590,
      sku: "PRD-1005",
      vendor: "Amara",
      status: "ACTIVE",
      featured: true,
      qty: 18,
      cats: [catSets.id],
      imgs: pi([img("1617038220319-276d3dafab21")]),
      tags: ["سهرة"],
      variants: [
        { title: "فضي", price: 380, qty: 9, options: { color: "silver" } },
        { title: "ذهبي", price: 399, qty: 9, options: { color: "gold" } },
      ],
    },
    {
      slug: "minimal-gold-band-ring",
      name: "خاتم بسيط بلون ذهبي دافئ",
      description: "<p>خاتم رفيع يناسب التراص أو الارتداء المنفرد.</p>",
      price: 120,
      compareAtPrice: 180,
      sku: "PRD-1006",
      vendor: "Amara",
      status: "ACTIVE",
      featured: false,
      qty: 80,
      cats: [catRings.id, catGold.id],
      imgs: pi([img("1605100803763-24700667edf4")]),
      tags: ["بسيط"],
    },
  ];

  const extra: typeof baseProducts = [];
  const extrasPayload = [
    ["statement-chain-necklace", "قلادة سلسلة بيان", catNecklaces.id],
    ["cuff-bracelet-silver", "سوار كفّ فضي", catBracelets.id],
    ["pearl-drop-earrings", "أقراط لؤلؤ متدلية", catEarrings.id],
    ["evening-choker-set", "طقم شوكر مسائي", catSets.id],
    ["rose-quartz-ring", "خاتم كوارتز وردي", catRings.id],
    ["tennis-bracelet-style", "سوار تنس لامع", catBracelets.id],
    ["hoop-earrings-medium", "أقراط حلق متوسطة", catEarrings.id],
    ["layered-heart-necklace", "قلادة قلوب متعددة الطبقات", catNecklaces.id],
    ["bridal-jewelry-set", "طقم عروس كامل", catSets.id],
    ["mesh-watch-rose", "ساعة شبكية ذهبية وردية", catBracelets.id],
    ["opal-ring-deluxe", "خاتم أوبال فاخر", catRings.id],
    ["charm-bracelet", "سوار تعليقات", catBracelets.id],
    ["stud-earrings-mini", "أقراط دبوسية صغيرة", catEarrings.id],
    ["layered-gold-necklace", "قلادة ذهبية متعددة الطبقات", catNecklaces.id],
    ["crystal-pendant", "دلاية كريستال", catNecklaces.id],
    ["vintage-ring-set", "طقم خواتم عتيقة", catSets.id],
    ["tennis-necklace", "قلادة تنس", catNecklaces.id],
    ["minimal-hoops", "حلقات بسيطة كبيرة", catEarrings.id],
  ];

  let skuCounter = 1007;
  for (const [slug, name, catId] of extrasPayload) {
    extra.push({
      slug,
      name,
      description: `<p>${name} — جودة عالية وتفاصيل دقيقة.</p>`,
      price: 90 + (skuCounter % 17) * 15,
      compareAtPrice: 200 + (skuCounter % 9) * 30,
      sku: `PRD-${skuCounter}`,
      vendor: "Amara",
      status: skuCounter % 5 === 0 ? "DRAFT" : "ACTIVE",
      featured: skuCounter % 7 === 0,
      qty: 20 + (skuCounter % 40),
      cats: [catId],
      imgs: pi([img("1515562141207-7a88fb7ce338"), img("1617038220319-276d3dafab21")]),
      tags: ["متجر"],
    });
    skuCounter++;
  }

  const allProductDefs = [...baseProducts, ...extra];

  const createdProducts: { id: string; price: number; name: string; sku: string | null }[] =
    [];

  for (const p of allProductDefs) {
    const product = await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        sku: p.sku,
        barcode: `BAR-${p.sku}`,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        costPerItem: p.costPerItem ?? Math.round(p.price * 0.45),
        taxable: true,
        trackQuantity: true,
        quantity: p.qty,
        weight: 0.05,
        status: p.status,
        featured: p.featured,
        vendor: p.vendor,
        tags: j(p.tags),
        images: j(p.imgs),
        seoTitle: p.name,
        seoDescription: p.shortDescription ?? p.name,
        categories: { connect: p.cats.map((id) => ({ id })) },
        variants: p.variants
          ? {
              create: p.variants.map((v) => ({
                title: v.title,
                sku: `${p.sku}-${v.title}`,
                price: v.price,
                compareAtPrice: p.compareAtPrice,
                quantity: v.qty,
                options: j(v.options),
              })),
            }
          : undefined,
      },
    });
    createdProducts.push({
      id: product.id,
      price: p.price,
      name: p.name,
      sku: p.sku,
    });
    if (p.variants?.length) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          delta: p.qty,
          reason: "تهيئة مخزون أولي",
        },
      });
    }
  }

  const colSummer = await prisma.collection.create({
    data: {
      slug: "summer-edit",
      name: "تشكيلة الصيف",
      description: "قطع خفيفة ولامعة",
      image: img("1535632066927-ab7c9ab60908"),
      type: "MANUAL",
      products: {
        connect: createdProducts.slice(0, 8).map((p) => ({ id: p.id })),
      },
    },
  });

  await prisma.collection.create({
    data: {
      slug: "luxury-night",
      name: "سهرات فاخرة",
      description: "للمظهر البرّاق ليلاً",
      image: img("1599643478513-773809661adf"),
      type: "AUTOMATIC",
      conditions: j({ tag: "سهرة", priceMin: 250 }),
    },
  });

  await prisma.collection.create({
    data: {
      slug: "best-sellers",
      name: "الأكثر مبيعاً",
      description: "اختيارات عملائنا",
      image: img("1515562141207-7a88fb7ce338"),
      type: "MANUAL",
      products: {
        connect: createdProducts.slice(3, 12).map((p) => ({ id: p.id })),
      },
    },
  });

  void colSummer;

  const customers = await Promise.all(
    Array.from({ length: 15 }).map((_, i) =>
      prisma.customer.create({
        data: {
          email: `customer${i + 1}@example.ma`,
          phone: `+2126${String(10000000 + i).slice(0, 8)}`,
          firstName: ["فاطمة", "سارة", "نورة", "ليلى", "ياسمين"][i % 5],
          lastName: ["العلوي", "بنعلي", "الإدريسي", "المرابط", "أمزيان"][i % 5],
          totalSpent: 400 + i * 120,
          ordersCount: 1 + (i % 4),
          tags: i % 3 === 0 ? j(["VIP"]) : j([]),
          notes: i % 5 === 0 ? "يفضل التوصيل المسائي" : null,
        },
      }),
    ),
  );

  const citiesPool = ["الدار البيضاء", "الرباط", "فاس", "مراكش", "طنجة"];
  for (let i = 0; i < 10; i++) {
    const c = customers[i];
    await prisma.address.create({
      data: {
        customerId: c.id,
        name: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
        phone: c.phone ?? "+212600000000",
        city: citiesPool[i % citiesPool.length],
        region: "المغرب",
        address: "زنقة الورد، دار 12",
        isDefault: true,
      },
    });
  }

  const statuses: string[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
    "PENDING",
    "CONFIRMED",
  ];
  const payStats: string[] = ["PENDING", "PAID", "PAID", "PAID", "REFUNDED"];

  let orderNum = 1001;
  for (let i = 0; i < 30; i++) {
    const cust = customers[i % customers.length];
    const p1 = createdProducts[i % createdProducts.length];
    const p2 = createdProducts[(i + 3) % createdProducts.length];
    const q1 = 1 + (i % 2);
    const q2 = i % 4 === 0 ? 2 : 1;
    const subtotal = p1.price * q1 + p2.price * q2;
    const shipping = subtotal > 500 ? 0 : 35;
    const tax = Math.round(subtotal * 0.0);
    const discount = i % 6 === 0 ? 40 : 0;
    const total = subtotal + shipping + tax - discount;

    await prisma.order.create({
      data: {
        orderNumber: orderNum++,
        customerId: cust.id,
        customerName: `${cust.firstName ?? ""} ${cust.lastName ?? ""}`.trim(),
        customerPhone: cust.phone ?? "+212600000000",
        customerEmail: cust.email,
        shippingAddress: j({
          city: "الدار البيضاء",
          address: "شارع محمد الخامس، عمارة 3",
          region: "المغرب",
        }),
        billingAddress: j({
          city: "الدار البيضاء",
          address: "نفس عنوان الشحن",
        }),
        subtotal,
        shippingCost: shipping,
        tax,
        discount,
        total,
        currency: "MAD",
        status: statuses[i % statuses.length],
        paymentStatus: payStats[i % payStats.length],
        paymentMethod: i % 5 === 0 ? "BANK" : "COD",
        shippingMethod: "أمانة",
        trackingNumber: i % 3 === 0 ? `TRK-${100000 + i}` : null,
        notes: i % 7 === 0 ? "يرجى تغليف هدايا" : null,
        internalNotes: i % 8 === 0 ? "تم التحقق من الدفع" : null,
        tags: i % 4 === 0 ? j(["مهم"]) : j([]),
        items: {
          create: [
            {
              productId: p1.id,
              name: p1.name,
              sku: p1.sku,
              price: p1.price,
              quantity: q1,
              total: p1.price * q1,
            },
            {
              productId: p2.id,
              name: p2.name,
              sku: p2.sku,
              price: p2.price,
              quantity: q2,
              total: p2.price * q2,
            },
          ],
        },
      },
    });
  }

  const discounts = [
    {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minPurchase: 200,
      appliesTo: "ALL",
    },
    {
      code: "SHIPFREE",
      type: "FREE_SHIPPING",
      value: 0,
      minPurchase: 400,
      appliesTo: "ALL",
    },
    {
      code: "SAVE50",
      type: "FIXED",
      value: 50,
      minPurchase: 350,
      appliesTo: "PRODUCTS",
      targets: [createdProducts[0].id],
    },
    {
      code: "SET15",
      type: "PERCENTAGE",
      value: 15,
      minPurchase: 0,
      appliesTo: "CATEGORIES",
      targets: [catSets.id],
    },
    {
      code: "BUY2",
      type: "BUY_X_GET_Y",
      value: 1,
      metadata: { buy: 2, get: 1 },
      appliesTo: "ALL",
    },
  ];

  for (const d of discounts) {
    await prisma.discount.create({
      data: {
        code: d.code,
        type: d.type,
        value: d.value,
        minPurchase: d.minPurchase ?? null,
        usageLimit: 500,
        usedCount: Math.floor(Math.random() * 40),
        startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
        isActive: true,
        appliesTo: d.appliesTo,
        targets: "targets" in d && d.targets ? j(d.targets) : null,
        metadata: "metadata" in d && d.metadata ? j(d.metadata) : null,
      },
    });
  }

  for (let i = 0; i < 5; i++) {
    await prisma.abandonedCart.create({
      data: {
        customerEmail: `guest${i}@mail.ma`,
        customerPhone: `+2127${String(2000000 + i).slice(0, 7)}`,
        items: j([
          { productId: createdProducts[i].id, qty: 1, price: createdProducts[i].price },
        ]),
        subtotal: createdProducts[i].price,
      },
    });
  }

  for (let i = 0; i < 10; i++) {
    const prod = createdProducts[i % createdProducts.length];
    const cust = customers[i % customers.length];
    await prisma.review.create({
      data: {
        productId: prod.id,
        customerId: cust.id,
        rating: 4 + (i % 2),
        title: i % 2 === 0 ? "رائع" : "جودة ممتازة",
        body: "التغليف أنيق والتوصيل سريع. أنصح بالشراء من المتجر.",
        isApproved: i % 3 !== 0,
        staffReply: i % 4 === 0 ? "شكراً لثقتك بنا!" : null,
      },
    });
  }

  await prisma.page.createMany({
    data: [
      {
        slug: "about",
        title: "عن المتجر",
        content: "<p>أمارا للمجوهرات — قطع مختارة بعناية لأناقتك.</p>",
        isPublished: true,
        seoTitle: "عن أمارا",
        seoDescription: "تعرف على قصتنا",
      },
      {
        slug: "terms",
        title: "الشروط والأحكام",
        content: "<p>شروط استخدام الموقع والشراء.</p>",
        isPublished: true,
      },
      {
        slug: "privacy",
        title: "سياسة الخصوصية",
        content: "<p>نحترم بياناتك الشخصية.</p>",
        isPublished: true,
      },
      {
        slug: "shipping-returns",
        title: "الشحن والإرجاع",
        content: "<p>مدة التوصيل 2-5 أيام عمل.</p>",
        isPublished: true,
      },
    ],
  });

  await prisma.blogPost.createMany({
    data: [
      {
        slug: "how-to-care-jewelry",
        title: "كيف تعتني بمجوهراتك",
        excerpt: "نصائح سريعة للحفاظ على اللمعان",
        content: "<p>تجنب المواد الكيميائية القوية...</p>",
        featuredImage: img("1515562141207-7a88fb7ce338"),
        author: "فريق أمارا",
        tags: j(["عناية", "مجوهرات"]),
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        slug: "summer-trends",
        title: "صيحات الصيف 2026",
        excerpt: "ألوان وأشكال رائجة",
        content: "<p>السوار المتعدد والقلائد الطبقية...</p>",
        featuredImage: img("1599643478513-773809661adf"),
        author: "أمارا",
        tags: j(["موضة"]),
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
  });

  await prisma.shippingZone.create({
    data: {
      name: "المغرب — المدن الرئيسية",
      regions: j(["الدار البيضاء", "الرباط", "فاس", "مراكش", "طنجة"]),
      rates: j([
        { name: "عادي", price: 35, minOrder: 0 },
        { name: "مجاني", price: 0, minOrder: 400 },
      ]),
    },
  });

  await prisma.taxRate.create({
    data: { name: "ضريبة عامة", rate: 0, country: "MA", region: "*" },
  });

  const settingsPayload = {
    general: {
      storeName: "أمارا للمجوهرات",
      logo: "",
      favicon: "",
      primaryColor: "#c9a24d",
      currency: "MAD",
    },
    contact: {
      email: "contact@amara.ma",
      phone: "+212600000000",
      whatsapp: "+212600000000",
      address: "الدار البيضاء، المغرب",
    },
    socialLinks: { instagram: "amara.bijoux", facebook: "", tiktok: "" },
    seo: {
      defaultTitle: "أمارا للمجوهرات",
      defaultDescription: "متجر مجوهرات فاخرة مع الدفع عند الاستلام",
      ogImage: "",
    },
    checkout: {
      requireEmail: false,
      allowGuest: true,
      cod: true,
      bankInfo: "Bank: CIH — IBAN MA00....",
    },
    notifications: {
      orderEmail: true,
      smsTemplate: "تم استلام طلبك #{orderNumber}",
    },
    storefront: {
      sections: [
        { id: "hero", type: "hero", visible: true, order: 0 },
        { id: "featured", type: "featured_products", visible: true, order: 1 },
        { id: "categories", type: "categories_grid", visible: true, order: 2 },
        { id: "banner", type: "banner", visible: true, order: 3 },
        { id: "newsletter", type: "newsletter", visible: true, order: 4 },
      ],
    },
  };

  for (const [key, value] of Object.entries(settingsPayload)) {
    await prisma.setting.create({
      data: { key, value: JSON.stringify(value) },
    });
  }

  await prisma.navigationMenu.createMany({
    data: [
      {
        name: "رئيسية",
        placement: "header",
        items: j([
          { label: "الرئيسية", href: "/" },
          { label: "المتجر", href: "/shop" },
          { label: "من نحن", href: "/about" },
        ]),
      },
      {
        name: "تذييل",
        placement: "footer",
        items: j([
          { label: "الشروط", href: "/pages/terms" },
          { label: "الخصوصية", href: "/pages/privacy" },
        ]),
      },
    ],
  });

  await prisma.homeBanner.createMany({
    data: [
      {
        title: "مجموعات جديدة",
        subtitle: "اكتشفي الأناقة بلمسة ذهبية",
        image: img("1617038220319-276d3dafab21"),
        ctaLabel: "تسوقي الآن",
        ctaHref: "/shop",
        sortOrder: 0,
        isActive: true,
      },
      {
        title: "هدايا مميزة",
        subtitle: "تغليف فاخر وتوصيل سريع",
        image: img("1599643478513-773809661adf"),
        ctaLabel: "عرض المجموعة",
        ctaHref: "/category/sets",
        sortOrder: 1,
        isActive: true,
      },
    ],
  });

  await prisma.marketingCampaign.createMany({
    data: [
      {
        title: "إطلالة صيفية",
        type: "EMAIL",
        body: "اكتشفي تشكيلة الصيف الجديدة",
        audience: j({ segment: "active_customers" }),
        status: "DRAFT",
      },
      {
        title: "تذكير واتساب",
        type: "WHATSAPP",
        body: "مرحباً {firstName}، طلبك قيد التجهيز",
        audience: j({ tags: ["VIP"] }),
        status: "SCHEDULED",
      },
    ],
  });

  await prisma.storePopup.create({
    data: {
      title: "خصم ترحيبي",
      message: "استخدمي كود WELCOME10 عند الدفع",
      ctaLabel: "تسوقي",
      ctaHref: "/shop",
      delaySec: 4,
      isActive: true,
    },
  });

  await prisma.pixelConfig.createMany({
    data: [
      { provider: "facebook", pixelId: "0000000000", isActive: false },
      { provider: "tiktok", pixelId: "", isActive: false },
    ],
  });

  await prisma.media.createMany({
    data: [
      {
        url: img("1515562141207-7a88fb7ce338"),
        type: "image/jpeg",
        size: 120000,
        alt: "بانر",
        folder: "banners",
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: owner.id,
        type: "ORDER",
        title: "طلب جديد",
        body: "تم استلام طلب جديد #1001",
        link: "/admin/orders",
        isRead: false,
      },
      {
        userId: owner.id,
        type: "STOCK",
        title: "تنبيه مخزون",
        body: "منتج يقترب من النفاد",
        link: "/admin/inventory",
        isRead: true,
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        userId: owner.id,
        action: "LOGIN",
        entity: "User",
        entityId: owner.id,
        metadata: j({ ip: "127.0.0.1" }),
      },
      {
        userId: owner.id,
        action: "UPDATE_PRODUCT",
        entity: "Product",
        entityId: createdProducts[0].id,
        metadata: j({ field: "price" }),
      },
    ],
  });

  console.log("✅ Seed OK — Owner:", owner.email, "| Products:", createdProducts.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
