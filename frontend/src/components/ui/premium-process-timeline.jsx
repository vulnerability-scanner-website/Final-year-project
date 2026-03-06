"use client";;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A simple utility function to merge class names, replacing the need for an external file.
const cn = (...classes) => classes.filter(Boolean).join(' ');

// --- Default Data ---
const DEMO_STEPS = [
  {
    id: "01",
    title: "Target Identification",
    subtitle: "Defining Security Scope",
    description: "We begin by identifying your web applications, APIs, and infrastructure to create a comprehensive security assessment plan.",
    details: ["Asset Discovery", "Scope Definition", "Risk Assessment", "Compliance Review"],
    duration: "1-2 days",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&h=600&q=80",
  },
  {
    id: "02",
    title: "Vulnerability Scanning",
    subtitle: "AI-Powered Detection",
    description: "Our advanced AI platform scans your applications for SQL injection, XSS, CSRF, and other critical vulnerabilities.",
    details: ["Automated Scanning", "Manual Testing", "Code Analysis", "Configuration Review"],
    duration: "2-3 days",
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=300&h=600&q=80",
  },
  {
    id: "03",
    title: "Penetration Testing",
    subtitle: "Simulating Real Attacks",
    description: "Our security experts simulate real-world attacks to identify exploitable vulnerabilities before malicious actors do.",
    details: ["Exploit Development", "Privilege Escalation", "Data Extraction", "Lateral Movement"],
    duration: "3-5 days",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=600&q=80",
  },
  {
    id: "04",
    title: "Reporting & Remediation",
    subtitle: "Actionable Security Insights",
    description: "We provide detailed reports with prioritized vulnerabilities and step-by-step remediation guidance to secure your applications.",
    details: ["Vulnerability Report", "Risk Prioritization", "Fix Recommendations", "Compliance Documentation"],
    duration: "1-2 days",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=300&h=600&q=80",
  },
];


// --- Main Timeline Component ---

export const QuantumTimeline = ({
  steps = DEMO_STEPS,
  defaultStep
}) => {
  const [activeStep, setActiveStep] = useState(defaultStep || steps[0]?.id);

  const activeStepData = steps.find(step => step.id === activeStep);
  const activeIndex = steps.findIndex(step => step.id === activeStep);

  return (
    <div
      className="w-full max-w-6xl mx-auto p-8 font-sans bg-white dark:bg-black rounded-2xl shadow-2xl">
      {/* Top Navigation */}
      <TimelineNav steps={steps} activeStep={activeStep} onStepClick={setActiveStep} />
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeStepData && (
          <motion.div
            key={activeStepData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 grid md:grid-cols-2 gap-12">
            <TimelineContent step={activeStepData} />
            <TimelinePhoneMockup image={activeStepData.image} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Bottom Timeline */}
      <BottomTimeline steps={steps} activeIndex={activeIndex} onStepClick={setActiveStep} />
    </div>
  );
};

// --- Sub-components ---

const TimelineNav = ({
  steps,
  activeStep,
  onStepClick
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div
        className="w-10 h-10 bg-primary/10 dark:bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">C</div>
      <span className="text-xl font-bold text-slate-800 dark:text-white">Security Process</span>
    </div>
    <div
      className="hidden md:flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
      {steps.map(step => (
        <button
          key={step.id}
          onClick={() => onStepClick(step.id)}
          className={cn(
            "px-4 py-1 rounded-full text-sm font-semibold transition-colors",
            activeStep === step.id
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700"
          )}>
          {step.id}
        </button>
      ))}
    </div>
  </div>
);

const TimelineContent = ({
  step
}) => (
  <div>
    <span className="text-sm font-bold text-primary">{step.id}</span>
    <h2 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{step.title}</h2>
    <p className="mt-1 text-slate-600 dark:text-slate-400">{step.subtitle}</p>
    <p className="mt-4 text-slate-700 dark:text-slate-300">{step.description}</p>
    <div className="mt-6 grid sm:grid-cols-2 gap-4">
      {step.details.map((detail, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="w-5 h-5 bg-green-500/10 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
          <span className="text-sm text-slate-700 dark:text-slate-300">{detail}</span>
        </div>
      ))}
    </div>
    <div
      className="mt-6 flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <span className="text-primary">⏳</span>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Duration: {step.duration}</span>
    </div>
  </div>
);

const TimelinePhoneMockup = ({
  image
}) => (
    <div className="flex items-center justify-center">
        <div
          className="w-64 h-[512px] bg-slate-800 dark:bg-slate-900 rounded-[40px] p-4 border-4 border-slate-700 dark:border-slate-800 shadow-2xl">
            <div className="w-full h-full bg-black rounded-[24px] overflow-hidden">
                <img src={image} alt="App Screenshot" className="w-full h-full object-cover" />
            </div>
        </div>
    </div>
);


const BottomTimeline = ({
  steps,
  activeIndex,
  onStepClick
}) => (
  <div className="mt-16">
    <div
      className="relative w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full">
      <motion.div
        className="absolute h-1 bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }} />
      <motion.div
        className="absolute w-4 h-4 -top-1.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(var(--primary),0.2)]"
        initial={{ left: '0%' }}
        animate={{ left: `calc(${(activeIndex / (steps.length - 1)) * 100}% - 8px)` }}
        transition={{ duration: 0.5, ease: "easeInOut" }} />
    </div>
    <div className="mt-4 flex justify-between">
      {steps.map((step, i) => (
        <button
          key={step.id}
          onClick={() => onStepClick(step.id)}
          className="text-center w-1/4">
          <span
            className={cn(
              "text-sm font-semibold transition-colors",
              i <= activeIndex ? "text-primary" : "text-slate-500 dark:text-slate-400"
            )}>
            {step.id}
          </span>
          <p
            className={cn(
              "text-xs mt-1 transition-colors",
              i <= activeIndex ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
            )}>
            {step.title.split(' ')[0]}
          </p>
        </button>
      ))}
    </div>
  </div>
);
