import { notFound } from "next/navigation";
import { getBlog } from "@/lib/db/blogs";
import BlogForm from "@/components/admin/BlogForm";

export const dynamic = "force-dynamic";

export default async function EditBlog({ params }: { params: Promise<{ id: string }> }) {
  const blog = await getBlog((await params).id);
  if (!blog) notFound();
  return (
    <div className="mx-auto max-w-[980px]">
      <h1 className="mb-5 text-[26px] font-semibold">Edit blog</h1>
      <BlogForm blog={blog} />
    </div>
  );
}
