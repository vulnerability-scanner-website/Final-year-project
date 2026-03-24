// components/ui/feature-card.tsx

"use client";;
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names

const FeatureCard = React.forwardRef(({ className, title, description, children, ...props }, ref) => {
  
  // Animation variants for framer-motion
  const cardVariants = {
    offscreen: {
      y: 30,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.3 }}
      variants={cardVariants}
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-2xl border bg-[#1a1a1a] border-white/10 p-6 shadow-sm transition-shadow hover:shadow-md md:p-8",
        className
      )}
      {...props}>
      <div className="flex-grow">
        {/* Card Header: Title and Description */}
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-white/40">{description}</p>
      </div>
      {/* Main Content Area */}
      <div className="mt-6">{children}</div>
    </motion.div>
  );
});

FeatureCard.displayName = "FeatureCard";

export { FeatureCard };