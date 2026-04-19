export const metadata = {
  title: 'SponsorScout AI',
  description: 'Visa-aware career navigation for international students',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
