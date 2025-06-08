import { HeroSectionOne } from "@/components/Home/HeroSection";
import FeaturedProducts from "@/components/Home/FeaturedProducts";
import React from "react";
import Categories from "@/components/Home/Categories";

const Home = () => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-black">
      <HeroSectionOne />
      <FeaturedProducts />
      <Categories />
    </div>
  );
};

export default Home;
