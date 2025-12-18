import { useState } from "react";
import { Editor } from "@/components/markdown-editor";

export default function MarkdownEditorDemo() {
  const [markdown, setMarkdown] = useState<string>(
    "# Hello Markdown\n\n**Bold** and *italic* text",
  );

  return (
    <div style={{ padding: 24 }}>
      <h2>Markdown 编辑器演示</h2>

      <div style={{ marginTop: 24 }}>
        <h3>编辑器</h3>
        <Editor
          value={markdown}
          onChange={(val) => setMarkdown(val || "")}
          height={400}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>当前内容</h3>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: 12,
            borderRadius: 4,
            overflow: "auto",
          }}
        >
          {markdown}
        </pre>
      </div>
    </div>
  );
}
