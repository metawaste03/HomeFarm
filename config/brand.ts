// Brand settings shown to farmers.
// "HomeFarm" is reserved for the future marketplace and must not appear in
// farmer-facing text before it launches. Use these constants instead of
// hardcoding the name.

export const BRAND = {
    name: 'Bonchie Agro',
    tagline: 'Your farm records and advice, simplified.',
    website: 'https://bonchieagro.com',
    supportEmail: 'hello@bonchieagro.com',
    // WhatsApp number for the Bonchie Agro advisor, international format without "+"
    // (e.g. '2348012345678'). Leave empty until the Meta number is approved;
    // the WhatsApp card stays hidden while this is empty.
    whatsappNumber: '',
} as const;

export const whatsappLink = (text?: string): string | null => {
    if (!BRAND.whatsappNumber) return null;
    const query = text ? `?text=${encodeURIComponent(text)}` : '';
    return `https://wa.me/${BRAND.whatsappNumber}${query}`;
};
