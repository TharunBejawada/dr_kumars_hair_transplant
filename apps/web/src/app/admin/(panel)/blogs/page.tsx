import Link from "next/link";
import { listBlogs } from "@/lib/db/blogs";
import BlogsTable from "@/components/admin/BlogsTable";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const blogs = await listBlogs();
  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-semibold">Blogs</h1>
        <Link href="/admin/blogs/new" className="rounded-lg bg-brand px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-brand-2">+ Add blog</Link>
      </div>
      <BlogsTable initial={blogs} />
    </div>
  );
}
