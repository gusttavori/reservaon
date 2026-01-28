// src/pages/LandingPage.jsx
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import CatalogPreview from '../components/CatalogPreview';
import Features from '../components/Features';
// import SocialProof from '../components/SocialProof'; // <--- REMOVER
import SystemShowcase from '../components/SystemShowcase'; // <--- ADICIONAR
import SupportCTA from '../components/SupportCTA';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <>
      <main>
        <Hero />
        <SystemShowcase /> {/* <--- Nova seção aqui */}
        <HowItWorks />
        <CatalogPreview />
        <Features />
        <SupportCTA />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;