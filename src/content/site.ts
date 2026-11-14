import { solutionsData, type SolutionPageConfig, type SolutionStatus } from "./solutions";

export type { SolutionPageConfig, SolutionStatus };
export const solutions = solutionsData;

export interface NavItem {
  name: string;
  path: string;
}

export interface ContactInfo {
  email: string;
  phones: string[];
  address: string;
  city: string;
  state: string;
  country: string;
  brandLine: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  name: string;
  description: string;
  highlights: string[];
  linkUrl: string;
  linkText: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  tagline: string;
  group: "aviation" | "business";
  features: string[];
  badge: string;
  href?: string;
}

export interface RegulatorItem {
  name: string;
  region: string;
}

export interface AviationAuthority {
  code: string;
  name: string;
  region: string;
  questionTypes: string[];
  subjects: string[];
  negativeMarking: string;
  timerPassing: string;
}

export interface AviationModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

export interface AviationFAQ {
  question: string;
  answer: string;
}

export interface SiteContent {
  brand: {
    name: string;
    tagline: string;
    location: string;
  };
  contact: ContactInfo;
  navItems: NavItem[];
  home: {
    hero: {
      headline: string;
      subHeadline: string;
      primaryCta: string;
      secondaryCta: string;
      aviationCta: string;
    };
    mission: {
      tag: string;
      heading: string;
      description: string;
    };
    capabilities: {
      heading: string;
      items: {
        title: string;
        description: string;
      }[];
    };
    cta: {
      heading: string;
      description: string;
      primaryButton: string;
      secondaryButton: string;
    };
  };
  about: {
    tag: string;
    headline: string;
    intro: string;
    storyTitle: string;
    storyBody: string;
    quote: string;
    pillarsTitle: string;
    pillars: {
      number: string;
      title: string;
      description: string;
    }[];
  };
  services: ServiceItem[];
  projects: ProjectItem[];
  projectGroups: {
    aviation: {
      title: string;
      subtitle: string;
    };
    business: {
      title: string;
      subtitle: string;
    };
  };
  regulators: {
    list: RegulatorItem[];
    note: string;
  };
  aviation: {
    badge: string;
    headline: string;
    subHeadline: string;
    pitch: string;
    modulesTitle: string;
    modulesSubtitle: string;
    modules: AviationModule[];
    authoritiesTitle: string;
    authoritiesSubtitle: string;
    authorities: AviationAuthority[];
    regulatorNote: string;
    otherInstitutes: {
      title: string;
      description: string;
      types: string[];
    };
    cta: {
      heading: string;
      description: string;
      buttonText: string;
    };
    faqs: AviationFAQ[];
  };
  budgetOptions: string[];
  form: {
    heading: string;
    subtitle: string;
    buttonText: string;
    sendingText: string;
    successMessage: string;
    placeholders: {
      name: string;
      email: string;
      phone: string;
      organisation: string;
      budget: string;
      message: string;
    };
  };
  technology: {
    headline: string;
    subHeadline: string;
    cardHeading: string;
    cardDescription: string;
    principles: {
      title: string;
      description: string;
      tag: string;
    }[];
  };
  solutions: SolutionPageConfig[];
}

