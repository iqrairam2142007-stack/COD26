import React, { useState } from "react";

/**
 * A code sample students can read and copy. Deliberately not syntax
 * highlighted - a highlighter is a large dependency, and the comments in
 * these examples carry most of the meaning. Line numbers make it easy to
 * point at a line in the chat.
 */
export default function CodeBlock({ code, language = "python" }) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="codeblock">
      <div className="codeblock-bar">
        <span className="codeblock-lang">{language}</span>
        <button className="codeblock-copy" onClick={copy}
          aria-label={copied ? "Copied" : "Copy code to clipboard"}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="codeblock-pre"><code>
        {lines.map((line, i) => (
          <span className="codeline" key={i}>
            <span className="codeline-num" aria-hidden="true">{i + 1}</span>
            <span className="codeline-text">{line || " "}</span>
          </span>
        ))}
      </code></pre>
    </div>
  );
}
