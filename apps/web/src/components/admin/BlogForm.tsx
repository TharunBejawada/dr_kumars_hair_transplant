"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { blogStatuses, type Blog, type BlogStatus } from "@drkumar/shared";
import { isoToIstInput, istInputToIso, slugify } from "@/lib/ist";
import { uploadImage } from "@/lib/upload-client";
import RichTextEditor from "./RichTextEditor";

type Section = { heading: string; description: string };
type Faq = { question: string; answer: string };

const statusHelp: Record<BlogStatus, string> = {
  draft: "Only visible here. Not on the website.",
  scheduled: "Goes live automatically at the date & time below.",
  published: "Live on the website now.",
  inactive: "Hidden from the website.",
};
const field = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const label = "mb-1 block text-[14px] font-semibold text-gray-700";
const card = "rounded-xl bg-white p-5 shadow-sm md:p-6";

export default function BlogForm({ blog }: { blog?: Blog }) {
  const router = useRouter();
  const [title, setTitle] = useState(blog?.blogTitle ?? "");
  const [url, setUrl] = useState(blog?.url ?? "");
  const urlTouched = useRef(!!blog);
  const [image, setImage] = useState(blog?.blogImage ?? "");
  const [categories, setCategories] = useState<string[]>(blog?.categories ?? []);
  const [catInput, setCatInput] = useState("");
  const [author, setAuthor] = useState(blog?.author ?? "");
  const [timeline, setTimeline] = useState(blog?.timeline ?? "");
  const [sections, setSections] = useState<Section[]>(blog?.extraFields ?? []);
  const [faqs, setFaqs] = useState<Faq[]>(blog?.faqs ?? []);
  const [seoTitle, setSeoTitle] = useState(blog?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(blog?.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords] = useState(blog?.metaKeywords ?? "");
  const [status, setStatus] = useState<BlogStatus>(blog?.status ?? "draft");
  const [publishAt, setPublishAt] = useState(isoToIstInput(blog?.publishAt));

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const err = (k: string) => errors[k]?.[0] && <p role="alert" className="mt-1 text-[13px] text-red-600">{errors[k][0]}</p>;

  function addCategory() {
    const c = catInput.trim();
    if (c && !categories.includes(c)) setCategories([...categories, c]);
    setCatInput("");
  }

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setMessage(null);
    try { setImage(await uploadImage(f)); } catch (x) { setMessage({ ok: false, text: x instanceof Error ? x.message : "Upload failed" }); }
    setUploading(false);
    e.target.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const iso = publishAt ? istInputToIso(publishAt) : null;
    if (status === "scheduled" && !iso) { setErrors({ publishAt: ["Pick a publish date & time"] }); return; }
    setBusy(true);
    setErrors({});
    const body = {
      blogTitle: title, blogImage: image, categories, author, timeline, extraFields: sections, faqs,
      seoTitle, metaDescription, metaKeywords, url, status, publishAt: status === "scheduled" || status === "published" ? iso : null,
    };
    const res = await fetch(blog ? `/api/admin/blogs/${blog.id}` : "/api/admin/blogs", {
      method: blog ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false);
    if (res?.ok) {
      setMessage({ ok: true, text: "Saved." });
      if (!blog) router.replace(`/admin/blogs/${data.blog.id}`);
      else router.refresh();
      return;
    }
    setErrors(data?.issues ?? {});
    setMessage({ ok: false, text: data?.error ?? "Could not save. Please try again." });
  }

  const move = <T,>(arr: T[], set: (a: T[]) => void, i: number, d: -1 | 1) => {
    const j = i + d; if (j < 0 || j >= arr.length) return;
    const n = [...arr]; [n[i], n[j]] = [n[j], n[i]]; set(n);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Publishing */}
      <section className={card}>
        <h2 className="mb-3 text-[17px] font-semibold">Publishing</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={label} htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as BlogStatus)} className={`${field} capitalize`}>
              {blogStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <p className="mt-1 text-[13px] text-gray-500">{statusHelp[status]}</p>
          </div>
          {(status === "scheduled" || status === "published") && (
            <div>
              <label className={label} htmlFor="publishAt">{status === "scheduled" ? "Publish on (IST)" : "Published on (IST) — leave empty for now"}</label>
              <input id="publishAt" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className={field} />
              {err("publishAt")}
              {status === "scheduled" && publishAt && istInputToIso(publishAt) && new Date(istInputToIso(publishAt)!) <= new Date() && (
                <p className="mt-1 text-[13px] text-amber-600">That time has already passed — the blog will go live immediately.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Basics */}
      <section className={card}>
        <h2 className="mb-3 text-[17px] font-semibold">Blog details</h2>
        <div className="mb-5">
          <span className={label}>Blog image</span>
          <label className="block w-fit cursor-pointer">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onImage} className="hidden" />
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Blog cover" className="h-40 w-80 max-w-full rounded-lg border-2 border-brand/40 object-cover" />
            ) : (
              <div className="flex h-40 w-80 max-w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500">{uploading ? "Uploading…" : "Click to upload (max 5 MB)"}</div>
            )}
          </label>
          {image && <button type="button" onClick={() => setImage("")} className="mt-1 text-[13px] text-red-600">Remove image</button>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={label} htmlFor="title">Blog title</label>
            <input id="title" value={title} onChange={(e) => { setTitle(e.target.value); if (!urlTouched.current) setUrl(slugify(e.target.value)); }} className={field} placeholder="Blog title" />
            {err("blogTitle")}
          </div>
          <div>
            <label className={label} htmlFor="author">Author</label>
            <input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className={field} placeholder="Author name" />
          </div>
          <div>
            <label className={label} htmlFor="timeline">Timeline (date)</label>
            <input id="timeline" type="date" value={timeline} onChange={(e) => setTimeline(e.target.value)} className={field} />
            {err("timeline")}
          </div>
          <div className="md:col-span-2">
            <label className={label} htmlFor="cat">Categories</label>
            <div className="flex gap-2">
              <input id="cat" value={catInput} onChange={(e) => setCatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }} className={field} placeholder="Add category and press Enter" />
              <button type="button" onClick={addCategory} className="rounded-lg bg-gray-800 px-4 text-white">Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-[13px] font-medium text-brand">{c}
                  <button type="button" aria-label={`Remove ${c}`} onClick={() => setCategories(categories.filter((x) => x !== c))} className="text-[15px] leading-none">×</button></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Extra fields */}
      <section className={card}>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-[17px] font-semibold">Content sections</h2>
          <button type="button" onClick={() => setSections([...sections, { heading: "", description: "" }])} className="rounded-lg bg-gray-800 px-4 py-2 text-[14px] text-white">+ Add field</button></div>
        <div className="space-y-5">
          {sections.map((s, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-center justify-between text-[13px] text-gray-500"><span>Section {i + 1}</span>
                <span className="space-x-3">
                  <button type="button" onClick={() => move(sections, setSections, i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" onClick={() => move(sections, setSections, i, 1)} disabled={i === sections.length - 1}>↓</button>
                  <button type="button" onClick={() => setSections(sections.filter((_, k) => k !== i))} className="text-red-600">Remove</button></span></div>
              <input value={s.heading} onChange={(e) => setSections(sections.map((x, k) => (k === i ? { ...x, heading: e.target.value } : x)))} placeholder="Heading" className={`${field} mb-3`} />
              <RichTextEditor value={s.description} onChange={(html) => setSections((cur) => cur.map((x, k) => (k === i ? { ...x, description: html } : x)))} />
            </div>
          ))}
          {!sections.length && <p className="text-[14px] text-gray-500">No sections yet. Add a heading and rich-text body.</p>}
        </div>
      </section>

      {/* FAQs */}
      <section className={card}>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-[17px] font-semibold">FAQs</h2>
          <button type="button" onClick={() => setFaqs([...faqs, { question: "", answer: "" }])} className="rounded-lg bg-gray-800 px-4 py-2 text-[14px] text-white">+ Add FAQ</button></div>
        <div className="space-y-5">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-center justify-between text-[13px] text-gray-500"><span>Question {i + 1}</span>
                <button type="button" onClick={() => setFaqs(faqs.filter((_, k) => k !== i))} className="text-red-600">Remove</button></div>
              <input value={f.question} onChange={(e) => setFaqs(faqs.map((x, k) => (k === i ? { ...x, question: e.target.value } : x)))} placeholder="Enter question…" className={`${field} mb-3`} />
              <RichTextEditor minHeight={110} value={f.answer} onChange={(html) => setFaqs((cur) => cur.map((x, k) => (k === i ? { ...x, answer: html } : x)))} />
            </div>
          ))}
        </div>
      </section>

      {/* SEO */}
      <section className={card}>
        <h2 className="mb-3 text-[17px] font-semibold">SEO</h2>
        <div className="grid gap-4">
          <div><label className={label} htmlFor="seoTitle">SEO title</label><input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={field} /></div>
          <div><label className={label} htmlFor="metaDescription">Meta description</label><textarea id="metaDescription" rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={field} /></div>
          <div><label className={label} htmlFor="metaKeywords">Meta keywords</label><input id="metaKeywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} className={field} /></div>
          <div><label className={label} htmlFor="url">URL (slug)</label>
            <div className="flex items-center gap-2"><span className="text-gray-500">/blogs/</span><input id="url" value={url} onChange={(e) => { urlTouched.current = true; setUrl(slugify(e.target.value)); }} className={field} placeholder="my-blog-url" /></div>
            {err("url")}</div>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 rounded-xl bg-white/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur">
        <button disabled={busy || uploading} className="rounded-lg bg-brand px-8 py-3 text-[16px] font-semibold text-white hover:bg-brand-2 disabled:opacity-60">
          {busy ? "Saving…" : blog ? "Save changes" : status === "scheduled" ? "Schedule blog" : status === "published" ? "Publish blog" : "Save blog"}
        </button>
        <button type="button" onClick={() => router.push("/admin/blogs")} className="rounded-lg border border-gray-300 px-6 py-3 font-medium">Back to list</button>
        {message && <p role="status" className={`text-[14px] ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>}
      </div>
    </form>
  );
}
