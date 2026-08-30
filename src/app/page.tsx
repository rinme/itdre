export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-brand-orange text-sm font-semibold tracking-wide">
          คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-brand-dark tracking-tight">
          ITD KMUTNB Modern Portal
        </h1>
        <p className="text-lg text-brand-gray">
          Faculty of Information Technology and Digital Innovation, King Mongkut&apos;s University of Technology North Bangkok
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <a
            href="#explore"
            className="px-6 py-3 rounded-lg bg-brand-orange hover:bg-brand-darkOrange text-white font-medium shadow-md transition-colors"
          >
            เข้าสู่เว็บไซต์
          </a>
          <a
            href="#about"
            className="px-6 py-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-brand-dark font-medium shadow-sm transition-colors"
          >
            เกี่ยวกับคณะ
          </a>
        </div>
      </div>
    </main>
  );
}
