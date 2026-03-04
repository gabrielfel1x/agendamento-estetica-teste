'use client';

import { useState } from 'react';
import { useModal } from '@/lib/modal-context';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openModal } = useModal();

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav id="nav">
        <div className="container">
          <div className="nav-inner">
            <a href="#" className="logo">
              <span>Lumière</span>
              <span className="logo-dot" />
            </a>

            <ul className="nav-links">
              <li><a href="#procedures">Procedimentos</a></li>
              <li><a href="#benefits">Por que nós</a></li>
              <li><a href="#how">Como funciona</a></li>
              <li><a href="#testimonials">Depoimentos</a></li>
            </ul>

            <button className="nav-cta" onClick={() => openModal()}>
              Agendar Agora
            </button>

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

      {/* Mobile full-screen menu */}
      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <a href="#procedures" onClick={closeMenu}>Procedimentos</a>
        <div className="m-divider" />
        <a href="#benefits" onClick={closeMenu}>Por que nós</a>
        <div className="m-divider" />
        <a href="#how" onClick={closeMenu}>Como funciona</a>
        <div className="m-divider" />
        <a href="#testimonials" onClick={closeMenu}>Depoimentos</a>
        <button
          className="nav-mobile-cta"
          onClick={() => { closeMenu(); openModal(); }}
        >
          Agendar Agora
        </button>
      </div>
    </>
  );
}
