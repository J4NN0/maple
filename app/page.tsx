import Link from "next/link";
import { FaGamepad, FaInstagram } from "react-icons/fa";

const games = [
  {
    slug: "bath-dash",
    emoji: "🛁",
    title: "Bath Dash",
    description:
      "It's bath time, but Maple's not having it! Leap the gates and keep running — every bump slows her down and brings the tub closer.",
    difficulty: "Medium",
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
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12 gap-6">
        <div className="text-8xl select-none">🐾</div>
        <h1 className="font-display text-6xl md:text-8xl text-maple-brown leading-tight">
          Maple and Games
        </h1>
        <p className="text-maple-brown/70 text-lg md:text-xl max-w-md font-semibold">
          Maple is a toy poodle with zoomies to spare. Pick a game, chase some
          treats, and see if you can top the leaderboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <a
            href="#games"
            className="inline-flex items-center justify-center gap-2 bg-maple-brown text-maple-cream px-8 py-3 rounded-full font-bold text-lg hover:bg-maple-dark transition-colors"
          >
            <FaGamepad className="w-5 h-5" />
            Start playing
          </a>
          <a
            href="https://www.instagram.com/mapleandchill/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border-2 border-maple-brown text-maple-brown px-8 py-3 rounded-full font-bold text-lg hover:bg-maple-tan transition-colors"
          >
            <FaInstagram className="w-5 h-5" />
            Follow Maple
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
          Play with Maple
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {games.map((game) => {
            const isLive = game.slug === "bath-dash";
            const card = (
              <div
                key={game.slug}
                className={`bg-maple-tan rounded-3xl p-6 flex flex-col gap-4 transition-all ${isLive ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer" : ""}`}
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
                  {isLive ? (
                    <span className="inline-block bg-maple-brown text-maple-cream text-sm font-bold px-5 py-2 rounded-full">
                      Play now →
                    </span>
                  ) : (
                    <span className="inline-block bg-maple-brown/30 text-maple-brown text-sm font-bold px-5 py-2 rounded-full cursor-not-allowed">
                      Coming soon…
                    </span>
                  )}
                </div>
              </div>
            );
            return isLive ? (
              <Link key={game.slug} href={`/games/${game.slug}`}>{card}</Link>
            ) : (
              <div key={game.slug}>{card}</div>
            );
          })}
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
