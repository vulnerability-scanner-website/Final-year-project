import * as React from "react";
import { motion } from "framer-motion";
import { Check, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

const StatusIcon = ({ status, customIcon }) => {
  if (customIcon) return <>{customIcon}</>;
  switch (status) {
    case "completed": return <Check className="h-4 w-4 text-white" />;
    case "in-progress": return <CircleDot className="h-4 w-4 text-yellow-400" />;
    default: return <Circle className="h-4 w-4 text-white/30" />;
  }
};

const TrackingTimeline = ({ items, className }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.ol
      className={cn("relative border-l border-white/10 ml-4", className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          className="mb-8 ml-8"
          variants={itemVariants}
          aria-current={item.status === "in-progress" ? "step" : undefined}
        >
          <span
            className={cn(
              "absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-[#1a1a1a]",
              {
                "bg-yellow-500": item.status === "completed",
                "bg-yellow-500/20": item.status === "in-progress",
                "bg-white/10": item.status === "pending",
              }
            )}
          >
            {item.status === "in-progress" && (
              <span className="absolute h-full w-full animate-ping rounded-full bg-yellow-500/40 opacity-75" />
            )}
            <StatusIcon status={item.status} customIcon={item.icon} />
          </span>

          <div className="flex flex-col">
            <h3
              className={cn("font-semibold", {
                "text-white": item.status !== "pending",
                "text-white/30": item.status === "pending",
              })}
            >
              {item.title}
            </h3>
            <time
              className={cn("text-sm text-white/40", {
                "font-medium text-yellow-400": item.status === "in-progress",
              })}
            >
              {item.date}
            </time>
          </div>
        </motion.li>
      ))}
    </motion.ol>
  );
};

export default TrackingTimeline;
