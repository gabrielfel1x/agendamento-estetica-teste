import Nav          from '@/components/Nav';
import Hero         from '@/components/sections/Hero';
import Ticker       from '@/components/sections/Ticker';
import Procedures   from '@/components/sections/Procedures';
import Benefits     from '@/components/sections/Benefits';
import StatsBar     from '@/components/sections/StatsBar';
import HowItWorks   from '@/components/sections/HowItWorks';
import Testimonials from '@/components/sections/Testimonials';
import CtaFinal     from '@/components/sections/CtaFinal';
import Footer       from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Procedures />
        <Benefits />
        <StatsBar />
        <HowItWorks />
        <Testimonials />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
