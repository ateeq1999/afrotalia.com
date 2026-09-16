import { Link } from "@tanstack/react-router";

import AfrotaliaLogo from "@afrotalia/ui/brand/AfrotaliaLogo";

export default function WebFooter({ tagline }: { tagline: string | null }) {
  return (
    <footer className="border-t-2 border-ink bg-white">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 px-5 py-12 sm:gap-8 sm:px-8 sm:py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <AfrotaliaLogo variant="light" />
          {tagline ? <p className="mt-4 max-w-[360px] text-[14px] leading-relaxed text-muted-ink">{tagline}</p> : null}
        </div>

        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-ink">Company</p>
          <ul className="mt-3 space-y-2.5 text-[14px] text-muted-ink">
            <li><Link to="/" className="hover:text-ink">Home</Link></li>
            <li><Link to="/about" className="hover:text-ink">About</Link></li>
            <li><Link to="/services" className="hover:text-ink">What We Do</Link></li>
            <li><Link to="/projects" className="hover:text-ink">Projects</Link></li>
            <li><Link to="/contact" className="hover:text-ink">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-ink">Platforms</p>
          <ul className="mt-3 space-y-2.5 text-[14px] text-muted-ink">
            <li><a href="https://shop.afrotalia.com" className="hover:text-ink">shop.afrotalia.com</a></li>
            <li><a href="https://mnada.afrotalia.com" className="hover:text-ink">mnada.afrotalia.com</a></li>
          </ul>
          <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.6px] text-ink">Legal</p>
          <ul className="mt-3 space-y-2.5 text-[14px] text-muted-ink">
            <li><Link to="/privacy" className="hover:text-ink">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-ink">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-5 text-[12px] text-muted-ink sm:px-8">
          © Afrotalia International Ltd. Dar es Salaam, Tanzania.
        </div>
      </div>
    </footer>
  );
}
