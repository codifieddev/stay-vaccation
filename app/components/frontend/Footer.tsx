"use client";
import Link from "next/link";
import { useAppSelector } from "@/app/store/hooks";

const FOOTER_LINKS = {
  Explore: [
    { href: "/packages", label: "All Packages" },
    { href: "/categories", label: "Categories" },
    { href: "/destinations", label: "Locations" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/admin", label: "Admin Panel" },
  ],
};

const SOCIAL = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { settings } = useAppSelector(state => state.businessSettings);

  const businessName = settings?.businessName || "Stay Vacation";
  const footerText = settings?.footerText || "Crafting unforgettable journeys across the world. From serene beach escapes to thrilling mountain adventures — we curate every moment.";
  
  const socialLinks = [];
  if (settings?.instagram) socialLinks.push({ label: "Instagram", href: settings.instagram, icon: SOCIAL[0].icon });
  if (settings?.facebook) socialLinks.push({ label: "Facebook", href: settings.facebook, icon: SOCIAL[1].icon });
  if (settings?.twitter) socialLinks.push({ label: "Twitter / X", href: settings.twitter, icon: SOCIAL[2].icon });
  const socialToRender = socialLinks.length > 0 ? socialLinks : SOCIAL;

  return (
    <footer className="bg-[#1a3f4e] text-white">
      {/* Main footer */}
      <div className="container-sv py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2fa3f2] to-[#1a7abf] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <div>
                <div className="font-bold text-lg leading-none">{businessName}</div>
                <div className="text-[#2fa3f2] text-xs">Premium Travel</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs whitespace-pre-wrap">
              {footerText}
            </p>
            
            {/* Contact Details */}
            {(settings?.email || settings?.phoneNumber || settings?.address) && (
              <div className="mt-5 space-y-1.5 border-l-2 border-[#2fa3f2]/30 pl-3">
                {settings.email && <div className="text-white/80 text-sm font-medium">{settings.email}</div>}
                {settings.phoneNumber && <div className="text-white/80 text-sm">{settings.phoneNumber}</div>}
                {settings.address && <div className="text-white/50 text-xs leading-relaxed max-w-[200px] mt-1">{settings.address}</div>}
              </div>
            )}
            {/* Social */}
            <div className="flex gap-3 mt-6">
              {socialToRender.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#2fa3f2] flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">{group}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-sv py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
          <p className="text-white/40 text-xs">
            Premium travel experiences · Worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
