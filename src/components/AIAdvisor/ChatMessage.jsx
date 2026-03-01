/**
 * Chat Message Component
 * Displays individual chat messages in the AI advisor
 */

import React from 'react';
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
                {message.content.split('\n').map((line, i) => (
                    <p key={i} className={i !== 0 ? 'mt-2' : ''}>
                        {line}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default ChatMessage;
