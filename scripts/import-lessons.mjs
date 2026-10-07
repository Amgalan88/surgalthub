#!/usr/bin/env node
/**
 * Uploads the lesson videos from a local folder to Cloudinary and creates the
 * matching courses and lessons in Supabase, following scripts/hicheel.json.
 *
 *   node scripts/import-lessons.mjs --dry-run      check every file is found
 *   node scripts/import-lessons.mjs                upload, courses stay hidden
 *   node scripts/import-lessons.mjs --publish      show the courses on the site
 *
 * Options:
 *   --dir <path>   lesson folder (default: Desktop/hicheel in the home folder)
 *
 * Safe to run again: lessons that already have a video are not re-uploaded,
 * and titles, order and free/paid flags are refreshed from the JSON file.
 * Reads Supabase and Cloudinary keys from .env.local in the project root.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv"]);
// Cloudinary refuses single-request video uploads above this on the free plan.
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const PREFERRED_PREFIX = "audo_enhanced";

function parseArgs(argv) {
  const args = { dryRun: false, publish: false, dir: join(homedir(), "Desktop", "hicheel") };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--publish") args.publish = true;
    else if (arg === "--dir") args.dir = argv[++i];
    else throw new Error(`Танигдаагүй сонголт: ${arg}`);
  }
  return args;
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`.env.local дотор ${name} утга алга байна.`);
  return value;
}

/** Case, Unicode form and dash style differ between how names are typed and stored. */
function normalize(text) {
  return text.normalize("NFC").toLowerCase().replace(/[‐-―]/g, "-");
}

function findVideo(baseDir, folder, match) {
  const dir = join(baseDir, folder);
  if (!existsSync(dir)) throw new Error(`Фолдер олдсонгүй: ${dir}`);

  const needle = normalize(match);
  const candidates = readdirSync(dir).filter((name) => {
    const full = join(dir, name);
    return (
      statSync(full).isFile() &&
      VIDEO_EXTENSIONS.has(extname(name).toLowerCase()) &&
      normalize(name).includes(needle)
    );
  });

  // Each video exists both raw and with cleaned-up audio; take the cleaned one.
  const preferred = candidates.filter((name) => normalize(name).startsWith(PREFERRED_PREFIX));
  const picked = preferred.length > 0 ? preferred : candidates;

  const where = folder ? `"${folder}"` : "үндсэн фолдер";
  if (picked.length === 0) throw new Error(`${where} дотроос "${match}" нэртэй видео олдсонгүй.`);
  if (picked.length > 1) {
    throw new Error(`${where} дотор "${match}" нэртэй ${picked.length} видео байна: ${picked.join(", ")}`);
  }
  return join(dir, picked[0]);
}

