import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";

import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from "@tiptap/extension-table";

import "./RichTextEditor.css";

function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write your content here...",
  minHeight = 220,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Image.configure({
        inline: false,
        allowBase64: false,
      }),

      Table.configure({
        resizable: true,
      }),

      TableRow,
      TableHeader,
      TableCell,
    ],

    content: value || "",

    editorProps: {
      attributes: {
        class: "rich-editor-content",
        "data-placeholder": placeholder,
      },
    },

    onUpdate({ editor }) {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  /*
   * Update editor content when the parent value changes.
   * This is especially useful when editing an existing trek.
   */
  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();

    if (value !== currentHTML) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="rich-editor-loading">
        Loading editor...
      </div>
    );
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;

    const url = window.prompt(
      "Enter URL (internal / external):",
      previousUrl || "https://"
    );

    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
        target: url.startsWith("/") ? null : "_blank",
        rel: url.startsWith("/")
          ? null
          : "noopener noreferrer",
      })
      .run();
  };

  const addImage = () => {
    const url = window.prompt(
      "Enter image URL:"
    );

    if (!url) return;

    const alt = window.prompt(
      "Enter image alt text:",
      "Trekking in Nepal"
    );

    editor
      .chain()
      .focus()
      .setImage({
        src: url,
        alt: alt || "",
      })
      .run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({
        rows: 3,
        cols: 3,
        withHeaderRow: true,
      })
      .run();
  };

  return (
    <div
      className="rich-editor"
      style={{
        "--editor-min-height": `${minHeight}px`,
      }}
    >
      {/* =================================================
          TEXT FORMATTING
          ================================================= */}

      <div className="rich-editor-toolbar">

        <div className="toolbar-group">
          <button
            type="button"
            className={
              editor.isActive("bold")
                ? "active"
                : ""
            }
            onClick={() =>
              editor.chain().focus().toggleBold().run()
            }
            title="Bold"
          >
            B
          </button>

          <button
            type="button"
            className={
              editor.isActive("italic")
                ? "active"
                : ""
            }
            onClick={() =>
              editor.chain().focus().toggleItalic().run()
            }
            title="Italic"
          >
            I
          </button>

          <button
            type="button"
            className={
              editor.isActive("underline")
                ? "active"
                : ""
            }
            onClick={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            title="Underline"
          >
            U
          </button>

          <button
            type="button"
            className={
              editor.isActive("strike")
                ? "active"
                : ""
            }
            onClick={() =>
              editor.chain().focus().toggleStrike().run()
            }
            title="Strikethrough"
          >
            S
          </button>
        </div>

        {/* =================================================
            HEADINGS
            ================================================= */}

        <div className="toolbar-group">

          <button
            type="button"
            className={
              editor.isActive("heading", { level: 1 })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 1 })
                .run()
            }
          >
            H1
          </button>

          <button
            type="button"
            className={
              editor.isActive("heading", { level: 2 })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 2 })
                .run()
            }
          >
            H2
          </button>

          <button
            type="button"
            className={
              editor.isActive("heading", { level: 3 })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 3 })
                .run()
            }
          >
            H3
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().setParagraph().run()
            }
          >
            P
          </button>
        </div>

        {/* =================================================
            ALIGNMENT
            ================================================= */}

        <div className="toolbar-group">

          <button
            type="button"
            className={
              editor.isActive({
                textAlign: "left",
              })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .setTextAlign("left")
                .run()
            }
            title="Align Left"
          >
            ⬅
          </button>

          <button
            type="button"
            className={
              editor.isActive({
                textAlign: "center",
              })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .setTextAlign("center")
                .run()
            }
            title="Align Center"
          >
            ↔
          </button>

          <button
            type="button"
            className={
              editor.isActive({
                textAlign: "right",
              })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .setTextAlign("right")
                .run()
            }
            title="Align Right"
          >
            ➡
          </button>

          <button
            type="button"
            className={
              editor.isActive({
                textAlign: "justify",
              })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .setTextAlign("justify")
                .run()
            }
            title="Justify"
          >
            ☰
          </button>

        </div>

        {/* =================================================
            LISTS
            ================================================= */}

        <div className="toolbar-group">

          <button
            type="button"
            className={
              editor.isActive("bulletList")
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }
            title="Bullet List"
          >
            • List
          </button>

          <button
            type="button"
            className={
              editor.isActive("orderedList")
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
            title="Numbered List"
          >
            1. List
          </button>

          <button
            type="button"
            className={
              editor.isActive("blockquote")
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBlockquote()
                .run()
            }
            title="Quote"
          >
            “ ”
          </button>

          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .setHorizontalRule()
                .run()
            }
            title="Divider"
          >
            ―
          </button>

        </div>

        {/* =================================================
            LINKS / MEDIA
            ================================================= */}

        <div className="toolbar-group">

          <button
            type="button"
            className={
              editor.isActive("link")
                ? "active"
                : ""
            }
            onClick={addLink}
            title="Internal / External Link"
          >
            🔗 Link
          </button>

          <button
            type="button"
            onClick={addImage}
            title="Insert Image"
          >
            🖼 Image
          </button>

          <button
            type="button"
            onClick={insertTable}
            title="Insert Table"
          >
            ▦ Table
          </button>

        </div>

        {/* =================================================
            TABLE CONTROLS
            ================================================= */}

        {editor.isActive("table") && (
          <div className="toolbar-group table-tools">

            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .addColumnBefore()
                  .run()
              }
            >
              + Col
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .addColumnAfter()
                  .run()
              }
            >
              Col +
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .deleteColumn()
                  .run()
              }
            >
              − Col
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .addRowBefore()
                  .run()
              }
            >
              + Row
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .addRowAfter()
                  .run()
              }
            >
              Row +
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .deleteRow()
                  .run()
              }
            >
              − Row
            </button>

            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .deleteTable()
                  .run()
              }
            >
              Delete Table
            </button>

          </div>
        )}

        {/* =================================================
            HISTORY
            ================================================= */}

        <div className="toolbar-group">

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().undo().run()
            }
            disabled={!editor.can().undo()}
            title="Undo"
          >
            ↶
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().redo().run()
            }
            disabled={!editor.can().redo()}
            title="Redo"
          >
            ↷
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
            title="Clear Formatting"
          >
            Clear
          </button>

        </div>

      </div>

      {/* =================================================
          EDITOR
          ================================================= */}

      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;