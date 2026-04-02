'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav id="nav">
        <div className="container">
          <div className="nav-inner">
            <a href="#" className="logo">
              <img src="/logo.svg" alt="Depill plus" className="nav-logo-img" />
              <span>Depill plus</span>
            </a>

            <ul className="nav-links">
              <li><a href="#procedures">Procedimentos</a></li>
              <li><a href="#plans">Planos</a></li>
              <li><a href="#how">Como funciona</a></li>
              <li><a href="#testimonials">Depoimentos</a></li>
            </ul>

            <Link href="/minha-conta" className="nav-cta">
              Meus Agendamentos
            </Link>

            <button
              className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <a href="#procedures" onClick={closeMenu}>Procedimentos</a>
        <div className="m-divider" />
        <a href="#plans" onClick={closeMenu}>Planos</a>
        <div className="m-divider" />
        <a href="#how" onClick={closeMenu}>Como funciona</a>
        <div className="m-divider" />
        <a href="#testimonials" onClick={closeMenu}>Depoimentos</a>
        <Link href="/minha-conta" className="nav-mobile-cta" onClick={closeMenu}>
          Meus Agendamentos
        </Link>
      </div>
    </>
  );
}
