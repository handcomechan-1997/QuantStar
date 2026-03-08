/**
 * Chat Message Component - Enhanced UI
 * Displays individual chat messages with modern styling and Markdown rendering
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Cpu, User } from 'lucide-react';

const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in-up`}>
            {/* Avatar & Name */}
            <div className="flex items-center mb-2 gap-2">
                {!isUser && (
                    <div className="w-6 h-6 rounded-lg bg-purple-900/30 flex items-center justify-center">
                        <Cpu size={12} className="text-purple-400" />
                    </div>
                )}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {isUser ? '交易员' : 'DeepSeek AI'}
                </span>
                {isUser && (
                    <div className="w-6 h-6 rounded-lg bg-blue-900/30 flex items-center justify-center">
                        <User size={12} className="text-blue-400" />
                    </div>
                )}
            </div>

            {/* Message Bubble */}
            <div
                className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-sm shadow-lg shadow-purple-500/20'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-bl-sm backdrop-blur-sm'
                }`}
            >
                {isUser ? (
                    // User message: simple text with better formatting
                    <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                    // AI message: render markdown with enhanced styling
                    <div className="markdown-content">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // Headings
                                h1: ({ children }) => (
                                    <h1 className="text-base font-bold text-white mt-4 mb-2 first:mt-0">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-sm font-bold text-white mt-3 mb-2 first:mt-0">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-xs font-bold text-white mt-2 mb-1 first:mt-0">
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
                                                className="bg-slate-900/50 text-purple-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700/50"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    }
                                    return (
                                        <code
                                            className="block bg-slate-900/50 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 text-slate-300 border border-slate-700/50"
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    );
                                },
                                pre: ({ children }) => (
                                    <pre className="bg-slate-900/50 p-3 rounded-lg overflow-x-auto my-2 border border-slate-700/50">
                                        {children}
                                    </pre>
                                ),

                                // Blockquotes
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-2 border-purple-500/50 pl-3 my-2 italic text-slate-400 bg-purple-500/5 py-2 rounded-r">
                                        {children}
                                    </blockquote>
                                ),

                                // Links
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 underline transition-colors"
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
                                hr: () => <hr className="border-slate-700 my-3" />,

                                // Tables
                                table: ({ children }) => (
                                    <div className="overflow-x-auto my-2">
                                        <table className="min-w-full border-collapse border border-slate-700/50 rounded">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-slate-800/50">{children}</thead>
                                ),
                                tbody: ({ children }) => (
                                    <tbody className="divide-y divide-slate-700/50">
                                        {children}
                                    </tbody>
                                ),
                                tr: ({ children }) => (
                                    <tr className="border-b border-slate-700/50">{children}</tr>
                                ),
                                th: ({ children }) => (
                                    <th className="border border-slate-700/50 px-3 py-1.5 text-left text-xs font-semibold text-white">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="border border-slate-700/50 px-3 py-1.5 text-xs">
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
