"use client";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function HeroSectionOne() {
  return (
    <section className="relative mx-auto flex max-w-7xl  flex-col items-center justify-center px-4  py-4 ">
      {/* Tagline / Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4 rounded-full border px-4 py-1 text-sm font-medium text-black dark:text-gray-300 dark:border-gray-700"
      >
        NEW COLLECTION
      </motion.div>

      {/* Featured Video */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="relative z-10  w-full max-w-5xl overflow-hidden  shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700"
      >
        <video
          src="/DapperDaze.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-auto object-cover "
        />
      </motion.div>
      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1 }}
        className="relative z-10 mt-10 flex flex-wrap justify-center gap-4"
      >
        <Link href={"/products"}>
          <InteractiveHoverButton className="dark:text-white">
            <span>Shop Now</span>
          </InteractiveHoverButton>
        </Link>
      </motion.div>
    </section>
  );
}
