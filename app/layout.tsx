import type { Metadata, Viewport } from 'next';
import { DM_Sans, Lora } from 'next/font/google';
import { AppProvider } from '@/components/app-provider';
import { Navigation } from '@/components/navigation/navigation';
import './globals.css';

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const serif = Lora({ subsets: ['latin'], variable: '--font-lora' });
export const metadata: Metadata = {
  title: { default: 'Nemorra — Make it stick.', template: '%s · Nemorra' },
  description: 'Learn from your notes, teach in your own words, and practice written recall with Gemini feedback. Your learning sessions are saved on this device.',
  applicationName: 'Nemorra',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Nemorra' },
};
export const viewport: Viewport = { themeColor: '#f7f5f0', colorScheme: 'light', width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`bg-background ${sans.variable} ${serif.variable}`}><body className="font-sans antialiased"><AppProvider><div className="mobile-app-shell"><Navigation />{children}</div></AppProvider></body></html>;
}
