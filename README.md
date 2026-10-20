# طلبك عندنا

منصة توصيل طعام عربية (Next.js 15 + Tailwind CSS v4) بهوية بصرية دافئة، وبوابة تسجيل بالتحقق الذكي، ومطابخ تراثية، وتعديل وجبات، ولعبة سندوتشي، وسلة، وتتبع وصول، ولوحة مالك.

## التشغيل

```bash
npm install
copy .env.example .env.local
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

- تسجيل المستخدم إلزامي قبل التصفح.
- لوحة المالك: `/admin/login` — اضبط `ADMIN_PASSWORD` (و`ADMIN_USER` اختيارياً) في `.env.local`؛ لا توجد كلمة مرور افتراضية داخل الكود.
- ضع `OPENAI_API_KEY` في `.env.local` لتفعيل gpt-4o (رؤية البطاقة، الوصفات، حارس السندويتش، ETA). بدون المفتاح يعمل المنطق الاحتياطي المحلي + TheMealDB.

## الهيكل

```
src/app            صفحات الواجهة ومسارات API
src/app/api/ai     تحقق البطاقة، العنوان، التعديل، سندوتشي، الوصفة، ETA
src/data           100 وجبة + طبقات السندويتش + المطابخ
src/lib            GPS، تخزين محلي، OpenAI، قواعد الذكاء الاصطناعي
src/components     الحراسة، الترويسة، الحالة العامة
```

## قاعدة البيانات الموصى بها (Supabase)

للإنتاج انقل `localStorage` إلى جداول:

```sql
profiles (id uuid pk, full_name text, address text, lat float, lng float, verified bool, created_at timestamptz)
meals (id uuid pk, cuisine text, name text, description text, price numeric, image text)
ingredients (id uuid pk, meal_id uuid fk, name text, essential bool)
orders (id uuid pk, user_id uuid, subtotal numeric, delivery numeric, total numeric, eta_seconds int, distance_km float, created_at timestamptz)
order_items (id uuid pk, order_id uuid, meal_id text, qty int, removed jsonb, extras jsonb)
```

Firebase بديل مناسب: Authentication + Firestore لنفس المجموعات.

## الذكاء الاصطناعي

| الميزة | المسار |
| --- | --- |
| فحص البطاقة | `POST /api/ai/verify-id` |
| صلاحية العنوان GPS | `POST /api/ai/verify-address` |
| إزالة مكون | `POST /api/ai/customize` |
| حارس سندوتشي | `POST /api/ai/sandwich-guard` |
| استخراج وصفة للمالك | `POST /api/ai/recipe` |
| وقت الوصول | `POST /api/ai/eta` |

this website developed by Mohammed Mahmoud