async function uploadToCloudinary(filePath, folder, { cloudName, apiKey, apiSecret }) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const form = new FormData();
  form.append("file", new Blob([readFileSync(filePath)]), basename(filePath));
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: "POST",
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Cloudinary: ${body.error?.message ?? res.statusText}`);
  return { url: body.secure_url, duration: Number(body.duration) || 0 };
}

/** First frame a few seconds in, as a JPEG — Cloudinary renders it on request. */
function posterFromVideo(url) {
  return url
    .replace("/video/upload/", "/video/upload/so_3,w_1280,h_720,c_fill/")
    .replace(/\.[a-z0-9]+$/i, ".jpg");
}

function formatDuration(totalSeconds) {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} минут видео`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} цаг ${rest} минут видео` : `${hours} цаг видео`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(readFileSync(join(ROOT, "scripts", "hicheel.json"), "utf8"));

  console.log(`Хичээлийн фолдер: ${args.dir}\n`);

  // 1. Every file must resolve before anything is uploaded.
  let missing = 0;
  for (const course of manifest.courses) {
    console.log(`■ ${course.title}`);
    course.lessons.forEach((lesson, i) => {
      try {
        lesson.path = findVideo(args.dir, lesson.folder, lesson.match);
        const sizeMb = statSync(lesson.path).size / 1024 / 1024;
        const free = i < course.freeLessons ? "  [үнэгүй]" : "";
        const tooBig = sizeMb * 1024 * 1024 > MAX_UPLOAD_BYTES ? "  ⚠ 100MB-аас их" : "";
        console.log(`  ${i + 1}. ${lesson.title}${free}  ←  ${basename(lesson.path)} (${sizeMb.toFixed(1)} MB)${tooBig}`);
        if (tooBig) missing++;
      } catch (err) {
        missing++;
        console.log(`  ${i + 1}. ${lesson.title}  ✗ ${err.message}`);
      }
    });
    console.log("");
  }

  if (missing > 0) {
    console.error(`${missing} хичээл дээр асуудал гарлаа. scripts/hicheel.json-оо шалгаад дахин ажиллуулна уу.`);
    process.exit(1);
  }
  if (args.dryRun) {
    console.log("Бүх видео олдлоо. Оруулахын тулд --dry-run-гүйгээр дахин ажиллуулна уу.");
    return;
  }

  // 2. Upload and write to the database.
  loadEnvFile(join(ROOT, ".env.local"));
  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
  const cloudinary = {
    cloudName: requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
  };

  for (const course of manifest.courses) {
    console.log(`■ ${course.title}`);

    const { data: existing, error: findError } = await supabase
      .from("courses")
      .select("id, published")
      .eq("slug", course.slug)
      .maybeSingle();
    if (findError) throw findError;

    const courseFields = {
      slug: course.slug,
      title: course.title,
      description: course.description,
      outcomes: course.outcomes,
      price: 0,
      published: args.publish ? true : (existing?.published ?? false),
    };
    const { data: saved, error: saveError } = existing
      ? await supabase.from("courses").update(courseFields).eq("id", existing.id).select("id").single()
      : // courses.track is a legacy required column the site no longer uses.
        await supabase.from("courses").insert({ ...courseFields, track: "opening" }).select("id").single();
    if (saveError) throw saveError;
    const courseId = saved.id;

    const { data: currentLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("id, title, video_url")
      .eq("course_id", courseId);
    if (lessonsError) throw lessonsError;
    const byTitle = new Map(currentLessons.map((l) => [l.title, l]));

    let totalSeconds = 0;
    let uploadedCount = 0;
    let coverImage = null;

    for (const [i, lesson] of course.lessons.entries()) {
      const prior = byTitle.get(lesson.title);
      let videoUrl = prior?.video_url ?? null;
      let note = "өмнө нь оруулсан";

      process.stdout.write(`  ${i + 1}. ${lesson.title} … `);
      if (!videoUrl) {
        const uploaded = await uploadToCloudinary(lesson.path, `cargohub/${course.slug}`, cloudinary);
        videoUrl = uploaded.url;
        totalSeconds += uploaded.duration;
        uploadedCount++;
        note = "оруулсан";
      }

      const fields = {
        course_id: courseId,
        title: lesson.title,
        order_index: i,
        is_free_preview: i < course.freeLessons,
        video_url: videoUrl,
      };
      const { error } = prior
        ? await supabase.from("lessons").update(fields).eq("id", prior.id)
        : await supabase.from("lessons").insert({ ...fields, content_md: "" });
      if (error) throw error;

      if (i === 0) coverImage = posterFromVideo(videoUrl);
      console.log(note);
    }

    const courseExtras = { cover_image: coverImage };
    // Only fresh uploads report a length, so the total is known only when all were uploaded now.
    if (uploadedCount === course.lessons.length && totalSeconds > 0) courseExtras.duration_label = formatDuration(totalSeconds);
    const { error: extrasError } = await supabase.from("courses").update(courseExtras).eq("id", courseId);
    if (extrasError) throw extrasError;
    console.log("");
  }

  if (args.publish && manifest.demoCourseSlugs?.length) {
    const { error } = await supabase
      .from("courses")
      .update({ published: false })
      .in("slug", manifest.demoCourseSlugs);
    if (error) throw error;
    console.log("Жишээ (demo) курсуудыг сайтаас нуулаа.");
  }

  console.log(
    args.publish
      ? "Дууслаа. Курсууд сайт дээр харагдаж байна."
      : "Дууслаа. Курсууд одоогоор нуугдмал байна — admin панелаас шалгаад, бэлэн бол --publish-ээр дахин ажиллуулна уу."
  );
}

main().catch((err) => {
  console.error(`\nАлдаа: ${err.message ?? err}`);
  process.exit(1);
});
