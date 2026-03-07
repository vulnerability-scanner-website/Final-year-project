"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Github,
  ArrowUpRight,
  ShieldCheck,
  ScanSearch,
  Lock,
  Server,
  User,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CyberneticGridShader from "@/components/ui/cybernetic-grid-shader";
import { Testimonials } from "@/components/ui/twitter-testimonial-cards";
import ExpandOnHover from "@/components/ui/expand-cards";
import { ScannerCardStream } from "@/components/ui/scanner-card-stream";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function DesignAgency() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Background Shader */}
      <div className="fixed inset-0 z-0">
        <CyberneticGridShader />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${scrollY > 50 ? "shadow-md" : ""}`}
      >
        <div className="container flex h-16 items-center justify-between border-x border-muted">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="h-10 w-10 rounded-3xl bg-primary flex items-center justify-center"
              >
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="font-bold text-xl">CyberSecure</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-3">
            <Link
              href="#services"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Services
            </Link>
            <Link
              href="#work"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Work
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              href="#clients"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Clients
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-3xl" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button size="sm" className="rounded-3xl" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
          <button className="flex md:hidden" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>
      </motion.header>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background md:hidden"
        >
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="h-10 w-10 rounded-3xl bg-primary flex items-center justify-center"
                >
                  <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                </motion.div>
                <span className="font-bold text-xl">
                  Cyber<span className="text-orange-500">Secure</span>
                </span>
              </Link>
            </div>
            <button onClick={toggleMenu}>
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <motion.nav
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="container grid gap-3 pb-8 pt-6"
          >
            {["Services", "Work", "About", "Clients", "Contact"].map(
              (item, index) => (
                <motion.div key={index} variants={itemFadeIn}>
                  <Link
                    href={`#${item.toLowerCase()}`}
                    className="flex items-center justify-between rounded-3xl px-3 py-2 text-lg font-medium hover:bg-accent"
                    onClick={toggleMenu}
                  >
                    {item}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              ),
            )}
            <motion.div
              variants={itemFadeIn}
              className="flex flex-col gap-3 pt-4"
            >
              <Button variant="outline" className="w-full rounded-3xl" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button className="w-full rounded-3xl" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </motion.div>
          </motion.nav>
        </motion.div>
      )}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
          <div className="container px-4 md:px-6 border border-muted rounded-3xl bg-gradient-to-br from-background to-muted/30">
            <div className="grid gap-3 lg:grid-cols-[1fr_400px] lg:gap-3 xl:grid-cols-[1fr_600px]">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="flex flex-col justify-center space-y-4 py-10"
              >
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-3xl bg-muted px-3 py-1 text-sm"
                  >
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    AI-Powered Security Platform
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                  >
                    We secure your digital infrastructure with{" "}
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      AI-powered penetration testing
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="max-w-[600px] text-foreground md:text-xl"
                  >
                    Our advanced AI platform identifies vulnerabilities before
                    attackers do, protecting your web applications with
                    real-time security scanning.
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <Button size="lg" className="rounded-3xl group" asChild>
                    <Link href="/auth/signup">
                      Start Security Scan
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </motion.span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-3xl"
                    asChild
                  >
                    <Link href="#services">View Security Services</Link>
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center justify-center"
              >
                <div className="relative h-[350px] w-full md:h-[450px] lg:h-[500px] xl:h-[550px] overflow-hidden rounded-3xl">
                  <Image
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80"
                    alt="Cybersecurity Dashboard"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Client Logos */}
        <section id="clients" className="w-full py-12 md:py-16 lg:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container px-4 md:px-6 border border-muted rounded-3xl bg-muted/20"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-10">
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block rounded-3xl bg-muted px-3 py-1 text-sm"
                >
                  Trusted by
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                >
                  Trusted by Security Teams
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                >
                  Leading companies trust us to secure their digital
                  infrastructure and protect against cyber threats
                </motion.p>
              </div>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto grid grid-cols-2 items-center gap-3 py-8 md:grid-cols-3 lg:grid-cols-6"
            >
              {[
                "HU",
                "INSA",
                "Diredawa U",
                "Bahir-Dar U",
                "Hawassa U",
                "Mekele U",
              ].map((company, i) => (
                <motion.div
                  key={i}
                  variants={itemFadeIn}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center"
                >
                  <div className="rounded-3xl border p-6 bg-background/80 hover:shadow-md transition-all">
                    <div className="w-[160px] h-[80px] flex items-center justify-center text-2xl font-bold text-muted-foreground grayscale hover:grayscale-0 transition-all">
                      {company}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container px-4 md:px-6"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-10">
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block rounded-3xl bg-muted px-3 py-1 text-sm"
                >
                  Services
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white"
                >
                  Our Security Services
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                >
                  We provide comprehensive cybersecurity solutions to protect
                  your digital assets from modern threats
                </motion.p>
              </div>
            </div>
            <div className="py-12">
              <ScannerCardStream
                cardImages={[
                  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
                  "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
                  "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&q=80",
                  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
                  "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80",
                  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
                ]}
                cardTexts={[
                  { title: "Penetration Testing", description: "Comprehensive security testing to identify vulnerabilities" },
                  { title: "Vulnerability Assessment", description: "Automated scanning and analysis of security weaknesses" },
                  { title: "Security Auditing", description: "In-depth review of your security infrastructure" },
                  { title: "Infrastructure Security", description: "Protect your servers and cloud infrastructure" },
                  { title: "Compliance Testing", description: "Ensure regulatory compliance and standards" },
                  { title: "Security Consulting", description: "Expert guidance on security best practices" },
                ]}
              />
            </div>
          </motion.div>
        </section>

        {/* Portfolio/Work Slider */}
        <section id="work" className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container px-4 md:px-6 border border-muted rounded-3xl bg-muted/10"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-10">
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block rounded-3xl bg-muted px-3 py-1 text-sm"
                >
                  Portfolio
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                >
                  Security Case Studies
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                >
                  Real-world penetration testing results and vulnerability
                  assessments from our security experts
                </motion.p>
              </div>
            </div>
            <div className="relative py-12">
              <div className="overflow-hidden">
                <motion.div
                  animate={{ x: `-${currentSlide * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="flex"
                >
                  {[
                    {
                      img: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1200&h=800&q=80",
                      title: "E-commerce Security Audit",
                      desc: "Complete security assessment of online retail platform",
                    },
                    {
                      img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=800&q=80",
                      title: "Banking App Vulnerability Assessment",
                      desc: "Critical security testing for financial mobile application",
                    },
                    {
                      img: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=800&q=80",
                      title: "Healthcare Data Protection",
                      desc: "HIPAA compliance and data security implementation",
                    },
                  ].map((slide, index) => (
                    <div key={index} className="min-w-full px-4">
                      <div className="group relative overflow-hidden rounded-3xl h-[400px] md:h-[500px]">
                        <Image
                          src={slide.img}
                          alt={slide.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
                          <h3 className="text-2xl font-bold">{slide.title}</h3>
                          <p className="text-sm mt-2">{slide.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === index
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* About/Team Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container px-4 md:px-6 border border-muted rounded-3xl"
          >
            <div className="grid gap-3 lg:grid-cols-2 lg:gap-3">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4 p-6"
              >
                <div className="inline-block rounded-3xl bg-muted px-3 py-1 text-sm">
                  About Us
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Our Security Mission
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  Founded by cybersecurity experts in 2020, we've been
                  protecting digital assets with cutting-edge AI technology. Our
                  platform has identified over 10,000 vulnerabilities across
                  enterprise applications, preventing potential breaches worth
                  millions.
                </p>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  Our approach combines advanced penetration testing, AI-powered
                  vulnerability detection, and expert security analysis to
                  deliver comprehensive protection for modern businesses.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" size="lg" className="rounded-3xl" asChild>
                    <Link href="/process">Our Process</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-3xl" asChild>
                    <Link href="/careers">Join Our Team</Link>
                  </Button>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center"
              >
                <div className="relative h-[350px] w-full md:h-[450px] lg:h-[500px] overflow-hidden rounded-3xl">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&q=80"
                    alt="Security Team"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            </div>
            <div className="mt-16 px-6 pb-10">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold tracking-tighter sm:text-3xl text-white"
              >
                Meet Our Team
              </motion.h3>
              <div className="mt-8">
                <ExpandOnHover />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container px-4 md:px-6"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-10">
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block rounded-3xl bg-background px-3 py-1 text-sm"
                >
                  Testimonials
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white"
                >
                  What Our Clients Say
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                >
                  Don't just take our word for it - hear from some of our
                  satisfied clients
                </motion.p>
              </div>
            </div>
            <div className="flex justify-center py-12">
              <Testimonials cards={[
                {
                  className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-2xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/60 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-500 hover:grayscale-0 before:left-0 before:top-0",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abel",
                  username: "Abel Tasew",
                  handle: "@abeltasew",
                  content: "CyberSecure identified critical vulnerabilities we missed in our internal audits. Their AI platform saved us from potential breaches worth millions.",
                  date: "Jan 5, 2026",
                  verified: true,
                  likes: 245,
                  retweets: 42,
                  tweetUrl: "https://x.com",
                },
                {
                  className: "[grid-area:stack] translate-x-8 sm:translate-x-16 translate-y-6 sm:translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-2xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/60 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-500 hover:grayscale-0 before:left-0 before:top-0",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lemma",
                  username: "Lemma Bekele",
                  handle: "@lemmabekele",
                  content: "The attention to detail and creative solutions provided by the team helped us increase our security posture by 40%.",
                  date: "Jan 3, 2026",
                  verified: true,
                  likes: 189,
                  retweets: 28,
                  tweetUrl: "https://x.com",
                },
                {
                  className: "[grid-area:stack] translate-x-16 sm:translate-x-32 translate-y-12 sm:translate-y-20 hover:translate-y-6 sm:hover:translate-y-10",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tigist",
                  username: "Tigist Alemu",
                  handle: "@tigistalemu",
                  content: "Their strategic approach to security not only improved our infrastructure but also strengthened our brand trust.",
                  date: "Jan 1, 2026",
                  verified: true,
                  likes: 312,
                  retweets: 56,
                  tweetUrl: "https://x.com",
                },
              ]} />
            </div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container grid items-center gap-3 px-4 md:px-6 lg:grid-cols-2 border border-muted rounded-3xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-3 p-6"
            >
              <div className="inline-block rounded-3xl bg-muted px-3 py-1 text-sm">
                Contact
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white">
                Secure Your Applications Today
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Ready to identify vulnerabilities before attackers do? Contact
                our security experts to discuss your penetration testing needs.
              </p>
              <div className="mt-8 space-y-4">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3"
                >
                  <div className="rounded-3xl bg-muted p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Our Location</h3>
                    <p className="text-sm text-muted-foreground">
                      Bole Sub City, Woreda 10, Addis Ababa, Ethiopia
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3"
                >
                  <div className="rounded-3xl bg-muted p-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Us</h3>
                    <p className="text-sm text-muted-foreground">
                      security@cybersecure.com
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3"
                >
                  <div className="rounded-3xl bg-muted p-2">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Call Us</h3>
                    <p className="text-sm text-muted-foreground">
                      +251975567560 CyberSecure
                    </p>
                  </div>
                </motion.div>
              </div>
              <div className="mt-8 flex space-x-3">
                {[
                  {
                    icon: <Instagram className="h-5 w-5" />,
                    label: "Instagram",
                  },
                  { icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
                  { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" },
                  { icon: <Facebook className="h-5 w-5" />, label: "Facebook" },
                ].map((social, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Link
                      href="#"
                      className="rounded-3xl border p-2 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    >
                      {social.icon}
                      <span className="sr-only">{social.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border bg-background p-6 shadow-sm"
            >
              <h3 className="text-xl font-bold">Send Us a Message</h3>
              <p className="text-sm text-muted-foreground">
                Fill out the form below and we'll get back to you shortly.
              </p>
              <form className="mt-6 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="first-name"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      First name
                    </label>
                    <Input
                      id="first-name"
                      placeholder="Enter your first name"
                      className="rounded-3xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="last-name"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Last name
                    </label>
                    <Input
                      id="last-name"
                      placeholder="Enter your last name"
                      className="rounded-3xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="rounded-3xl"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message"
                    className="min-h-[120px] rounded-3xl"
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="submit" className="w-full rounded-3xl">
                    Send Message
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </section>
      </main>
      {/* Footer */}
      <footer className="w-full border-t">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="container grid gap-3 px-4 py-10 md:px-6 lg:grid-cols-4 border-x border-muted"
        >
          <div className="space-y-3">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="h-10 w-10 rounded-3xl bg-primary flex items-center justify-center"
              >
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="font-bold text-xl text-white">
                Cyber<span className="text-orange-500">Secure</span>
              </span>
            </Link>
            <p className="text-sm text-white">
              We protect digital infrastructure with AI-powered security testing
              and vulnerability assessment.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
                { icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
                { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" },
                { icon: <Github className="h-5 w-5" />, label: "GitHub" },
              ].map((social, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {social.icon}
                    <span className="sr-only">{social.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <h3 className="text-lg font-medium text-white">Company</h3>
              <nav className="mt-4 flex flex-col space-y-2 text-sm">
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>
                <Link
                  href="/careers"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Careers
                </Link>
                <Link
                  href="/process"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Our Process
                </Link>
                <Link
                  href="/news"
                  className="text-muted-foreground hover:text-foreground"
                >
                  News & Press
                </Link>
              </nav>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Services</h3>
              <nav className="mt-4 flex flex-col space-y-2 text-sm">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Penetration Testing
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Vulnerability Assessment
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Security Auditing
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Compliance Testing
                </Link>
              </nav>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <h3 className="text-lg font-medium text-white">Resources</h3>
              <nav className="mt-4 flex flex-col space-y-2 text-sm">
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground"
                >
                  FAQ
                </Link>
              </nav>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Legal</h3>
              <nav className="mt-4 flex flex-col space-y-2 text-sm">
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Subscribe to our newsletter</h3>
            <p className="text-sm text-white">
              Stay updated with our latest projects, design tips, and company
              news.
            </p>
            <form className="flex space-x-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-lg flex-1 rounded-3xl"
              />
              <Button type="submit" className="rounded-3xl">
                Subscribe
              </Button>
            </form>
          </div>
        </motion.div>
        <div className="border-t">
          <div className="container flex flex-col items-center justify-between gap-3 py-6 md:h-16 md:flex-row md:py-0">
            <p className="text-xs text-foreground">
              &copy; {new Date().getFullYear()} CyberSecure. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
