import './globals.css';

export const metadata = {
  title: 'TaskPulse - Personal Daily & Planning Workspace',
  description: 'Industry-grade personal daily planning app merging Microsoft To-Do, Google Keep, Apple Reminders, and Codeshare redirect link protocol.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#020617',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
