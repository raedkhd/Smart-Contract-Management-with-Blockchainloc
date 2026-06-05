import { useMemo } from "react";

const KEYWORDS = /\b(pragma|solidity|contract|function|mapping|address|uint256|uint|int|bool|string|bytes|public|private|internal|external|view|pure|payable|returns|return|memory|storage|calldata|require|emit|event|modifier|constructor|if|else|for|while|new|true|false|import|using|library|interface|struct|enum|is|virtual|override)\b/g;
const TYPES = /\b(msg|tx|block|abi|this|super)\b/g;
const STRING_RE = /(".*?"|'.*?')/g;
const COMMENT_RE = /(\/\/.*$)/gm;
const NUMBER_RE = /\b(\d+)\b/g;

function highlight(src: string) {
  return src
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(COMMENT_RE, '<span class="text-zinc-500">$1</span>')
    .replace(STRING_RE, '<span class="text-emerald-300">$1</span>')
    .replace(KEYWORDS, '<span class="text-blue-400">$&</span>')
    .replace(TYPES, '<span class="text-amber-300">$&</span>')
    .replace(NUMBER_RE, '<span class="text-amber-400">$&</span>');
}

export function SolidityCode({ source }: { source: string }) {
  const html = useMemo(() => highlight(source || "// (empty)"), [source]);
  return (
    <div className="bg-zinc-900 rounded-lg p-6 overflow-hidden ring-1 ring-black/10">
      <pre
        className="font-mono text-[13px] leading-relaxed text-zinc-300 overflow-x-auto whitespace-pre"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