export const siteContent: SiteContent = {
  brand: {
    name: "ZYXEN",
    tagline: "Intelligence Meets Elegance",
    location: "Hyderabad, Telangana, India",
  },
  contact: {
    email: "contact@zyxen.in",
    phones: ["+91 70135 58465", "+91 98669 42111"],
    address: "Hyderabad, Telangana, India",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    brandLine: "Intelligence Meets Elegance",
  },
  navItems: [
    { name: "Home", path: "/" },
    { name: "Aviation", path: "/aviation-academy-software" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Tech", path: "/technology" },
    { name: "Projects", path: "/projects" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ],
  home: {
    hero: {
      headline: "ENGINEERING EXPERIENCES.",
      subHeadline:
        "Software for aviation academies and growing businesses: exam portals, fee and finance systems, admissions, ERP and high-performance websites.",
      primaryCta: "Start a project",
      secondaryCta: "Browse Portfolio",
      aviationCta: "Aviation Academy Systems",
    },
    mission: {
      tag: "The Zyxen Standard",
      heading: "Bridging the gap between reliable computing and human-centred design.",
      description:
        "Most business software forces a compromise: fast and dependable but difficult to use, or modern-looking but fragile. At Zyxen, we engineer web platforms and business systems that remove that compromise—delivering dependable uptime, clear workflows, and refined user interfaces.",
    },
    capabilities: {
      heading: "Capabilities",
      items: [
        {
          title: "Exam & Admissions Systems",
          description:
            "Custom test-prep engines, timed mock tests, and student enquiry pipelines tailored to institutional rules.",
        },
        {
          title: "ERP & Operations",
          description:
            "Central systems for billing, student fee ledgers, batch inventory, and quotation-to-invoice workflows.",
        },
        {
          title: "Modern Web Applications",
          description:
            "Accessible, responsive websites and interactive 3D interfaces built with clean code and search visibility.",
        },
      ],
    },
    cta: {
      heading: "LET'S BUILD TOGETHER.",
      description:
        "Whether you need an aviation academy portal, a tailored operational tool, or an interactive website, partner with Zyxen to build software fitted to your business.",
      primaryButton: "Start a project",
      secondaryButton: "View Capabilities",
    },
  },
  about: {
    tag: "Hyderabad Web & Software Agency",
    headline: "ABOUT ZYXEN",
    intro:
      "ZYXEN is an independent web development and software engineering agency based in Hyderabad, Telangana. We build custom software, pilot exam portals, fee and finance systems, admissions pipelines, and interactive websites for aviation academies, growing manufacturers, and modern businesses.", // VERIFY: Hyderabad base and agency scope
    storyTitle: "How We Work",
    storyBody:
      "ZYXEN develops pilot exam portals, fee and finance systems, admissions pipelines, and operations software for aviation academies and institutes. We also engineer custom web applications, workflow automation tools, and high-performance websites for growing businesses.", // VERIFY: What ZYXEN builds and for whom
    quote: "Clear specifications, focused software, and direct engineering support.",
    pillarsTitle: "Our Working Principles",
    pillars: [
      {
        number: "01",
        title: "Clear Scope",
        description:
          "Detailed technical specifications, itemized deliverables, and agreed milestones before any code is written, ensuring no surprise costs or misaligned expectations.",
      },
      {
        number: "02",
        title: "Fast Delivery",
        description:
          "Working software deployed iteratively in weeks rather than months, so academy administrators and business teams can test and refine workflows early.",
      },
      {
        number: "03",
        title: "Long-Term Support",
        description:
          "Direct, ongoing communication with the engineers who built your platform for maintenance, compliance rule adjustments, and feature additions.", // VERIFY: ongoing maintenance support
      },
    ],
  },
  services: [
    {
      id: "website-development",
      number: "01",
      name: "Website Development",
      description:
        "Fast, responsive websites built with modern web frameworks to present your business clearly and convert visitors into enquiries.",
      highlights: ["Next.js & TypeScript", "Search Optimization", "Mobile-first Layout", "Fast Page Speeds"],
      linkUrl: "/contact",
      linkText: "Discuss a Website",
    },
    {
      id: "interactive-3d",
      number: "02",
      name: "Interactive 3D Websites",
      description:
        "Engaging 3D and motion-driven web experiences that showcase high-value products and modern brands without sacrificing load time.",
      highlights: ["WebGL & Three.js", "Smooth GSAP Motion", "Hardware-optimized", "Immersive Visuals"],
      linkUrl: "/projects#interactive-websites",
      linkText: "View Interactive Sites",
    },
    {
      id: "custom-software",
      number: "03",
      name: "Custom Software & Web Apps",
      description:
        "Tailored web applications built around your exact operational workflows, team roles, and internal business rules.",
      highlights: ["Role-based Access", "Secure APIs", "Operational Portals", "Custom Dashboards"],
      linkUrl: "/projects#zyops",
      linkText: "Explore Custom Systems",
    },
    {
      id: "business-automation",
      number: "04",
      name: "Business Automation",
      description:
        "Practical automation pipelines that connect internal tools, reduce manual data entry, and speed up turnaround times.",
      highlights: ["System Integration", "Notification Pipelines", "Reduced Data Entry", "Audit Logging"],
      linkUrl: "/projects#goalflow",
      linkText: "See Automation Tools",
    },
    {
      id: "exam-admissions",
      number: "05",
      name: "Exam Portals & Admissions Systems",
      description:
        "Online test-prep and student intake platforms configured to follow regulatory exam patterns and institutional admissions steps.", // VERIFY: Pilot mock exam portals and academy admissions deployments
      highlights: ["Regulatory Exam Patterns", "Timed Simulations", "Enquiry Pipeline", "Student Performance Logs"],
      linkUrl: "/aviation-academy-software",
      linkText: "View Aviation & Exam Systems",
    },
    {
      id: "erp-finance",
      number: "06",
      name: "ERP, Finance & Fee Management",
      description:
        "Centralized systems for fee collection, student billing, quotation generation, inventory sync, and GST-ready invoicing.", // VERIFY: Academy fee collection and quotation system implementation
      highlights: ["Student Fee Ledgers", "GST Invoicing", "Stock & Inventory", "Audit Trail"],
      linkUrl: "/aviation-academy-software",
      linkText: "View Fee & ERP Modules",
    },
  ],
  projectGroups: {
    aviation: {
      title: "For Aviation Academies and Institutes",
      subtitle: "Dedicated testing engines, fee management, student pipelines, and multi-branch operations.",
    },
    business: {
      title: "For Businesses",
      subtitle: "Operations software, task execution, invoicing systems, batch tracking, and interactive web presences.",
    },
  },
  projects: [
    {
      id: "exam-portals",
      name: "Exam Portals",
      tagline: "Mock exam and test-prep engine for pilot-licence training", // VERIFY: Configured for pilot mock exams at an aviation academy client
      group: "aviation",
      badge: "Aviation Academy",
      features: [
        "syllabus mapping per authority",
        "timed simulation",
        "negative marking",
        "instant analytics",
      ],
    },
    {
      id: "finance-fee",
      name: "Finance & Fee System",
      tagline: "Fees, quotations, invoices, payslips and student billing for academies", // VERIFY: Implemented student fee management for an aviation academy client
      group: "aviation",
      badge: "Aviation Academy",
      features: ["ledger", "invoicing", "audit trail"],
    },
    {
      id: "admissions",
      name: "Admissions System",
      tagline: "Enquiry-to-enrolment tracking for institutes", // VERIFY: Deployed for enquiry and enrolment pipeline tracking
      group: "aviation",
      badge: "Academy & Institute",
      features: ["applications", "status pipeline", "reports"],
    },
    {
      id: "erp-platform",
      name: "ERP Platform",
      tagline: "One system for sales, stock and accounts",
      group: "aviation",
      badge: "Institute ERP",
      features: ["multi-unit", "roles", "inventory sync"],
    },
    {
      id: "raise-lab-equipment",
      name: "Raise Lab Equipment", // VERIFY
      tagline: "Website and quotation system for a pharmaceutical laboratory equipment manufacturer", // VERIFY
      group: "business",
      badge: "Pharma",
      href: "",
      features: [
        "Company website", // VERIFY
        "Product enquiries", // VERIFY
        "Quotation system", // VERIFY
      ],
    },
    {
      id: "zyops",
      name: "ZyOps",
      tagline: "Sales and operations management",
      group: "business",
      badge: "Operations Tool",
      features: ["invoices", "work-in-progress board", "quotations", "accounts"],
    },
    {
      id: "goalflow",
      name: "GoalFlow",
      tagline: "Milestone and team execution tracking",
      group: "business",
      badge: "Team Execution",
      features: ["goals", "progress analytics", "tasks"],
    },
    {
      id: "quotation-invoice",
      name: "Quotation & Invoice Generator",
      tagline: "GST-ready quotes and invoices for SMEs",
      group: "business",
      badge: "Billing System",
      features: ["PDF", "tax calculation", "follow-ups"],
    },
    {
      id: "production-management",
      name: "Production Management",
      tagline: "Batch tracking and raw-material control for pharma and chemical manufacturing", // VERIFY: Configured with batch deduction and FEFO logic for small pharma manufacturing
      group: "business",
      badge: "Manufacturing ERP",
      features: ["batch deduction", "FEFO", "audit trail", "low-stock alerts"],
    },
    {
      id: "interactive-websites",
      name: "Interactive Websites",
      tagline: "High-performance Next.js sites with 3D and motion",
      group: "business",
      badge: "Web presences",
      features: ["fast loading", "SEO-first"],
    },
  ],
  regulators: {
    list: [
      { name: "DGCA", region: "India" },
      { name: "FAA", region: "USA" },
      { name: "EASA", region: "Europe" },
    ],
    note: "Configured to follow the exam pattern and rules of DGCA (India), FAA (USA), EASA (Europe), and other authorities on request.", // VERIFY: Exam portal rule sets configurable per authority
  },
  aviation: {
    badge: "Specialized Aviation Academy Software",
    headline: "Aviation Academy Software",
    subHeadline: "Exam Portals, Student Fee Management, Admissions & ERP",
    pitch:
      "A complete digital system engineered specifically for pilot training institutes and aviation academies. From test simulations configured to match authority syllabi to student fee schedules, admissions pipelines, and multi-branch operations, our software is designed around real academy workflows.",
    modulesTitle: "Four Core Modules",
    modulesSubtitle: "Modular software components deployed individually or integrated as a single academy platform.",
    modules: [
      {
        id: "exam-portal",
        title: "Exam Portal",
        subtitle: "Mock Exam & Test-Prep Engine",
        description:
          "Online test engine configured for pilot-licence ground training. Features timed test simulations, authority syllabus mapping, customizable question pools, and instant performance diagnostics.", // VERIFY: Exam portal deployed for an aviation academy client
        features: [
          "Syllabus mapping per subject",
          "Timed test simulation",
          "Configurable negative marking",
          "Subject-wise analytics & review",
        ],
      },
      {
        id: "finance-fee",
        title: "Finance & Fee System",
        subtitle: "Academy Billing & Ledger",
        description:
          "End-to-end fee accounting designed for student payment cycles, flight training quotation generation, instalment receipts, and staff payslips.", // VERIFY: Fee system deployed for student accounts at an aviation academy client
        features: [
          "Student fee ledgers & instalments",
          "GST-ready invoice generation",
          "Payment receipts & follow-ups",
          "Complete administrative audit trail",
        ],
      },
      {
        id: "admissions",
        title: "Admissions System",
        subtitle: "Enquiry-to-Enrolment Pipeline",
        description:
          "Structured pipeline managing inbound student enquiries from website visit to document verification, assessment scheduling, and final batch allocation.", // VERIFY: Admissions workflow deployed for enquiry tracking
        features: [
          "Online application intake",
          "Status pipeline & stage tracking",
          "Document uploads & verification",
          "Conversion & intake reports",
        ],
      },
      {
        id: "erp",
        title: "ERP Platform",
        subtitle: "Unified Academy Operations",
        description:
          "A centralized operations platform uniting student databases, staff records, flying logs, resource allocation, and multi-branch management into one dashboard.",
        features: [
          "Role-based staff permissions",
          "Batch & student scheduling",
          "Inventory & equipment tracking",
          "Multi-centre data synchronization",
        ],
      },
    ],
    authoritiesTitle: "Built for Each Authority's Rules",
    authoritiesSubtitle:
      "Configured to follow the exam pattern and rules of DGCA (India), FAA (USA), and EASA (Europe). Other authorities on request.",
    authorities: [
      {
        code: "DGCA",
        name: "Directorate General of Civil Aviation",
        region: "India",
        questionTypes: [
          "Multiple Choice Questions (4 options)",
          "Numerical and calculation-based problems",
          "Scenario-oriented operational questions",
        ],
        subjects: [
          "Air Navigation",
          "Aviation Meteorology",
          "Air Regulations",
          "Technical General",
          "Technical Specific",
          "Radio Telephony (Part 1 & 2 theory)",
        ],
        negativeMarking: "Configurable per authority test standards (e.g. 0.25 penalty or zero penalty)",
        timerPassing: "Timed section timers with 70% passing benchmark",
      },
      {
        code: "FAA",
        name: "Federal Aviation Administration",
        region: "USA",
        questionTypes: [
          "Airman Knowledge Test structure",
          "Multiple Choice (3 options standard)",
          "Figure, chart, and legend reference items",
        ],
        subjects: [
          "Navigation & Flight Planning",
          "Aviation Weather Reports & Forecasts",
          "Federal Aviation Regulations (FARs)",
          "Aerodynamics, Engines & Systems",
        ],
        negativeMarking: "Zero negative marking per standard FAA testing format",
        timerPassing: "Per-subject test timers with 70% passing threshold",
      },
      {
        code: "EASA",
        name: "European Union Aviation Safety Agency",
        region: "Europe",
        questionTypes: [
          "ECQB-style question format",
          "Multiple Choice Questions",
          "Annex, chart, and flight planning interpretation",
        ],
        subjects: [
          "General Navigation & Radio Navigation",
          "Meteorology",
          "Air Law & ATC Procedures",
          "Aircraft General Knowledge",
          "Flight Performance & Planning",
        ],
        negativeMarking: "No negative marking per standard EASA ECQB regulations",
        timerPassing: "Strict per-subject countdown timers with 75% passing mark",
      },
    ],
    regulatorNote:
      "Configured to follow the exam pattern and rules of DGCA (India), FAA (USA), EASA (Europe). Other authorities on request.", // VERIFY: Regulatory pattern configuration
    otherInstitutes: {
      title: "Adapted for Other Educational Institutes",
      description:
        "The same reliable software architecture powers digital operations for schools, undergraduate colleges, professional coaching centres, and competitive exam academies.",
      types: [
        "Schools & Junior Colleges (Student Fee Schedules, Admissions, Notices)",
        "Competitive Exam Coaching Centres (Mock Test Engines, Timers, Negative Marking)",
        "Professional Training Institutes (Course Enrolment, Batch Scheduling, Invoicing)",
        "Corporate & Technical Academies (Skill Assessments, Progress Analytics, Certifications)",
      ],
    },
    cta: {
      heading: "Ready to Upgrade Your Academy's Software?",
      description:
        "Speak directly with our engineering team in Hyderabad. We will walk you through live demos of our pilot exam engine, student fee system, and admissions workflows.",
      buttonText: "Schedule a Consultation",
    },
    faqs: [
      {
        question: "Can the mock exam engine be configured for DGCA, FAA, or EASA exams?",
        answer:
          "Yes. The exam portal allows academy administrators to configure subject categories, question counts, timers, passing percentages, and negative marking rules to follow the syllabus pattern of DGCA (India), FAA (USA), EASA (Europe), or custom authority formats.",
      },
      {
        question: "How does the fee management system handle aviation academy instalments?",
        answer:
          "The system supports structured payment schedules tailored for pilot training, including multi-stage ground school and flying fee instalments, quotations, GST-ready invoices, receipts, and individual student balance ledgers.",
      },
      {
        question: "Can these systems be used by schools, colleges, or other coaching institutes?",
        answer:
          "Yes. The underlying test-prep, admissions, fee ledger, and operations modules are fully modular and can be adapted for schools, colleges, and competitive coaching centres.",
      },
    ],
  },
  budgetOptions: [
    "Under ₹50,000",
    "₹50,000 to ₹1,50,000",
    "₹1,50,000 to ₹5,00,000",
    "₹5,00,000+",
    "Not sure yet",
  ],
  form: {
    heading: "Start a project",
    subtitle: "Tell us about your requirements and we will schedule an initial consultation.",
    buttonText: "Send message",
    sendingText: "Sending...",
    successMessage: "Thanks, we will reply within one business day.",
    placeholders: {
      name: "Your name",
      email: "Work or personal email",
      phone: "Phone number (optional)",
      organisation: "Organisation or academy name",
      budget: "Estimated budget",
      message: "Tell us about your project, timeline, or key requirements...",
    },
  },
  technology: {
    headline: "HOW WE BUILD",
    subHeadline: "Modern engineering focused on performance, security, and long-term maintainability.",
    cardHeading: "Engineering Standards",
    cardDescription:
      "Every platform we develop is built with proven production technologies. We prioritize clean architectures, structured databases, and mobile-first design so your software remains fast, dependable, and easy to maintain as your business grows.",
    principles: [
      {
        tag: "Framework",
        title: "Next.js & Modern Frontend",
        description:
          "Server-side rendering, static generation, and TypeScript for rapid page loads, search visibility, and predictable behavior.",
      },
      {
        tag: "Speed",
        title: "Performance-First Architecture",
        description:
          "Optimized asset pipelines, lightweight motion components, and clean code paths designed to run smoothly on mobile networks and desktop browsers alike.",
      },
      {
        tag: "Security",
        title: "Security & Data Integrity",
        description:
          "Strict authenticated endpoints, role-based user permissions, relational database integrity with PostgreSQL, and automated backup routines.",
      },
      {
        tag: "Mobile",
        title: "Mobile-First Usability",
        description:
          "Responsive interfaces structured so pilots, students, administrative staff, and managers can complete tasks seamlessly from any smartphone, tablet, or workstation.",
      },
    ],
  },
  solutions: solutionsData,
};
