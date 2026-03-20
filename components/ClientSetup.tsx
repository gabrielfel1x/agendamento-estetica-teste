'use client';

import { useEffect } from 'react';

export default function ClientSetup() {
  useEffect(() => {
    /* ── Nav scroll ────────────────────────────────── */
    const nav = document.getElementById('nav');
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Hero load ─────────────────────────────────── */
    document.getElementById('hero')?.classList.add('loaded');

    /* ── Intersection Observer (scroll reveals) ─────── */
    const revealObs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    const lineObs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.3 }
    );

    function observeAll() {
      document.querySelectorAll('.reveal:not(.visible),.reveal-left:not(.visible),.reveal-right:not(.visible)').forEach(el => revealObs.observe(el));
      document.querySelectorAll('.steps-line-fill:not(.visible)').forEach(el => lineObs.observe(el));
    }

    // Observe immediately + after paint + watch for new elements
    observeAll();
    requestAnimationFrame(() => {
      observeAll();
    });

    const mutObs = new MutationObserver(() => {
      observeAll();
    });
    mutObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      revealObs.disconnect();
      lineObs.disconnect();
      mutObs.disconnect();
    };
  }, []);

  return null;
}
