import {
  useRef,
  ClipboardEventHandler,
  useState,
  forwardRef,
  useImperativeHandle,
  DragEventHandler,
} from "react";
import MDEditor, { MDEditorProps, RefMDEditor } from "@uiw/react-md-editor";
import { Flex, Spin } from "antd";
import { useUploadFile } from "@/services/attachment";
import { messageError } from "@/utils/message";
import { FILE_PREFIX } from "./constants";
import { MarkdownPreview } from "./preview";
import styles from "./styles.module.css";
import {
  getCommands,
  getExtraCommands,
} from "@uiw/react-md-editor/commands-cn";

interface Props extends MDEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export interface EditorRef {
  editorRef: React.RefObject<RefMDEditor>;
  insertFile: (fileArray: File[]) => Promise<void>;
}

export const Editor = forwardRef<EditorRef, Props>(
  ({ value = "", onChange, ...props }, ref) => {
    const editorRef = useRef<RefMDEditor>(null);
    const { mutateAsync: uploadFile } = useUploadFile();
    const [loading, setLoading] = useState(false);

    const insertFile = async (fileArray: File[]) => {
      try {
        const fileMdStrings: string[] = [];

        for (const file of fileArray) {
          setLoading(true);
          const response = await uploadFile(file);

          if (!response || !response.success) {
            messageError("图片上传失败");
            continue;
          }

          let fileMdString = `[${file.name}](${FILE_PREFIX}${response.data.id})`;
          if (file.type.match(/^image\/(gif|jpe?g|a?png|bmp)/i)) {
            fileMdString = "!" + fileMdString;
          }

          fileMdStrings.push(fileMdString);
        }

        const editor = editorRef.current;
        const textarea = editor?.textarea;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const newValue =
          value.substring(0, start) +
          "\n" +
          fileMdStrings.join("\n\n") +
          value.substring(end);
        onChange?.(newValue);
      } finally {
        setLoading(false);
      }
    };

    const onPaste: ClipboardEventHandler<HTMLDivElement> = async (e) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }

      if (imageFiles.length <= 0) return;

      e.preventDefault();
      e.stopPropagation();
      insertFile(imageFiles);
    };

    const onDrop: DragEventHandler<HTMLDivElement> = async (e) => {
      const dataTransfer = e.dataTransfer;
      if (!dataTransfer) return;

      const files = dataTransfer.files;
      const imageFiles: File[] = Array.from(files);

      if (imageFiles.length <= 0) return;

      e.preventDefault();
      e.stopPropagation();
      insertFile(imageFiles);
    };

    useImperativeHandle(ref, () => ({
      editorRef,
      insertFile,
    }));

    return (
      <div className={`relative ${styles.editorContainer}`}>
        <MDEditor
          ref={editorRef}
          height="100%"
          value={value}
          onPaste={onPaste}
          onDrop={onDrop}
          onChange={(val) => onChange?.(val || "")}
          commands={[...getCommands()]}
          extraCommands={[...getExtraCommands()]}
          components={{
            preview: (source) => <MarkdownPreview source={source} />,
          }}
          {...props}
        />
        {loading && (
          <Flex
            align="center"
            justify="center"
            className="absolute top-0 left-0 w-full h-full bg-gray-300/30"
          >
            <Spin />
          </Flex>
        )}
      </div>
    );
  },
);
