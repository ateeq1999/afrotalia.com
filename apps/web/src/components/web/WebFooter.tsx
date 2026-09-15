import { Link } from "@tanstack/react-router";

export default function WebFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-ink bg-white">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 px-5 py-14 sm:px-8 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <img src="/logos/afrotalia-logo.svg" alt="Afrotalia" className="h-7 w-auto" />
          <p className="mt-4 max-w-[360px] text-[14px] leading-relaxed text-muted-ink">
            Your gateway to East Africa.
          </p>
        </div>

        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-ink">Company</p>
          <ul className="mt-3 space-y-2 text-[14px] text-muted-ink">
            <li><Link to="/about" className="hover:text-ink">About</Link></li>
            <li><Link to="/services" className="hover:text-ink">Services</Link></li>
            <li><Link to="/projects" className="hover:text-ink">Projects</Link></li>
            <li><Link to="/contact" className="hover:text-ink">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-ink">Legal</p>
          <ul className="mt-3 space-y-2 text-[14px] text-muted-ink">
            <li><Link to="/privacy" className="hover:text-ink">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-ink">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-5 text-[12px] text-muted-ink sm:px-8">
          © {year} Afrotalia.
        </div>
      </div>
    </footer>
  );
}
