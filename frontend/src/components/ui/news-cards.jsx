"use client";;
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from "framer-motion";
import { useState, useEffect } from "react";
import { BookmarkIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultStatusBars = [
  {
    id: "1",
    category: "Cybersecurity",
    subcategory: "Threats",
    length: 3,
    opacity: 1,
  },
  {
    id: "2", 
    category: "Cybersecurity",
    subcategory: "Vulnerabilities",
    length: 2,
    opacity: 0.7,
  },
  {
    id: "3",
    category: "Security News",
    subcategory: "Updates",
    length: 1,
    opacity: 0.4,
  }
];

const defaultNewsCards = [
  {
    id: "1",
    title: "Major Zero-Day Vulnerability Discovered in Popular Web Framework",
    category: "Cybersecurity",
    subcategory: "Vulnerabilities",
    timeAgo: "15 min ago",
    location: "Global",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&h=900&fit=crop&q=80",
    gradientColors: ["from-red-500/20", "to-orange-500/20"],
    content: [
      "Security researchers have identified a critical zero-day vulnerability in one of the world's most widely-used web application frameworks, affecting millions of websites globally. The flaw allows attackers to execute arbitrary code remotely, potentially compromising entire server infrastructures.",
      "The vulnerability, tracked as CVE-2024-XXXX, was discovered by our security team during routine penetration testing. It affects all versions prior to the latest security patch and has been actively exploited in the wild for at least two weeks before detection.",
      "Major technology companies and government agencies have been notified and are rushing to deploy emergency patches. The vulnerability stems from improper input validation in the framework's authentication module, allowing attackers to bypass security controls entirely.",
      "Cybersecurity experts estimate that over 2 million web applications may be vulnerable to this exploit. Organizations are urged to update their systems immediately and conduct thorough security audits to detect any signs of compromise.",
      "The framework's development team has released an emergency security update and published detailed mitigation strategies for organizations unable to patch immediately. This incident highlights the critical importance of regular security assessments and timely patch management.",
      "Industry analysts predict this vulnerability could lead to widespread data breaches if not addressed quickly, emphasizing the need for proactive security measures and continuous monitoring of web applications."
    ]
  },
  {
    id: "2",
    title: "AI-Powered Phishing Attacks Reach Unprecedented Sophistication",
    category: "Cybersecurity", 
    subcategory: "Threats",
    timeAgo: "41 min ago",
    location: "Global",
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1600&h=900&fit=crop&q=80",
    gradientColors: ["from-blue-500/20", "to-purple-500/20"],
    content: [
      "Cybercriminals are leveraging advanced artificial intelligence to create highly convincing phishing campaigns that bypass traditional security measures. These AI-generated attacks can mimic writing styles, create realistic fake websites, and adapt in real-time to victim responses.",
      "Recent incidents show attackers using large language models to craft personalized phishing emails that are virtually indistinguishable from legitimate communications. The AI analyzes social media profiles and public information to create targeted messages with unprecedented accuracy.",
      "Security firms report a 300% increase in AI-powered phishing attempts over the past quarter, with success rates significantly higher than traditional phishing campaigns. The technology enables attackers to scale operations while maintaining high levels of personalization.",
      "Organizations are responding by implementing AI-powered defense systems that can detect subtle patterns in communication that indicate automated generation. However, the arms race between attackers and defenders continues to escalate.",
      "Experts recommend enhanced security awareness training that specifically addresses AI-generated threats, along with multi-factor authentication and zero-trust security architectures to minimize the impact of successful phishing attempts.",
      "This development represents a fundamental shift in the threat landscape, requiring organizations to rethink their security strategies and invest in next-generation detection and response capabilities."
    ]
  },
  {
    id: "3",
    title: "New Ransomware Strain Targets Critical Infrastructure Worldwide",
    category: "Cybersecurity",
    subcategory: "Threats",
    timeAgo: "1 hour ago",
    location: "Global",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&h=900&fit=crop&q=80",
    gradientColors: ["from-red-500/20", "to-pink-500/20"],
    content: [
      "A sophisticated new ransomware variant has emerged, specifically targeting critical infrastructure including power grids, water treatment facilities, and healthcare systems. The malware employs advanced evasion techniques and can remain dormant for weeks before activation.",
      "Security analysts have identified attacks in over 30 countries, with the ransomware group demanding unprecedented ransom amounts and threatening to disrupt essential services. The malware uses military-grade encryption and includes self-destruct mechanisms to avoid analysis.",
      "Unlike previous ransomware campaigns, this strain focuses on operational technology (OT) systems, potentially causing physical damage and service disruptions beyond data encryption. The attackers demonstrate deep knowledge of industrial control systems.",
      "Government agencies and cybersecurity organizations have issued emergency alerts, urging critical infrastructure operators to implement enhanced security measures immediately. Backup systems and incident response plans are being tested across affected sectors.",
      "The ransomware group behind these attacks appears to be state-sponsored, with capabilities suggesting significant resources and technical expertise. International cooperation is underway to track and neutralize the threat actors.",
      "This incident underscores the urgent need for improved cybersecurity in critical infrastructure sectors and highlights the potential consequences of successful attacks on essential services that millions depend upon daily."
    ]
  }
];

export function NewsCards({
  title = "Security News Today",
  subtitle = "Latest cybersecurity threats and updates from around the world",
  statusBars = defaultStatusBars,
  newsCards = defaultNewsCards,
  enableAnimations = true
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [bookmarkedCards, setBookmarkedCards] = useState(new Set());
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  const toggleBookmark = (cardId, e) => {
    e.stopPropagation();
    setBookmarkedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const openCard = (card) => {
    setSelectedCard(card);
  };

  const closeCard = () => {
    setSelectedCard(null);
  };

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsLoaded(true);
    }
  }, [shouldAnimate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const headerVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      filter: "blur(4px)",
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 28,
        mass: 0.6,
      }
    }
  };

  const statusBarContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      }
    }
  };

  const statusBarVariants = {
    hidden: { 
      opacity: 0, 
      scaleX: 0,
      x: -20,
    },
    visible: { 
      opacity: 1, 
      scaleX: 1,
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        scaleX: { type: "spring", stiffness: 400, damping: 30 }
      }
    }
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.8,
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9,
      filter: "blur(6px)",
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 28,
        mass: 0.8,
      }
    }
  };

  const imageVariants = {
    hidden: { 
      scale: 1.1,
      opacity: 0.8,
    },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: 0.2,
      }
    }
  };



  return (
    <motion.div
      className="w-full max-w-6xl mx-auto p-6 bg-background text-foreground"
      initial={shouldAnimate ? "hidden" : "visible"}
      animate={isLoaded ? "visible" : "hidden"}
      variants={shouldAnimate ? containerVariants : {}}>
      {/* Header */}
      <motion.div className="mb-8" variants={shouldAnimate ? headerVariants : {}}>
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground text-lg">{subtitle}</p>
        
        {/* Simple Border Lines */}
        <motion.div
          className="mt-6 space-y-1"
          variants={shouldAnimate ? statusBarContainerVariants : {}}>
          {statusBars.map((bar, index) => (
            <motion.div
              key={bar.id}
              className={cn(
                "h-0.5 bg-foreground rounded-full",
                bar.id === "1" ? "bg-foreground/80" : bar.id === "2" ? "bg-foreground/60" : "bg-foreground/40"
              )}
              style={{ 
                opacity: bar.opacity,
                width: `${(bar.length / 3) * 100}%`
              }}
              variants={shouldAnimate ? statusBarVariants : {}}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ 
                delay: 0.3 + (index * 0.1),
                type: "spring", 
                stiffness: 400, 
                damping: 30 
              }} />
          ))}
        </motion.div>
      </motion.div>
      {/* News Cards with Shared Layout */}
      <LayoutGroup>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
          variants={shouldAnimate ? cardContainerVariants : {}}>
          {newsCards.map((card, index) => {
            if (selectedCard?.id === card.id) {
              return null; // Don't render the compact card when expanded
            }
            
            return (
              <motion.article
                key={card.id}
                layoutId={`card-${card.id}`}
                className="bg-card border border-border/50 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer group"
                variants={shouldAnimate ? cardVariants : {}}
                whileHover={shouldAnimate ? { 
                  y: -4,
                  scale: 1.01,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                } : {}}
                onClick={() => openCard(card)}>
                {/* Image with gradient overlay */}
                <motion.div
                  layoutId={`card-image-${card.id}`}
                  className="relative h-56 overflow-hidden bg-muted">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transform-gpu group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div
                    className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-background/80 to-transparent"></div>
                  {card.gradientColors && (
                    <div
                      className={`absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t ${card.gradientColors[0]} ${card.gradientColors[1]} to-transparent`}></div>
                  )}
                  
                  {/* Bookmark icon */}
                  <motion.div
                    className="absolute top-3 right-3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 25 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => toggleBookmark(card.id, e)}>
                    <BookmarkIcon
                      className={`w-5 h-5 transition-colors cursor-pointer ${
                        bookmarkedCards.has(card.id) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-white/80 hover:text-white'
                      }`} />
                  </motion.div>

                  {/* Category and time info */}
                  <motion.div
                    className="absolute bottom-3 left-3 text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 25 }}>
                    <div className="text-xs mb-1 opacity-90">
                      {card.category}, {card.subcategory}
                    </div>
                    <div className="text-xs opacity-75">
                      {card.timeAgo}, {card.location}
                    </div>
                  </motion.div>
                </motion.div>
                {/* Content */}
                <motion.div layoutId={`card-content-${card.id}`} className="p-6">
                  <motion.h3
                    layoutId={`card-title-${card.id}`}
                    className="font-semibold text-lg leading-tight line-clamp-3 group-hover:text-primary transition-colors">
                    {card.title}
                  </motion.h3>
                </motion.div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Expanded Card Modal */}
        <AnimatePresence>
          {selectedCard && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeCard} />
              
              {/* Expanded Card */}
              <motion.div
                layoutId={`card-${selectedCard.id}`}
                className="fixed inset-4 md:inset-8 lg:inset-16 bg-card border border-border rounded-xl overflow-hidden z-50">
                {/* Close Button */}
                <motion.button
                  className="absolute top-4 right-4 w-8 h-8 bg-background/80 hover:bg-background rounded-full flex items-center justify-center z-10"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeCard}>
                  <X className="w-4 h-4" />
                </motion.button>

                <div className="h-full overflow-y-auto">
                  {/* Header Image */}
                  <motion.div
                    layoutId={`card-image-${selectedCard.id}`}
                    className="relative h-64 md:h-80">
                    <img
                      src={selectedCard.image}
                      alt={selectedCard.title}
                      className="w-full h-full object-cover" />
                    <div
                      className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 to-transparent"></div>
                    {selectedCard.gradientColors && (
                      <div
                        className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t ${selectedCard.gradientColors[0]} ${selectedCard.gradientColors[1]} to-transparent`}></div>
                    )}
                    
                    {/* Image overlay info */}
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-sm mb-1 opacity-90">{selectedCard.category}, {selectedCard.subcategory}</div>
                      <div className="text-sm opacity-75">{selectedCard.timeAgo}, {selectedCard.location}</div>
                    </div>
                  </motion.div>

                  {/* Content */}
                  <motion.div layoutId={`card-content-${selectedCard.id}`} className="p-6 md:p-8">
                    <motion.h1
                      layoutId={`card-title-${selectedCard.id}`}
                      className="text-2xl md:text-3xl font-bold mb-6">
                      {selectedCard.title}
                    </motion.h1>
                    
                    <motion.div
                      className="prose prose-lg max-w-none text-muted-foreground"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}>
                      {selectedCard.content ? (
                        selectedCard.content.map((paragraph, index) => (
                          <p key={index} className="mb-4">
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <>
                          <p className="mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                          </p>
                          <p className="mb-4">
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                          </p>
                          <p className="mb-4">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                          </p>
                          <p className="mb-4">
                            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
                          </p>
                          <p>
                            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
                          </p>
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </motion.div>
  );
} 