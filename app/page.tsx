import Nav          from '@/components/Nav';
import Hero         from '@/components/sections/Hero';
import Ticker       from '@/components/sections/Ticker';
import Procedures   from '@/components/sections/Procedures';
import Services     from '@/components/sections/Services';
import Plans        from '@/components/sections/Plans';
import Benefits     from '@/components/sections/Benefits';
import HowItWorks   from '@/components/sections/HowItWorks';
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
        <Services />
        <Plans />
        <Benefits />
        <HowItWorks />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
