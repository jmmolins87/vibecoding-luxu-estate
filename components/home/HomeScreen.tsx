import Navbar from "@/components/layout/Navbar";
import HeroSearch from "@/components/home/HeroSearch";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewInMarket from "@/components/home/NewInMarket";

export default function HomeScreen() {
  return (
    <div className="min-h-full bg-clearday font-display text-nordic antialiased selection:bg-mosque selection:text-white dark:bg-[#0f231f] dark:text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <HeroSearch />
        <FeaturedCollections />
        <NewInMarket />
      </main>
    </div>
  );
}
