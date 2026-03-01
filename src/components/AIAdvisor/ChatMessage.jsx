/**
 * Chat Message Component
 * Displays individual chat messages in the AI advisor with Markdown rendering
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Cpu } from 'lucide-react';

const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center mb-1.5">
                {!isUser && (
                    <div className="w-5 h-5 rounded bg-purple-900/50 flex items-center justify-center mr-2">
                        <Cpu size={12} className="text-purple-400" />
                    </div>
                )}
                <span className="text-[11px] font-medium text-slate-500">
                    {isUser ? '交易员' : 'DeepSeek 策略大脑'}
                </span>
            </div>
            <div
                className={`p-3.5 rounded-2xl text-[13px] leading-relaxed max-w-[90%] ${
                    isUser
                        ? 'bg-purple-600 text-white rounded-tr-sm'
                        : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-sm'
                }`}
            >
                {isUser ? (
                    // User message: simple text
                    <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                    // AI message: render markdown
                    <div className="markdown-content">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // Headings
                                h1: ({ children }) => (
                                    <h1 className="text-lg font-bold text-white mt-4 mb-2 first:mt-0">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-base font-bold text-white mt-3 mb-2 first:mt-0">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-sm font-bold text-white mt-2 mb-1 first:mt-0">
                                        {children}
                                    </h3>
                                ),

                                // Paragraphs
                                p: ({ children }) => (
                                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                                ),

                                // Lists
                                ul: ({ children }) => (
                                    <ul className="list-disc list-inside mb-2 space-y-1 ml-2">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => (
                                    <li className="text-slate-300 leading-relaxed">{children}</li>
                                ),

                                // Code blocks
                                code: ({ node, inline, className, children, ...props }) => {
                                    if (inline) {
                                        return (
                                            <code
                                                className="bg-slate-900 text-purple-300 px-1.5 py-0.5 rounded text-xs font-mono"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    }
                                    return (
                                        <code
                                            className="block bg-slate-900 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 text-slate-300"
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    );
                                },
                                pre: ({ children }) => (
                                    <pre className="bg-slate-900 p-3 rounded-lg overflow-x-auto my-2">
                                        {children}
                                    </pre>
                                ),

                                // Blockquotes
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-purple-500 pl-3 my-2 italic text-slate-400">
                                        {children}
                                    </blockquote>
                                ),

                                // Links
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 underline"
                                    >
                                        {children}
                                    </a>
                                ),

                                // Strong and emphasis
                                strong: ({ children }) => (
                                    <strong className="font-bold text-white">{children}</strong>
                                ),
                                em: ({ children }) => (
                                    <em className="italic text-slate-200">{children}</em>
                                ),

                                // Horizontal rule
                                hr: () => <hr className="border-slate-600 my-3" />,

                                // Tables
                                table: ({ children }) => (
                                    <div className="overflow-x-auto my-2">
                                        <table className="min-w-full border-collapse border border-slate-600">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-slate-700">{children}</thead>
                                ),
                                tbody: ({ children }) => (
                                    <tbody className="divide-y divide-slate-600">
                                        {children}
                                    </tbody>
                                ),
                                tr: ({ children }) => (
                                    <tr className="border-b border-slate-600">{children}</tr>
                                ),
                                th: ({ children }) => (
                                    <th className="border border-slate-600 px-3 py-1.5 text-left text-xs font-semibold text-white">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="border border-slate-600 px-3 py-1.5 text-xs">
                                        {children}
                                    </td>
                                ),
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
