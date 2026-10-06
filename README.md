# Cargo Hub

Карго бизнес нээх, ажиллуулах, вэбсайт ашиглах чиглэлээр сургалт явуулах
платформ. Next.js (App Router) + Supabase (Postgres/Auth) дээр суурилсан.

- **Хэрэглэгчийн тал**: сургалтын каталог, бүртгэл, хичээл үзэх, явцын хяналт.
- **Админ тал** (`/admin`): курс/хичээл удирдах, имэйл/утсаар хэрэглэгч хайж
  нууц үг үүсгэх, Premium эрх идэвхжүүлэх, ерөнхий статистик.

## Төлбөрийн загвар

Курс тус бүрд үнэ байхгүй — платформ **нэг л удаагийн 120,000₮ Premium
багц** зардаг (`lib/access.ts`):

1. Хэрэглэгч бүртгүүлээд `is_free_preview = true` гэж тэмдэглэсэн
   хичээлүүдийг үнэ төлбөргүй үзнэ.
2. Бусад (premium) хичээлийг үзэхийн тулд хэрэглэгч Хаан банк 5119007473
   (Энхамгалан) руу 120,000₮ шилжүүлээд, админтай холбогддог.
3. Админ `/admin/users` дээр имэйл/утсаар хайгаад **"Идэвхжүүлэх (6 сар)"**
   дарна — энэ нь `profiles.premium_until`-г 6 сарын дараах огноогоор
   тохируулна.
4. 6 сар дуустал тухайн хэрэглэгч бүх premium хичээлийг чөлөөтэй үзнэ,
   дараа нь автоматаар зөвхөн үнэгүй хичээлүүдэд буцна (админ хүссэн үедээ
   дахин идэвхжүүлж/цуцалж болно).

Банкны мэдээлэл, үнэ, хугацааг `lib/access.ts`-д өөрчлөх боломжтой.

## Суурилуулах

1. Хамаарлуудыг суулгах:

   ```bash
   npm install
   ```

