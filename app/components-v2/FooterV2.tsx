import React from 'react';
import Link from 'next/link';

const FooterV2 = () => {
  return (
    <footer id="footer-v2">
      <div className="container-v2">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="foot-logo"><span className="stay">stay</span><span>Vacation</span></div>
            <p>Premium tours, stays & adventures worldwide. Discover luxury escapes and epic journeys.</p>
          </div>
          
          <div className="footer-col">
            <h4>Destinations</h4>
            <ul>
              <li><Link href="/destinations/maldives">Maldives</Link></li>
              <li><Link href="/destinations/switzerland">Switzerland</Link></li>
              <li><Link href="/destinations/greece">Greece</Link></li>
              <li><Link href="/destinations/japan">Japan</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faq">FAQs</Link></li>
              <li><Link href="/pages/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/pages/terms-of-service">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/blog">Travel Blog</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/press">Press Kit</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '3rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
          <p>© 2026 stayVacation. All rights reserved.</p>
          <div className="footer-bottom-links" style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/pages/privacy-policy">Privacy</Link>
            <Link href="/pages/terms-of-service">Terms</Link>
            <Link href="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterV2;
