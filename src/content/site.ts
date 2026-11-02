export interface NavItem {
  name: string;
  path: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
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
}

export interface ProjectItem {
  id: string;
  name: string;
  tagline: string;
  features: string[];
}

export interface RegulatorItem {
  name: string;
  region: string;
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
  regulators: {
    list: RegulatorItem[];
    note: string;
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
    stack: {
      title: string;
      description: string;
    }[];
  };
}

export const siteContent: SiteContent = {
  brand: {
    name: "ZYXEN",
    tagline: "Intelligence Meets Elegance",
    location: "Hyderabad, Telangana, India",
  },
  contact: {
    email: "contact@zyxen.in",
    phone: "+91 70135 58465",
    address: "Hyderabad, Telangana, India",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    brandLine: "Intelligence Meets Elegance",
  },
  navItems: [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Tech", path: "/technology" },
    { name: "Projects", path: "/projects" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ],
  home: {
    hero: {
      // H1 kept exactly as required
      headline: "ENGINEERING EXPERIENCES.",
      subHeadline:
        "Software for aviation academies and growing businesses: exam portals, fee and finance systems, admissions, ERP and high-performance websites.",
      primaryCta: "Start a project",
      secondaryCta: "Browse Portfolio",
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
    tag: "About Zyxen",
    headline: "ENGINEERING WITH PURPOSE.",
    intro:
      "A Hyderabad web and software agency designing focused systems for aviation training academies, growing manufacturers, and modern businesses.",
    storyTitle: "Why We Started Zyxen",
    storyBody:
      "ZYXEN was started in Hyderabad out of a clear realization: specialized institutes and growing businesses are frequently forced to choose between rigid off-the-shelf software and bloated custom systems that never quite fit. We build focused software that handles everyday operations—from pilot mock tests and student fee schedules to production tracking—with precision and clean interfaces.", // VERIFY: Origin story and scope of work in Hyderabad
    quote: "Reliability is the foundation, but clarity of use is the standard.",
    pillarsTitle: "How We Build",
    pillars: [
      {
        number: "01",
        title: "Workflow Accuracy",
        description:
          "Software structured around actual daily routines, compliance checklists, and verified business rules rather than generic templates.",
      },
      {
        number: "02",
        title: "Performance & Clarity",
        description:
          "Clean, fast-loading interfaces designed so staff, students, and customers can complete tasks without training delays.",
      },
      {
        number: "03",
        title: "Direct Support",
        description:
          "Direct communication with the engineers building your platform, ensuring swift adjustments as your team scales.",
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
    },
    {
      id: "interactive-3d",
      number: "02",
      name: "Interactive 3D Websites",
      description:
        "Engaging 3D and motion-driven web experiences that showcase high-value products and modern brands without sacrificing load time.",
      highlights: ["WebGL & Three.js", "Smooth GSAP Motion", "Hardware-optimized", "Immersive Visuals"],
    },
    {
      id: "custom-software",
      number: "03",
      name: "Custom Software & Web Apps",
      description:
        "Tailored web applications built around your exact operational workflows, team roles, and internal business rules.",
      highlights: ["Role-based Access", "Secure APIs", "Operational Portals", "Custom Dashboards"],
    },
    {
      id: "business-automation",
      number: "04",
      name: "Business Automation",
      description:
        "Practical automation pipelines that connect internal tools, reduce manual data entry, and speed up turnaround times.",
      highlights: ["System Integration", "Notification Pipelines", "Reduced Data Entry", "Audit Logging"],
    },
    {
      id: "exam-admissions",
      number: "05",
      name: "Exam Portals & Admissions Systems",
      description:
        "Online test-prep and student intake platforms configured to follow regulatory exam patterns and institutional admissions steps.", // VERIFY: Configured for pilot mock exams and academy admissions
      highlights: ["Regulatory Exam Patterns", "Timed Simulations", "Enquiry Pipeline", "Student Performance Logs"],
    },
    {
      id: "erp-finance",
      number: "06",
      name: "ERP, Finance & Fee Management",
      description:
        "Centralized systems for fee collection, student billing, quotation generation, inventory sync, and GST-ready invoicing.", // VERIFY: Fee collection and quotation system implementation
      highlights: ["Student Fee Ledgers", "GST Invoicing", "Stock & Inventory", "Audit Trail"],
    },
  ],
  projects: [
    {
      id: "exam-portals",
      name: "Exam Portals",
      tagline: "Mock exam and test-prep engine for pilot-licence training", // VERIFY: Configured to follow syllabus mapping and negative marking rules for an aviation academy client
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
      features: ["ledger", "invoicing", "audit trail"],
    },
    {
      id: "admissions",
      name: "Admissions System",
      tagline: "Enquiry-to-enrolment tracking for institutes", // VERIFY: Deployed for enquiry and enrolment pipeline tracking
      features: ["applications", "status pipeline", "reports"],
    },
    {
      id: "erp-platform",
      name: "ERP Platform",
      tagline: "One system for sales, stock and accounts",
      features: ["multi-unit", "roles", "inventory sync"],
    },
    {
      id: "zyops",
      name: "ZyOps",
      tagline: "Sales and operations management",
      features: ["invoices", "work-in-progress board", "quotations", "accounts"],
    },
    {
      id: "goalflow",
      name: "GoalFlow",
      tagline: "Milestone and team execution tracking",
      features: ["goals", "progress analytics", "tasks"],
    },
    {
      id: "quotation-invoice",
      name: "Quotation & Invoice Generator",
      tagline: "GST-ready quotes and invoices for SMEs",
      features: ["PDF", "tax calculation", "follow-ups"],
    },
    {
      id: "production-management",
      name: "Production Management",
      tagline: "Batch tracking and raw-material control for pharma and chemical manufacturing", // VERIFY: Configured with batch deduction and FEFO logic for small pharma manufacturing
      features: ["batch deduction", "FEFO", "audit trail", "low-stock alerts"],
    },
    {
      id: "interactive-websites",
      name: "Interactive Websites",
      tagline: "High-performance Next.js sites with 3D and motion",
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
    headline: "THE ENGINE",
    subHeadline: "Built with modern, production-tested software standards.",
    cardHeading: "Engineering Principles",
    cardDescription:
      "We build with Next.js, TypeScript, PostgreSQL, and reliable cloud infrastructure. Every platform is designed for predictable uptime, fast response times, and clear data models rather than fragile experimental setups.",
    stack: [
      {
        title: "Frontend & Interfaces",
        description: "Next.js App Router, React 19, TypeScript, Tailwind CSS, and WebGL/Three.js.",
      },
      {
        title: "Backend & Systems",
        description: "Node.js, structured relational databases, authenticated REST APIs, and role-based access.",
      },
      {
        title: "Reliability & Hosting",
        description: "Cloud edge deployment, automated builds, SSL by default, and continuous monitoring.",
      },
    ],
  },
};
