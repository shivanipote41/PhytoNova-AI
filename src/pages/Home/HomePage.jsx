import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';

function HomePage() {
  return (
    <main className="bg-background min-h-screen">
      <HeroSection />
      <FeaturesSection />
    </main>
  );
}

export default HomePage;