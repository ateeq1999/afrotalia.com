import { Link } from "@tanstack/react-router";

export default function WebFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-[#18181B] bg-white">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 px-5 py-14 sm:px-8 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <img src="/logos/afrotalia-logo.svg" alt="Afrotalia" className="h-7 w-auto" />
          <p className="mt-4 max-w-[360px] text-[14px] leading-relaxed text-[#52525B]">
            Your gateway to East Africa.
          </p>
        </div>

        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#18181B]">Company</p>
          <ul className="mt-3 space-y-2 text-[14px] text-[#52525B]">
            <li><Link to="/about" className="hover:text-[#18181B]">About</Link></li>
            <li><Link to="/services" className="hover:text-[#18181B]">Services</Link></li>
            <li><Link to="/projects" className="hover:text-[#18181B]">Projects</Link></li>
            <li><Link to="/contact" className="hover:text-[#18181B]">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#18181B]">Legal</p>
          <ul className="mt-3 space-y-2 text-[14px] text-[#52525B]">
            <li><Link to="/privacy" className="hover:text-[#18181B]">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-[#18181B]">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E4E4E7]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-5 text-[12px] text-[#52525B] sm:px-8">
          © {year} Afrotalia.
        </div>
      </div>
    </footer>
  );
}
