import type { Metadata, Viewport } from 'next';
import { DM_Sans, Lora } from 'next/font/google';
import { AppProvider } from '@/components/app-provider';
import { Navigation } from '@/components/navigation/navigation';
import './globals.css';

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const serif = Lora({ subsets: ['latin'], variable: '--font-lora' });
export const metadata: Metadata = {
  title: { default: 'Nemorra — Make it stick.', template: '%s · Nemorra' },
  description: 'A little learning companion for big ideas. Learn, teach, and write your way to a better memory. Explore the Nemorra interactive preview.',
};
export const viewport: Viewport = { themeColor: '#f7f5f0', colorScheme: 'light', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`bg-background ${sans.variable} ${serif.variable}`}><body className="font-sans antialiased"><AppProvider><Navigation />{children}</AppProvider></body></html>;
}
