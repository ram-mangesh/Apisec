import React, { useState } from 'react';
import { Copy, Check, FileCode, Terminal } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: 'json' | 'python' | 'http' | 'diff' | 'bash' | 'text';
  filename?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'json',
  filename,
  showLineNumbers = true,
  maxHeight = '400px',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const lines = code.trim().split('\n');

  const renderLine = (line: string) => {
    if (language === 'diff') {
      if (line.startsWith('+')) {
        return <span className="text-emerald-800 bg-emerald-100/80 px-1 rounded block font-semibold">{line}</span>;
      }
      if (line.startsWith('-')) {
        return <span className="text-rose-800 bg-rose-100/80 px-1 rounded block font-semibold">{line}</span>;
      }
      if (line.startsWith('@@')) {
        return <span className="text-purple-700 font-bold">{line}</span>;
      }
      return <span className="text-slate-800">{line}</span>;
    }

    if (language === 'http') {
      if (line.match(/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s/)) {
        const parts = line.split(' ');
        return (
          <span>
            <span className="text-purple-700 font-bold">{parts[0]} </span>
            <span className="text-emerald-700 font-bold">{parts[1]} </span>
            <span className="text-slate-500">{parts.slice(2).join(' ')}</span>
          </span>
        );
      }
      if (line.match(/^HTTP\/[0-9.]+\s[0-9]+/)) {
        return <span className="text-purple-700 font-bold">{line}</span>;
      }
      if (line.includes(': ')) {
        const colonIdx = line.indexOf(': ');
        const key = line.slice(0, colonIdx);
        const val = line.slice(colonIdx + 2);
        return (
          <span>
            <span className="text-slate-600 font-bold">{key}: </span>
            <span className="text-slate-900">{val}</span>
          </span>
        );
      }
      return <span className="text-slate-800">{line}</span>;
    }

    if (language === 'json') {
      const keyValMatch = line.match(/^(\s*)(".*?")(\s*:\s*)(.*)$/);
      if (keyValMatch) {
        const [, indent, key, colon, value] = keyValMatch;
        let valColor = 'text-slate-900';
        if (value.startsWith('"')) valColor = 'text-emerald-700 font-medium';
        else if (value.match(/^[0-9.]+/)) valColor = 'text-amber-700 font-bold';
        else if (value.startsWith('true') || value.startsWith('false')) valColor = 'text-purple-700 font-bold';
        else if (value.startsWith('null')) valColor = 'text-rose-600 font-bold';

        return (
          <span>
            {indent}
            <span className="text-indigo-700 font-bold">{key}</span>
            <span className="text-slate-400">{colon}</span>
            <span className={valColor}>{value}</span>
          </span>
        );
      }
      return <span className="text-slate-800">{line}</span>;
    }

    if (language === 'python') {
      if (line.trim().startsWith('#')) {
        return <span className="text-slate-400 italic">{line}</span>;
      }
      if (line.includes('def ') || line.includes('import ') || line.includes('from ') || line.includes('return ')) {
        return <span className="text-purple-700 font-bold">{line}</span>;
      }
      return <span className="text-slate-800">{line}</span>;
    }

    if (language === 'bash') {
      if (line.startsWith('#')) {
        return <span className="text-slate-400 italic">{line}</span>;
      }
      if (line.startsWith('curl ') || line.startsWith('python3 ') || line.startsWith('nmap ')) {
        return <span className="text-emerald-700 font-bold">{line}</span>;
      }
      return <span className="text-slate-800">{line}</span>;
    }

    return <span className="text-slate-800">{line}</span>;
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs font-mono text-[12px] group">
      {/* Code Header Bar with Mac Window Controls */}
      <div className="h-[36px] bg-slate-50 border-b border-slate-200 px-3.5 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400 inline-block shadow-xs" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block shadow-xs" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block shadow-xs" />
          </div>
          {filename && (
            <span className="text-[11px] text-slate-700 font-bold font-mono flex items-center gap-1 ml-2">
              <FileCode className="h-3.5 w-3.5 text-purple-600" />
              {filename}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-xs cursor-pointer"
            title="Copy snippet"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body in Clean White Theme */}
      <div
        className="p-3.5 bg-slate-50/50 overflow-x-auto overflow-y-auto leading-relaxed scrollbar-thin text-slate-900"
        style={{ maxHeight }}
      >
        <pre className="m-0">
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="table-row hover:bg-slate-100/80 transition-colors">
                {showLineNumbers && (
                  <span className="table-cell pr-3.5 text-right text-slate-400 select-none font-mono text-[11px] w-8">
                    {idx + 1}
                  </span>
                )}
                <span className="table-cell whitespace-pre">{renderLine(line)}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
