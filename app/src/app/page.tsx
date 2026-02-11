import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo / Brand */}
          <div className="mb-8">
            <span className="text-5xl">🍽️</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Plan your potluck.
            <br />
            <span className="text-amber-600">No spreadsheet required.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-12 max-w-lg mx-auto leading-relaxed">
            Coordinate who brings what so you don&apos;t end up with five bowls
            of mac and cheese and no salad.
          </p>

          {/* CTA */}
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Create a Dinner
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto mt-24 w-full">
          <h2 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-10">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                1. Create a dinner
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Set the date, location, and what you need people to bring.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                2. Share the link
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Send it to your group chat. Anyone can RSVP and invite others.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                3. Coordinate & enjoy
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Everyone sees the menu in real time. No duplicates, no gaps.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-400">
        <p>DinnerPals v1.0.1 — Good food, better friends.</p>
      </footer>
    </div>
  );
}
