"use client"
// InitializedMDXEditor.tsx
import type { ForwardedRef } from "react"
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  toolbarPlugin,
  UndoRedo,
  Separator,
  BoldItalicUnderlineToggles,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  imagePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  BlockTypeSelect,
} from "@mdxeditor/editor"

import "@mdxeditor/editor/style.css"
import "./dark-editor.css"
import { useTheme } from "next-themes"
import { basicDark } from "cm6-theme-basic-dark" // for the code to appear dark in dark mode

interface EditorProps {
  value: string
  fieldChange: (data: any) => void
  editorRef: ForwardedRef<MDXEditorMethods> | null
}

// Only import this to the next file
export default function Editor({
  editorRef,
  value,
  fieldChange,
  ...props
}: EditorProps) {
  const { resolvedTheme } = useTheme()

  const theme = resolvedTheme === "dark" ? [basicDark] : []
  return (
    <MDXEditor
      className="background-light800_dark200 light-border-2 markdown-editor dark-editor w-full border rounded-2"
      markdown={value}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        imagePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            css: "css",
            txt: "txt",
            sql: "sql",
            html: "html",
            saas: "saas",
            scss: "scss",
            bash: "bash",
            json: "json",
            js: "javascript",
            ts: "typescript",
            "": "unspecified",
            tsx: "TypeScript (React)",
            jsx: "JavaScript (React)",
          },
          autoLoadLanguageSupport: true,
          codeMirrorExtensions: theme, // used here codemirror dark theme; import { basicDark } from "cm6-theme-basic-dark";
        }),
        diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
        toolbarPlugin({
          toolbarContents: () => (
            <ConditionalContents
              options={[
                {
                  when: (editor) => editor?.editorType === "codeblock",
                  contents: () => <ChangeCodeMirrorLanguage />,
                },
                {
                  fallback: () => (
                    <>
                      <UndoRedo />
                      <Separator />

                      <BoldItalicUnderlineToggles />
                      <Separator />

                      <ListsToggle />
                      <Separator />

                      <BlockTypeSelect />

                      <CreateLink />
                      <InsertImage />
                      <Separator />

                      <InsertTable />
                      <InsertThematicBreak />

                      <InsertCodeBlock />
                    </>
                  ),
                },
              ]}
            />
          ),
        }),
      ]}
      {...props}
      ref={editorRef}
    />
  )
}
