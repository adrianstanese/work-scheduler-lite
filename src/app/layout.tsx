import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkSchedulerLite — Programarea personalului simplificată",
  description: "Software gratuit de programare a turelor pentru companii mici. Până la 25 angajați, 25 tipuri de ture, concedii conform Codului Muncii, dashboard de conformitate.",
  keywords: "programare ture, pontaj, program lucru, scheduling, shift planner, Romania, Codul Muncii",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
