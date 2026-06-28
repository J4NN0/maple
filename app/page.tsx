import Link from "next/link";

const games = [
  {
    slug: "zoomies-run",
    emoji: "💨",
    title: "Zoomies Run",
    description:
      "Maple got the zoomies! Dodge furniture, puddles, and vacuum cleaners. How far can she run?",
    difficulty: "Medium",
  },
  {
    slug: "treat-catcher",
    emoji: "🦴",
    title: "Treat Catcher",
    description:
      "Catch falling treats — but dodge the broccoli and bath bubbles. Combos multiply your score!",
    difficulty: "Easy",
  },
  {
    slug: "poodle-hop",
    emoji: "🌤️",
    title: "Poodle Hop",
    description:
      "Bounce Maple higher and higher on platforms. Collect treats and dodge flying cats.",
    difficulty: "Hard",
  },
  {
    slug: "find-the-ball",
    emoji: "🎾",
    title: "Find the Ball",
    description:
      "Watch the ball get hidden, then find it under shuffling cups. It gets fast — fast.",
    difficulty: "Hard",
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard: "bg-red-100 text-red-800",
};

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-maple-tan">
        <span className="font-display text-2xl text-maple-brown">Maple</span>
        <a
          href="https://www.instagram.com/mapleandchill/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-maple-brown text-maple-cream px-4 py-2 rounded-full text-sm font-semibold hover:bg-maple-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          Follow Maple
        </a>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12 gap-6">
        <div className="text-8xl select-none">🐾</div>
        <h1 className="font-display text-6xl md:text-8xl text-maple-brown leading-tight">
          Play with Maple
        </h1>
        <p className="text-maple-brown/70 text-lg md:text-xl max-w-md font-semibold">
          Maple is a toy poodle with zoomies to spare. Pick a game, chase some
          treats, and see if you can top the leaderboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <a
            href="#games"
            className="bg-maple-brown text-maple-cream px-8 py-3 rounded-full font-bold text-lg hover:bg-maple-dark transition-colors"
          >
            Start playing 🎮
          </a>
          <a
            href="https://www.instagram.com/mapleandchill/"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-maple-brown text-maple-brown px-8 py-3 rounded-full font-bold text-lg hover:bg-maple-tan transition-colors"
          >
            Follow on IG 📸
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-3 px-6 max-w-5xl mx-auto w-full">
        <div className="flex-1 h-px bg-maple-tan" />
        <span className="text-maple-caramel text-xl select-none">✦</span>
        <div className="flex-1 h-px bg-maple-tan" />
      </div>

      {/* Games grid */}
      <section id="games" className="px-6 py-12 max-w-5xl mx-auto w-full">
        <h2 className="font-display text-4xl md:text-5xl text-maple-brown text-center mb-10">
          Choose your game
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {games.map((game) => (
            <div
              key={game.slug}
              className="bg-maple-tan rounded-3xl p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="text-5xl select-none">{game.emoji}</div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-xl text-maple-dark">{game.title}</h3>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor[game.difficulty]}`}
                >
                  {game.difficulty}
                </span>
              </div>
              <p className="text-maple-brown/80 text-sm leading-relaxed">
                {game.description}
              </p>
              <div className="mt-auto">
                <span className="inline-block bg-maple-brown/30 text-maple-brown text-sm font-bold px-5 py-2 rounded-full cursor-not-allowed">
                  Coming soon…
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-maple-tan px-6 py-8 flex flex-col items-center gap-2 text-maple-brown/60 text-sm">
        <span className="font-display text-2xl text-maple-caramel">Maple & Chill
        </span>
        <p>Quietly stealing hearts</p>
        <a
          href="https://www.instagram.com/mapleandchill/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-maple-brown transition-colors"
        >
          @mapleandchill
        </a>
      </footer>
    </main>
  );
}
