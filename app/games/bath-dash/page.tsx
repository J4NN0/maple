import Link from "next/link";
import BathDashGame from "./BathDashGame";

export const metadata = { title: "Bath Dash · Maple & Chill" };

export default function BathDashPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <nav className="flex items-center px-6 py-4 border-b border-maple-tan">
        <Link
          href="/"
          className="text-maple-brown font-bold hover:text-maple-dark transition-colors flex items-center gap-1"
        >
          ← Back
        </Link>
        <span className="font-display text-2xl text-maple-brown mx-auto pr-10">
          Bath Dash 🛁
        </span>
      </nav>

      <div className="flex flex-col items-center sm:px-4 py-8 max-w-4xl mx-auto w-full">
        <div className="w-full bg-maple-tan p-0 sm:rounded-3xl sm:p-3 sm:shadow-md">
          <BathDashGame />
        </div>
      </div>
    </main>
  );
}
