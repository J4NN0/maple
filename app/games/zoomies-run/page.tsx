import Link from "next/link";
import ZoomiesGame from "./ZoomiesGame";

export const metadata = { title: "Zoomies Run · Maple & Chill" };

export default function ZoomiesRunPage() {
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
          Zoomies Run 💨
        </span>
      </nav>

      <div className="flex flex-col items-center sm:px-4 py-8 gap-4 max-w-4xl mx-auto w-full">
        <div className="w-full bg-maple-tan p-0 sm:rounded-3xl sm:p-3 sm:shadow-md">
          <ZoomiesGame />
        </div>
        <p className="text-maple-brown/60 text-sm text-center px-4">
          Space / ↑ to jump &nbsp;•&nbsp; tap anywhere on mobile
        </p>
      </div>
    </main>
  );
}
