'use client';

import { useEffect } from 'react';

export default function ClientSetup() {
  useEffect(() => {
    /* ── Custom Cursor ─────────────────────────────── */
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    };
    document.addEventListener('mousemove', onMove);

    let rafId: number;
    const animRing = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      rafId = requestAnimationFrame(animRing);
    };
    rafId = requestAnimationFrame(animRing);

    const addHover = (el: Element) => {
      el.addEventListener('mouseenter', () => { dot.classList.add('hover'); ring.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { dot.classList.remove('hover'); ring.classList.remove('hover'); });
    };
    document.querySelectorAll('a,button').forEach(addHover);

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
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => revealObs.observe(el));

    const lineObs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.3 }
    );
    document.querySelectorAll('.steps-line-fill').forEach(el => lineObs.observe(el));

    return () => {
      document.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
      revealObs.disconnect();
      lineObs.disconnect();
      dot.remove();
      ring.remove();
    };
  }, []);

  return null;
}
