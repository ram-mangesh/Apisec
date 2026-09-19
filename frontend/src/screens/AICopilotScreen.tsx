import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Terminal,
  Shield,
  FileCode,
  ArrowRight,
  Check,
  Copy,
  Lightbulb,
  CornerDownLeft,
} from 'lucide-react';
import { api } from '../api';
import { CopilotMessage } from '../types';
import { ScreenType } from '../components/GlobalShell';
import { useTheme } from '../theme/ThemeContext';

interface AICopilotScreenProps {
  onNavigate: (screen: ScreenType, id?: string) => void;
}

export const AICopilotScreen: React.FC<AICopilotScreenProps> = ({ onNavigate }) => {
  const { currentConfig } = useTheme();
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `### APISEC AI Security Copilot\n\nI have analyzed **Acme Production Core** (21 endpoints, 7 findings, 3 active attack paths).\n\nHere are some things I can assist you with:\n- **Deep-dive on vulnerabilities**: Ask about BOLA (\`F-1021\`), BFLA (\`F-1022\`), or Mass Assignment (\`F-1023\`)\n- **Attack Path Remediation**: Ask how to patch choke points in \`AP-001\` or \`AP-002\`\n- **Generate Code Patches**: Get framework-specific fixes for FastAPI, Express, or Spring Boot\n\nSelect a prompt below or type your question:`,
      timestamp: new Date().toISOString(),
      context_tags: ['Acme Production', 'Attack Mesh', 'Ready'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Explain BOLA on User Service (F-1021)',
    'How do I neutralize Attack Path AP-002?',
    'Provide Python patch for Mass Assignment (F-1023)',
    'Show priority remediation plan for Acme Production',
    'Explain Rate Limit bypass on MFA OTP (F-1024)',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const response = await api.queryCopilot(text.trim());
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${idx}`} className="my-2 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
              <pre className="m-0 leading-relaxed">{codeBuffer.join('\n')}</pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-sm font-bold text-slate-900 mt-2 mb-1 font-mono">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} className="text-xs font-bold text-slate-800 mt-2 mb-0.5 font-mono">
            {line.replace('#### ', '')}
          </h4>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={idx} className="text-xs text-slate-700 ml-4 list-disc leading-relaxed font-sans">
            {renderInlineMarkdown(line.replace('- ', ''))}
          </li>
        );
      } else if (line.match(/^[0-9]+\.\s/)) {
        elements.push(
          <div key={idx} className="text-xs text-slate-700 ml-2 font-medium leading-relaxed font-sans">
            {renderInlineMarkdown(line)}
          </div>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-1.5" />);
      } else {
        elements.push(
          <p key={idx} className="text-xs text-slate-700 leading-relaxed font-sans">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    });

    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <div key="code-end" className="my-2 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto">
          <pre className="m-0 leading-relaxed">{codeBuffer.join('\n')}</pre>
        </div>
      );
    }

    return elements;
  };

  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(`.*?`|\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-mono text-[11px] border border-purple-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto cyber-card rounded-2xl overflow-hidden shadow-lg animate-in fade-in duration-200 bg-white">
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${currentConfig.primary}, #7C3AED)`,
              boxShadow: `0 4px 12px ${currentConfig.glow}`,
            }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
                APISEC Deterministic AI Copilot
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold" style={{ backgroundColor: currentConfig.badgeBg, color: currentConfig.badgeText, border: `1px solid ${currentConfig.badgeBorder}` }}>
                Context-Aware
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Connected to Acme Production Core Graph & Proof Knowledge Base
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-emerald-600 flex items-center gap-1.5 font-bold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Mesh Sync Active
        </span>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{
                  background: `linear-gradient(135deg, ${currentConfig.primary}, ${currentConfig.primaryHover})`,
                }}
              >
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white shadow-md font-sans'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="space-y-1">{renderMarkdown(msg.content)}</div>
              )}

              {msg.context_tags && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100">
                  {msg.context_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs font-mono text-purple-700 font-semibold">
            <Bot className="h-4 w-4 animate-spin" />
            <span>Analyzing causal graph & synthesizing response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 ml-1" />
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 hover:text-slate-900 whitespace-nowrap transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask Copilot about any finding, attack path, or remediation fix..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-hidden"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="h-10 px-5 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md disabled:opacity-40 cursor-pointer font-mono"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
