import Link from "next/link";
import { GraduationCap, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";

const footerLinks = {
  Product: [
    { href: "/courses", label: "Browse Courses" },
    { href: "/pricing", label: "Pricing" },
    { href: "/#instructors", label: "Become an Instructor" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  Legal: [
    { href: "/legal/privacy-policy", label: "Privacy Policy" },
    { href: "/legal/terms", label: "Terms & Conditions" },
    { href: "/legal/refund-policy", label: "Refund Policy" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-surface-subtle dark:border-slate-800 dark:bg-surface-dark-subtle">
      <div className="container-app py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-400 text-white">
                <GraduationCap size={18} />
              </span>
              LearnSphere
            </Link>
            <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Learn new skills from expert instructors, at your own pace, in
              English or Bengali.
            </p>
            <div className="mt-4 flex gap-3">
              {[Twitter, Linkedin, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Social link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{heading}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          © {new Date().getFullYear()} LearnSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
