"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { uploadImage } from "@/lib/upload-client";

function Btn({
  on,
  active,
  label,
  children,
  className = "",
}: {
  on: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={on}
      className={`h-8 min-w-8 rounded px-2 text-[12.5px] font-medium transition cursor-pointer select-none hover:bg-gray-200 ${
        active ? "bg-brand text-white hover:bg-brand" : "text-gray-700"
      } ${className}`}
    >
      {children}
    </button>
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
      try {
        editor.chain().focus().setImage({ src: await uploadImage(f), alt: "" }).run();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Upload failed");
      }
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

  function insertCostTablePreset() {
    editor
      .chain()
      .focus()
      .insertContent(
        `<table>
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Estimated Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>800–1200 Grafts</td>
              <td>₹40,000 – ₹70,000</td>
            </tr>
            <tr>
              <td>1200–1800 Grafts</td>
              <td>₹70,000 – ₹1,00,000</td>
            </tr>
            <tr>
              <td>1800–2500 Grafts</td>
              <td>₹1,00,000 – ₹1,50,000+</td>
            </tr>
          </tbody>
        </table>`
      )
      .run();
  }

  const c = () => editor.chain().focus();
  const isInTable = editor.isActive("table");

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50/90 p-1.5 text-gray-700">
      <select
        aria-label="Heading"
        className="h-8 rounded border border-gray-300 bg-white px-1 text-[13px] outline-none"
        value={
          editor.isActive("heading", { level: 1 })
            ? "1"
            : editor.isActive("heading", { level: 2 })
            ? "2"
            : editor.isActive("heading", { level: 3 })
            ? "3"
            : "0"
        }
        onChange={(e) => {
          const l = Number(e.target.value);
          l ? c().setHeading({ level: l as 1 | 2 | 3 }).run() : c().setParagraph().run();
        }}
      >
        <option value="0">Normal</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <Btn label="Bold" active={editor.isActive("bold")} on={() => c().toggleBold().run()}>
        <b>B</b>
      </Btn>
      <Btn label="Italic" active={editor.isActive("italic")} on={() => c().toggleItalic().run()}>
        <i>I</i>
      </Btn>
      <Btn label="Underline" active={editor.isActive("underline")} on={() => c().toggleUnderline().run()}>
        <u>U</u>
      </Btn>
      <Btn label="Bulleted list" active={editor.isActive("bulletList")} on={() => c().toggleBulletList().run()}>
        • List
      </Btn>
      <Btn label="Numbered list" active={editor.isActive("orderedList")} on={() => c().toggleOrderedList().run()}>
        1. List
      </Btn>

      <div className="h-5 w-px bg-gray-300 mx-0.5" />

      <Btn label="Align left" active={editor.isActive({ textAlign: "left" })} on={() => c().setTextAlign("left").run()}>
        ⬅
      </Btn>
      <Btn label="Align center" active={editor.isActive({ textAlign: "center" })} on={() => c().setTextAlign("center").run()}>
        ↔
      </Btn>
      <Btn label="Align right" active={editor.isActive({ textAlign: "right" })} on={() => c().setTextAlign("right").run()}>
        ➡
      </Btn>

      <div className="h-5 w-px bg-gray-300 mx-0.5" />

      <label className="flex h-8 items-center gap-1 px-1.5 text-[12px] cursor-pointer hover:bg-gray-200 rounded" title="Text colour">
        <span className="font-bold text-gray-700">A</span>
        <input
          type="color"
          aria-label="Text colour"
          className="h-4 w-5 cursor-pointer border-0 bg-transparent"
          onChange={(e) => c().setColor(e.target.value).run()}
        />
      </label>

      <label className="flex h-8 items-center gap-1 px-1.5 text-[12px] cursor-pointer hover:bg-gray-200 rounded" title="Highlight">
        <span className="bg-yellow-200 px-1 font-bold text-gray-800 rounded-xs">H</span>
        <input
          type="color"
          aria-label="Highlight colour"
          defaultValue="#ffff00"
          className="h-4 w-5 cursor-pointer border-0 bg-transparent"
          onChange={(e) => c().setHighlight({ color: e.target.value }).run()}
        />
      </label>

      <div className="h-5 w-px bg-gray-300 mx-0.5" />

      <Btn label="Link" active={editor.isActive("link")} on={addLink}>
        🔗
      </Btn>
      <Btn label="Insert image" on={addImage}>
        🖼
      </Btn>

      <div className="h-5 w-px bg-gray-300 mx-0.5" />

      {/* Table Actions */}
      {!isInTable ? (
        <div className="flex items-center gap-1">
          <Btn
            label="Insert 2-column Table"
            on={() => c().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()}
            className="border border-teal-200 bg-teal-50/70 text-teal-800 hover:bg-teal-100"
          >
            📊 + Table
          </Btn>
          <Btn
            label="Insert Cost Table Template"
            on={insertCostTablePreset}
            className="border border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100"
          >
            📋 Cost Table Preset
          </Btn>
        </div>
      ) : (
        <div className="flex items-center gap-1 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200">
          <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wide mr-1 select-none">Table:</span>
          <Btn label="Add Row Below" on={() => c().addRowAfter().run()} className="bg-white border text-[11.5px] h-7 px-1.5">
            + Row
          </Btn>
          <Btn label="Delete Row" on={() => c().deleteRow().run()} className="bg-white border text-[11.5px] h-7 px-1.5 text-red-600">
            - Row
          </Btn>
          <Btn label="Add Column After" on={() => c().addColumnAfter().run()} className="bg-white border text-[11.5px] h-7 px-1.5">
            + Col
          </Btn>
          <Btn label="Delete Column" on={() => c().deleteColumn().run()} className="bg-white border text-[11.5px] h-7 px-1.5 text-red-600">
            - Col
          </Btn>
          <Btn label="Delete Entire Table" on={() => c().deleteTable().run()} className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-[11.5px] h-7 px-1.5">
            Delete Table
          </Btn>
        </div>
      )}

      <div className="ml-auto">
        <Btn label="Clear formatting" on={() => c().unsetAllMarks().clearNodes().run()} className="text-gray-400 hover:text-gray-700">
          Clear
        </Btn>
      </div>
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  minHeight = 180,
  placeholder = "Write content here...",
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number | string;
  placeholder?: string;
}) {
  const heightVal = typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false } }),
      Image,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose-editor px-4 py-3 outline-none",
        style: `min-height:${heightVal}`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  if (!editor) return <div className="h-[220px] rounded-lg border bg-white" />;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-brand shadow-2xs">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
