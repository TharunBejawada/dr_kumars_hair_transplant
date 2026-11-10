import BlogForm from "@/components/admin/BlogForm";

export default function NewBlog() {
  return (
    <div className="mx-auto max-w-[980px]">
      <h1 className="mb-5 text-[26px] font-semibold">Add blog</h1>
      <BlogForm />
    </div>
  );
}
