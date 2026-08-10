import './globals.css';

export const metadata = {
  title: 'TaskPulse - Personal Daily & Planning Workspace',
  description: 'Industry-grade personal daily planning app merging Microsoft To-Do, Google Keep, Apple Reminders, and Codeshare redirect link protocol.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
