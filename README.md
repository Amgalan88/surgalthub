# Cargo Hub

Карго бизнес нээх, ажиллуулах, вэбсайт ашиглах чиглэлээр сургалт явуулах
платформ. Next.js (App Router) + Supabase (Postgres/Auth) дээр суурилсан.

- **Хэрэглэгчийн тал**: сургалтын каталог, бүртгэл, хичээл үзэх, явцын хяналт,
  төгсөлтийн шалгалт, PDF гэрчилгээ.
- **Админ тал** (`/admin`): курс/хичээл/шалгалтын асуулт удирдах, хэрэглэгчийн
  эрх солих, ерөнхий статистик.

## Суурилуулах

1. Хамаарлуудыг суулгах:

   ```bash
   npm install
   ```

2. [supabase.com](https://supabase.com) дээр үнэгүй төсөл үүсгэ.

3. Project Settings → API хэсгээс `Project URL` болон `anon public` түлхүүрийг
   аваад `.env.local` файлд бич (`.env.local.example`-г хуулж эхэл):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   ```

4. Supabase SQL Editor дээр дараах файлуудыг дараалалаар нь ажиллуул:
   - `supabase/migrations/0001_init.sql` — хүснэгт, RLS, бүртгэлийн trigger
   - `supabase/migrations/0002_seed.sql` — жишээ 3 курс, хичээл, шалгалт (заавал биш)
   - `supabase/migrations/0003_lesson_media.sql` — хичээлийн медиа талбарууд

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

- **Next.js 16** (App Router, Server Actions, `proxy.ts` route protection)
- **Supabase**: Postgres + Auth + Row Level Security
- **Tailwind CSS v4** — брэндийн өнгө (`app/globals.css`)
- **pdf-lib** — гэрчилгээний PDF үүсгэлт (`app/api/certificates/[id]/route.ts`)
- **react-markdown** — хичээлийн агуулга
- **Cloudinary** — хичээлийн зураг/видео/аудио/слайд байршуулалт (клиент →
  Cloudinary шууд, signed upload; `lib/actions/admin/cloudinary.ts`)

## Бүтэц

```
app/(site)/        Нийтийн болон хэрэглэгчийн хуудсууд (landing, courses, dashboard)
app/admin/          Админ панел (role-guarded)
app/api/             Route handlers (гэрчилгээ PDF)
components/          UI, layout, course, auth, admin компонентууд
lib/actions/         Server actions (мутаци)
lib/data/            Уншилтын query функцууд
lib/supabase/        Browser/server/proxy клиентүүд
supabase/migrations/ SQL schema, RLS, seed
```
