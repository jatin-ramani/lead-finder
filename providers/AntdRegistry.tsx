"use client";

import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import type Entity from "@ant-design/cssinjs/es/Cache";
import { useServerInsertedHTML } from "next/navigation";
import { useMemo, useRef, type ReactNode } from "react";

/**
 * Collects Ant Design's CSS-in-JS output during SSR and flushes it into <head>
 * before the markup that uses it, which prevents the first-paint style flash.
 */
export default function AntdRegistry({ children }: { children: ReactNode }) {
  const cache = useMemo<Entity>(() => createCache(), []);
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;

    return (
      <style
        id="antd-css"
        dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
      />
    );
  });

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}
