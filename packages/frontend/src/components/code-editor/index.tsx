import React, { FC, useRef } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Button, Tooltip } from "antd";
import { FormatPainterOutlined } from "@ant-design/icons";

export interface CodeEditorProps {
  /** 代码内容 */
  value?: string;
  /** 内容变化回调 */
  onChange?: (value: string | undefined) => void;
  /** 编程语言，默认 javascript */
  language?: string;
  /** 编辑器高度，默认 300px */
  height?: string | number;
  /** 是否只读 */
  readOnly?: boolean;
  /** 主题：light / vs-dark */
  theme?: "light" | "vs-dark";
  /** 是否显示行号，默认 true */
  lineNumbers?: boolean;
  /** 是否显示小地图，默认 false */
  minimap?: boolean;
  /** 是否显示工具栏，默认 true */
  showToolbar?: boolean;
  /** 自定义工具栏额外内容 */
  toolbarExtra?: React.ReactNode;
  /** 自定义编辑器选项 */
  options?: editor.IStandaloneEditorConstructionOptions;
  /** 编辑器挂载完成回调 */
  onMount?: OnMount;
  /** 自定义类名 */
  className?: string;
}

/**
 * 代码编辑器组件
 * 基于 Monaco Editor 封装
 */
export const CodeEditor: FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "javascript",
  height = 300,
  readOnly = false,
  theme = "light",
  lineNumbers = true,
  minimap = false,
  showToolbar = true,
  toolbarExtra,
  options,
  onMount,
  className,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  /** 格式化代码 */
  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
    }
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // 配置 JavaScript/TypeScript 的类型定义
    if (language === "javascript" || language === "typescript") {
      // 添加探针环境的类型定义
      const tsDefaults = (monaco.languages.typescript as any)
        .javascriptDefaults;
      if (tsDefaults?.addExtraLib) {
        tsDefaults.addExtraLib(
          `
          /**
           * HTTP 请求客户端
           */
          declare const http: {
            /**
             * 发送 GET 请求
             * @param url 请求地址
             * @param config 请求配置
             */
            get(url: string, config?: {
              headers?: Record<string, string>;
              params?: Record<string, any>;
              timeout?: number;
            }): Promise<{
              status: number;
              statusText: string;
              data: any;
              headers: Record<string, string>;
            }>;
            
            /**
             * 发送 POST 请求
             * @param url 请求地址
             * @param data 请求体
             * @param config 请求配置
             */
            post(url: string, data?: any, config?: {
              headers?: Record<string, string>;
              params?: Record<string, any>;
              timeout?: number;
            }): Promise<{
              status: number;
              statusText: string;
              data: any;
              headers: Record<string, string>;
            }>;
            
            /**
             * 发送 PUT 请求
             */
            put(url: string, data?: any, config?: {
              headers?: Record<string, string>;
              params?: Record<string, any>;
              timeout?: number;
            }): Promise<{
              status: number;
              statusText: string;
              data: any;
              headers: Record<string, string>;
            }>;
            
            /**
             * 发送 DELETE 请求
             */
            delete(url: string, config?: {
              headers?: Record<string, string>;
              params?: Record<string, any>;
              timeout?: number;
            }): Promise<{
              status: number;
              statusText: string;
              data: any;
              headers: Record<string, string>;
            }>;
          };
          
          /**
           * 探针环境变量
           * 在"探针环境变量"页面配置的变量会注入到此对象
           */
          declare const env: Record<string, string>;

          /**
           * 当前监控主机信息
           * 当在主机下的端点详情页面执行测试时，会自动注入该主机的配置
           */
          declare const host: {
            /** 主机 ID */
            id: string;
            /** 主机名称 */
            name: string;
            /** 主机基础 URL */
            url: string;
            /** 主机默认请求头 */
            headers: Record<string, string>;
          };

          /**
           * 探针结果
           */
          interface ProbeResult {
            /** 是否成功 */
            success: boolean;
            /** 结果消息 */
            message?: string;
            /** 响应状态码 */
            status?: number;
            /** 响应时间（毫秒） */
            responseTime?: number;
          }
          
          /**
           * 探针返回值
           */
          interface ProbeReturn {
            /** 探针结果 */
            result: ProbeResult;
            /** 更新环境变量（可选，只能更新已存在的 key） */
            env?: Record<string, string>;
          }
          `,
          "probe-types.d.ts",
        );
      }
    }

    onMount?.(editor, monaco);
  };

  const handleChange: OnChange = (newValue) => {
    onChange?.(newValue);
  };

  const mergedOptions: editor.IStandaloneEditorConstructionOptions = {
    readOnly,
    lineNumbers: lineNumbers ? "on" : "off",
    minimap: { enabled: minimap },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    wordWrap: "on",
    automaticLayout: true,
    folding: true,
    renderLineHighlight: "line",
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    padding: { top: 8, bottom: 8 },
    ...options,
  };

  return (
    <div
      className={className}
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      {/* 工具栏 */}
      {showToolbar && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "4px 8px",
            borderBottom: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
          }}
        >
          {toolbarExtra}
          <Tooltip title="格式化代码 (Shift+Alt+F)">
            <Button
              type="text"
              size="small"
              icon={<FormatPainterOutlined />}
              onClick={handleFormat}
              disabled={readOnly}
            >
              格式化
            </Button>
          </Tooltip>
        </div>
      )}

      <Editor
        height={height}
        language={language}
        value={value}
        theme={theme}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={mergedOptions}
        loading={
          <div
            style={{
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            加载编辑器中...
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