2. [supabase.com](https://supabase.com) дээр үнэгүй төсөл үүсгэ.

3. Project Settings → API хэсгээс `Project URL`, `anon public` болон
   `service_role` (secret) түлхүүрүүдийг аваад `.env.local` файлд бич
   (`.env.local.example`-г хуулж эхэл):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   SUPABASE_SERVICE_ROLE_KEY=xxxxx
   ```

   `SUPABASE_SERVICE_ROLE_KEY` нь RLS-ийг тойрч бүх өгөгдөлд хандах маш нууц
   түлхүүр — зөвхөн серверт (админ хэрэглэгчийн нууц үг үүсгэх, имэйл харах)
   ашиглагдана. `NEXT_PUBLIC_` угтваргүй тул клиент рүү хэзээ ч илгээгдэхгүй,
   гэхдээ `.env.local`-аас бусад хэнтэй ч бүү хуваалцаарай.

4. Supabase SQL Editor дээр дараах файлуудыг дараалалаар нь ажиллуул:
   - `supabase/migrations/0001_init.sql` — хүснэгт, RLS, бүртгэлийн trigger
   - `supabase/migrations/0002_seed.sql` — жишээ 3 курс, хичээл (заавал биш)
   - `supabase/migrations/0003_lesson_media.sql` — хичээлийн медиа талбарууд
   - `supabase/migrations/0004_paywall.sql` — курс/хичээлийн `price`/`has_paid`
     багана (одоо ашиглагдахгүй, дараагийн migration-аар орлуулагдсан)
   - `supabase/migrations/0005_drop_quiz_certificates.sql` — шалгалт/гэрчилгээний хүснэгтүүдийг устгах
   - `supabase/migrations/0006_platform_premium.sql` — `profiles.premium_until`
     (платформ даяарх Premium эрх) + бүртгэлийн үед утас хадгалах
   - `supabase/migrations/0007_course_marketing_fields.sql` — курсын үргэлжлэх
     хугацаа, "юу сурах вэ" жагсаалт
   - `supabase/migrations/0008_lesson_content_rls.sql` — **заавал**: төлбөрийн
     хаалтыг өгөгдлийн санд хэрэгжүүлнэ. Үүнийг ажиллуулаагүй бол
     `lesson_outline` view байхгүй тул хичээлийн жагсаалт хоосон харагдана.
   - `supabase/migrations/0009_lesson_questions_feedback.sql` — хичээлийн
     асуулт/хариулт, "ойлгомжтой байсан уу" үнэлгээ
   - `supabase/migrations/0010_launch_hardening.sql` — **заавал**: хэрэглэгч
     өөрийгөө админ/Premium болгох, төлбөргүйгээр Premium хичээл нээх
     цоорхойг хаана; нүүр хуудасны статистик, индексүүд.
   - `supabase/migrations/0011_payment_requests.sql` — **заавал**: Premium
     хуудасны "Би төлбөрөө шилжүүлсэн" товч, админы Төлбөрүүд хуудас.
   - `supabase/migrations/0012_payment_request_details.sql` — шилжүүлсэн
     хүний нэр, татгалзсан шалтгаан, хүсэлт цуцлах.
   - `supabase/migrations/0013_payment_requests_access.sql` — **заавал**:
     төлбөрийн хүсэлтийн бүх тохиргоог (хүснэгт, багана, эрх, баталгаажуулах
     функц) дангаараа бүрэн хийнэ. 0011/0012 ажилласан эсэхээс үл хамаарна.
   - `supabase/migrations/0014_admin_user_directory.sql` — админы Хэрэглэгчид
     хуудсанд имэйл, аватар, сүүлд нэвтэрсэн огноог харуулна.

5. [cloudinary.com](https://cloudinary.com) дээр үнэгүй акаунт үүсгэ (админ
   панелаас зураг/видео/аудио/PDF байршуулахад хэрэгтэй). Dashboard-ын нүүр
   хуудаснаас **Cloud name**, **API Key**, **API Secret**-ийг аваад
   `.env.local`-д нэмнэ:

   ```bash
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxxxx
   CLOUDINARY_API_KEY=xxxxx
   CLOUDINARY_API_SECRET=xxxxx
   ```

   `CLOUDINARY_API_SECRET`-г `NEXT_PUBLIC_` угтваргүйгээр хадгална — энэ нь
   зөвхөн серверт (upload зөвшөөрлийн гарын үсэг үүсгэхэд) ашиглагдаж, клиент
   рүү хэзээ ч илгээгдэхгүй.

6. Хөгжүүлэлтийн серверийг ажиллуул:

   ```bash
   npm run dev
   ```

   [http://localhost:3000](http://localhost:3000) хаягаар нээ.

## Ажиллуулахын өмнөх шалгах жагсаалт

1. Supabase SQL Editor дээр `0010_launch_hardening.sql`, `0011_payment_requests.sql`,
   `0012_payment_request_details.sql`, `0013_payment_requests_access.sql`-г ажиллуулсан.
2. Hosting (Vercel г.м.) дээр `.env.local`-ийн бүх утга + доорхыг тохируулсан:

   ```bash
   NEXT_PUBLIC_SITE_URL=https://таны-домэйн.mn
   NEXT_PUBLIC_SUPPORT_MESSENGER_URL=https://m.me/<page-username>
   NEXT_PUBLIC_SUPPORT_PHONE=99112233
   NEXT_PUBLIC_SUPPORT_EMAIL=info@таны-домэйн.mn
   ```

   Холбоо барих утгууд хоосон бол Premium хуудсанд "баримтаа илгээх" суваг
   харагдахгүй — хэрэглэгч төлбөрөө хийгээд хэнд хандахаа мэдэхгүй болно.
3. Supabase → Authentication → URL Configuration: **Site URL**-ийг домэйнээр,
   **Redirect URLs**-д `https://таны-домэйн.mn/auth/confirm` нэмсэн. Үгүй бол
   бүртгэл баталгаажуулах, нууц үг сэргээх имэйлийн холбоос ажиллахгүй.
4. Supabase-ийн үнэгүй имэйл илгээгч цагт цөөн имэйл л явуулдаг тул олон
   хэрэглэгчтэй болохоор Authentication → SMTP Settings дээр өөрийн SMTP
   (Resend, Brevo г.м.) тохируулах.
5. Google Search Console-д `https://таны-домэйн.mn/sitemap.xml`-г бүртгүүлэх.

## Төлбөр баталгаажуулах

Суралцагч дансаар шилжүүлэхдээ гүйлгээний утга дээр утасны дугаараа бичээд,
Premium хуудсан дээр **"Би төлбөрөө шилжүүлсэн"** товч дарна. Хүсэлт админ
панелийн **Төлбөрүүд** (`/admin/payments`) хэсэгт гарч, цэсэнд тоогоор
харагдана. Админ банкны аппаараа утасны дугаараар тулгаад "Төлбөр орсон" эсвэл
"Орж ирээгүй" дарна. Баталгаажуулахад Premium 6 сараар (үлдсэн хугацаан дээр
нэмэгдэж) нээгдэнэ.

Үүнийг ашиглахын тулд `supabase/migrations/0013_payment_requests_access.sql`-ийг
Supabase → SQL Editor дээр нэг удаа ажиллуулна. Энэ файл дангаараа бүх
тохиргоог хийдэг тул 0011, 0012-ийг ажиллуулсан эсэх хамаагүй. Ажиллуулаагүй байхад сайт
хуучин аргаараа (баримтаа админд илгээх) ажиллана.

## Видео хичээлүүдийг бөөнөөр оруулах

Хамгийн хялбар нь: админ панелийн **Хичээл оруулах** (`/admin/import`) хуудсанд
`hicheel` фолдероо сонгоод "Оруулж эхлэх" дарна. Видео таны хөтчөөс шууд
Cloudinary руу явах тул компьютер дээр түлхүүр, Node.js хэрэггүй.

Командын мөрөөр оруулах бол:

`scripts/hicheel.json` нь курс, хичээлийн нэр, дараалал, үнэгүй хичээлийн
тоо болон аль видео файлыг ашиглахыг тодорхойлно. `scripts/import-lessons.mjs`
видеонуудыг Cloudinary руу upload хийж, Supabase-д курс, хичээлүүдийг үүсгэнэ.
`.env.local`-оос Supabase (service role) болон Cloudinary түлхүүрийг уншина.

```bash
npm run import:lessons -- --dry-run   # бүх видео олдож байгаа эсэхийг шалгана
npm run import:lessons                # upload хийнэ, курсууд нуугдмал үүснэ
npm run import:lessons -- --publish   # курсуудыг сайтад гаргаж, жишээ курсуудыг нууна
```

Анхдагч фолдер нь `Desktop/hicheel`. Өөр газар байвал `--dir "<зам>"` гэж
зааж өгнө. Дахин ажиллуулахад аюулгүй: видеотой хичээлийг дахин upload
хийхгүй, зөвхөн нэр, дараалал, үнэгүй эсэхийг JSON-оос шинэчилнэ.

## Админ болох

Анх бүртгүүлсэн хэрэглэгч бүр `user` эрхтэй үүснэ. Өөрийгөө админ болгохын
тулд Supabase SQL Editor дээр (бүртгүүлсний дараа):

```sql
update public.profiles set role = 'admin' where id = '<таны user id>';
```

`user id`-г Authentication → Users хэсгээс эсвэл:

```sql
select id, email from auth.users;
```

командаар олж болно. Үүний дараа `/admin` руу нэвтэрч болно.

## Технологи

- **Next.js 16** (App Router, Server Actions, `proxy.ts` route protection,
  `sitemap.xml`/`robots.txt`, аюулгүй байдлын HTTP header-үүд)
- **Supabase**: Postgres + Auth + Row Level Security
- **Tailwind CSS v4** — брэндийн өнгө (`app/globals.css`)
- **react-markdown** — хичээлийн агуулга
- **Cloudinary** — хичээлийн зураг/видео/аудио/слайд байршуулалт (клиент →
  Cloudinary шууд, signed upload; `lib/actions/admin/cloudinary.ts`)

## Бүтэц

```
app/(site)/        Нийтийн болон хэрэглэгчийн хуудсууд (landing, courses, dashboard)
app/admin/          Админ панел (role-guarded)
components/          UI, layout, course, auth, admin компонентууд
lib/actions/         Server actions (мутаци)
lib/data/            Уншилтын query функцууд
lib/supabase/        Browser/server/proxy клиентүүд
supabase/migrations/ SQL schema, RLS, seed
```
