// Points farmers to the Bonchie Agro WhatsApp advisor, which replaces the
// in-app AI advisor. Renders nothing until BRAND.whatsappNumber is set.
import React from 'react';
import { BRAND, whatsappLink } from '../config/brand';
import { ChevronRightIcon } from './icons';

const WhatsAppAdvisorCard: React.FC = () => {
    const link = whatsappLink('Hi Bonchie Agro');
    if (!link) return null;

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
        >
            <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-primary">Ask {BRAND.name} on WhatsApp</h3>
                <p className="text-sm text-text-secondary">Log by voice note, ask questions, or talk to a vet.</p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-text-secondary shrink-0" />
        </a>
    );
};

export default WhatsAppAdvisorCard;
