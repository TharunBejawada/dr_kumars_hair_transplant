"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { uploadImage } from "@/lib/upload-client";

function Btn({ on, active, label, children }: { on: () => void; active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={on} className={`h-8 min-w-8 rounded px-2 text-[13px] font-medium hover:bg-gray-200 ${active ? "bg-brand text-white hover:bg-brand" : ""}`}>{children}</button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  async function addImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      try { editor.chain().focus().setImage({ src: await uploadImage(f), alt: "" }).run(); } catch (e) { alert(e instanceof Error ? e.message : "Upload failed"); }
    };
    input.click();
  }
  function addLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://…)", prev ?? "https://");
    if (url === null) return;
    if (url === "") return void editor.chain().focus().unsetLink().run();
    if (!/^(https?:|mailto:|tel:)/i.test(url)) return void alert("Links must start with https://, mailto: or tel:");
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }
  const c = () => editor.chain().focus();
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-gray-50 p-1.5">
      <select aria-label="Heading" className="h-8 rounded border border-gray-300 bg-white px-1 text-[13px]" value={editor.isActive("heading", { level: 1 }) ? "1" : editor.isActive("heading", { level: 2 }) ? "2" : editor.isActive("heading", { level: 3 }) ? "3" : "0"}
        onChange={(e) => { const l = Number(e.target.value); l ? c().setHeading({ level: l as 1 | 2 | 3 }).run() : c().setParagraph().run(); }}>
        <option value="0">Normal</option><option value="1">Heading 1</option><option value="2">Heading 2</option><option value="3">Heading 3</option>
      </select>
      <Btn label="Bold" active={editor.isActive("bold")} on={() => c().toggleBold().run()}><b>B</b></Btn>
      <Btn label="Italic" active={editor.isActive("italic")} on={() => c().toggleItalic().run()}><i>I</i></Btn>
      <Btn label="Underline" active={editor.isActive("underline")} on={() => c().toggleUnderline().run()}><u>U</u></Btn>
      <Btn label="Bulleted list" active={editor.isActive("bulletList")} on={() => c().toggleBulletList().run()}>• List</Btn>
      <Btn label="Numbered list" active={editor.isActive("orderedList")} on={() => c().toggleOrderedList().run()}>1. List</Btn>
      <Btn label="Align left" active={editor.isActive({ textAlign: "left" })} on={() => c().setTextAlign("left").run()}>⬅</Btn>
      <Btn label="Align center" active={editor.isActive({ textAlign: "center" })} on={() => c().setTextAlign("center").run()}>↔</Btn>
      <Btn label="Align right" active={editor.isActive({ textAlign: "right" })} on={() => c().setTextAlign("right").run()}>➡</Btn>
      <label className="flex h-8 items-center gap-1 px-1 text-[12px]" title="Text colour">A<input type="color" aria-label="Text colour" className="h-5 w-6 cursor-pointer" onChange={(e) => c().setColor(e.target.value).run()} /></label>
      <label className="flex h-8 items-center gap-1 px-1 text-[12px]" title="Highlight">▮<input type="color" aria-label="Highlight colour" defaultValue="#ffff00" className="h-5 w-6 cursor-pointer" onChange={(e) => c().setHighlight({ color: e.target.value }).run()} /></label>
      <Btn label="Link" active={editor.isActive("link")} on={addLink}>🔗</Btn>
      <Btn label="Insert image" on={addImage}>🖼</Btn>
      <Btn label="Clear formatting" on={() => c().unsetAllMarks().clearNodes().run()}>Clear</Btn>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, minHeight = 180 }: { value: string; onChange: (html: string) => void; minHeight?: number }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false } }),
      Image, TextStyle, Color, Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editorProps: { attributes: { class: "prose-editor px-4 py-3 outline-none", style: `min-height:${minHeight}px` } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });
  if (!editor) return <div className="h-[220px] rounded-lg border bg-white" />;
  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-brand">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
