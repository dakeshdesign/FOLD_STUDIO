export interface ServiceItem {
  id: string;
  number: string;
  name: string;
  shortDescription: string;
  startingPrice: string;
  priceNote?: string;
  timeline?: string;
  included: string[];
  deliverables: string[];
  process: string[];
}

export interface ServiceCategory {
  number: string;
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  services: ServiceItem[];
}

export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  priceTag: string;
  includes: string[];
}

export const SERVICES_CATALOGUE: ServiceCategory[] = [
  {
    number: "01",
    id: "design",
    title: "DESIGN SERVICES",
    shortLabel: "DESIGN",
    description: "Precision visual discipline across logos, posters, web, invitations, and custom graphic assets.",
    services: [
      {
        id: "logo-design",
        number: "01",
        name: "LOGO DESIGN",
        shortDescription: "A distinctive visual mark designed to give your brand a clear, memorable identity.",
        startingPrice: "STARTING FROM ₹4,000",
        timeline: "3–5 Days",
        included: [
          "01 — Creative direction & moodboarding",
          "02 — Initial logotype concept explorations",
          "03 — Concept refinement & typography pairing",
          "04 — Final production file package"
        ],
        deliverables: ["SVG (Vector)", "PNG (Transparent)", "PDF (Print)", "JPG (Preview)"],
        process: ["01 THINK — Strategy & visual reference", "02 SHAPE — Vector exploration", "03 MAKE — Refinement", "04 DELIVER — Production files"]
      },
      {
        id: "poster-design",
        number: "02",
        name: "POSTER DESIGN",
        shortDescription: "Art-directed visual communication for campaigns, announcements and cultural events.",
        startingPrice: "STARTING FROM ₹1,500",
        timeline: "2–3 Days",
        included: [
          "01 — Concept moodboarding & hierarchy",
          "02 — High-contrast layout & typography",
          "03 — Print & digital display preparation"
        ],
        deliverables: ["PDF Vector Print Ready", "High-Res PNG / JPG"],
        process: ["01 THINK — Content brief", "02 SHAPE — Layout composition", "03 DELIVER — Master files"]
      },
      {
        id: "banner-design",
        number: "03",
        name: "BANNER DESIGN",
        shortDescription: "High-impact digital and physical banners tailored for events, websites, and displays.",
        startingPrice: "STARTING FROM ₹2,000",
        timeline: "2–4 Days",
        included: [
          "01 — Format & ratio composition",
          "02 — Visual hierarchy & callout framing",
          "03 — Export in required resolution formats"
        ],
        deliverables: ["SVG", "PDF Print", "Digital Web PNG"],
        process: ["01 THINK — Dimension audit", "02 SHAPE — Graphic staging", "03 DELIVER — Final assets"]
      },
      {
        id: "website-design",
        number: "04",
        name: "WEBSITE DESIGN",
        shortDescription: "A complete bespoke digital experience designed around your brand and target audience.",
        startingPrice: "STARTING FROM ₹15,000",
        priceNote: "PROJECT BASED / CONFIRMED FOLD PRICE",
        timeline: "10–20 Days",
        included: [
          "01 — UI/UX Wireframing & Information Architecture",
          "02 — Custom Desktop & Mobile Art Direction",
          "03 — Interactive Micro-Animations & Motion Design",
          "04 — Production Development & SEO Staging"
        ],
        deliverables: ["Figma Master File", "Production Web Code", "Responsive Assets"],
        process: ["01 THINK — Discovery", "02 SHAPE — Wireframes", "03 MAKE — Design & Build", "04 DELIVER — Launch"]
      },
      {
        id: "instagram-post-design",
        number: "05",
        name: "INSTAGRAM POST DESIGN",
        shortDescription: "Editorial feed graphic assets designed for brand consistency and audience retention.",
        startingPrice: "STARTING FROM ₹800",
        timeline: "1–2 Days",
        included: [
          "01 — Visual composition & color staging",
          "02 — Editorial typography layout",
          "03 — Feed grid optimization"
        ],
        deliverables: ["1080x1080 / 1080x1350 PNG", "Master Source File"],
        process: ["01 SHAPE — Post composition", "02 DELIVER — Export"]
      },
      {
        id: "instagram-story-design",
        number: "06",
        name: "INSTAGRAM STORY DESIGN",
        shortDescription: "Kinetic vertical story templates and campaign announcements built for mobile engagement.",
        startingPrice: "STARTING FROM ₹500",
        timeline: "1–2 Days",
        included: [
          "01 — Vertical 9:16 layout staging",
          "02 — Typography & asset layout",
          "03 — Interactive sticker areas"
        ],
        deliverables: ["1080x1920 PNG / JPG"],
        process: ["01 SHAPE — Vertical layout", "02 DELIVER — Export"]
      },
      {
        id: "app-banner-design",
        number: "07",
        name: "APP BANNER / DIGITAL BANNER",
        shortDescription: "Precision web & mobile app promotional banners engineered for high conversion clicks.",
        startingPrice: "STARTING FROM ₹1,200",
        timeline: "2 Days",
        included: [
          "01 — Platform-specific scaling",
          "02 — Call-to-action visual framing"
        ],
        deliverables: ["Multi-ratio PNG", "Figma Asset"],
        process: ["01 SHAPE — Layout", "02 DELIVER — Export"]
      },
      {
        id: "invitation-design",
        number: "08",
        name: "INVITATION DESIGN",
        shortDescription: "Bespoke print and digital invitations for exclusive product launches, galas, and private events.",
        startingPrice: "STARTING FROM ₹2,500",
        timeline: "3 Days",
        included: [
          "01 — Custom typography & motif design",
          "02 — Print & paper finish specification"
        ],
        deliverables: ["PDF Vector Print", "Digital Pass PNG"],
        process: ["01 THINK — Motif concept", "02 SHAPE — Typography", "03 DELIVER — Print files"]
      },
      {
        id: "animated-invitations",
        number: "09",
        name: "ANIMATED INVITATIONS",
        shortDescription: "Kinetic motion invitations featuring custom sound staging and fluid video transitions.",
        startingPrice: "STARTING FROM ₹4,000",
        timeline: "3–5 Days",
        included: [
          "01 — Motion storyboard",
          "02 — Typography animation & audio sync"
        ],
        deliverables: ["MP4 (4K)", "GIF"],
        process: ["01 SHAPE — Storyboard", "02 MAKE — Motion sync", "03 DELIVER — Video file"]
      },
      {
        id: "custom-design-work",
        number: "10",
        name: "CUSTOM DESIGN WORK",
        shortDescription: "Tailored creative requests, exhibition graphics, and specialized visual assets.",
        startingPrice: "CUSTOM QUOTE",
        timeline: "Scope Dependent",
        included: [
          "01 — Custom brief alignment",
          "02 — Dedicated art direction & asset delivery"
        ],
        deliverables: ["Bespoke Asset Package"],
        process: ["01 ALIGN — Brief review", "02 CREATE — Execution", "03 DELIVER — Hand-off"]
      }
    ]
  },
  {
    number: "02",
    id: "branding",
    title: "BRANDING & IDENTITY",
    shortLabel: "BRANDING",
    description: "End-to-end visual identity architecture built for brands with cultural ambitions.",
    services: [
      {
        id: "brand-identity",
        number: "01",
        name: "BRAND IDENTITY SYSTEM",
        shortDescription: "Comprehensive visual foundation including strategy, logotype, color tokens, and applications.",
        startingPrice: "STARTING FROM ₹10,000",
        priceNote: "PROJECT BASED / MONTHLY PACKAGE",
        timeline: "7–14 Days",
        included: [
          "01 — Strategy & positioning matrix",
          "02 — Primary logo & sub-mark architecture",
          "03 — Color palette & typography hierarchy",
          "04 — Real-world application mockups"
        ],
        deliverables: ["Complete Brand Package", "Figma Design System", "Brand Manual PDF"],
        process: ["01 STRATEGY — Audit & Position", "02 IDENTITY — Mark & Type", "03 SYSTEM — Token Deck", "04 HAND-OFF — Master Kit"]
      },
      {
        id: "logo-system",
        number: "02",
        name: "LOGO SYSTEM",
        shortDescription: "Comprehensive logotype system including primary mark, secondary badge, and sub-branding icons.",
        startingPrice: "STARTING FROM ₹6,000",
        timeline: "4–6 Days",
        included: [
          "01 — Core mark & sub-mark variations",
          "02 — Clear space & colorway specifications"
        ],
        deliverables: ["Master Vector Package (SVG/EPS/PDF/PNG)"],
        process: ["01 CONCEPT — Vector exploration", "02 REFINE — Grid alignment", "03 DELIVER — Master package"]
      },
      {
        id: "visual-direction",
        number: "03",
        name: "VISUAL DIRECTION",
        shortDescription: "Art direction & moodboarding setting the tone for upcoming product launches or rebrands.",
        startingPrice: "STARTING FROM ₹8,000",
        timeline: "5 Days",
        included: [
          "01 — Cultural moodboarding",
          "02 — Color & photography direction",
          "03 — Layout rules & spatial rhythm"
        ],
        deliverables: ["Visual Direction Deck PDF"],
        process: ["01 RESEARCH — Moodboarding", "02 DIRECTION — Art curation", "03 DELIVER — Direction Deck"]
      },
      {
        id: "brand-guidelines",
        number: "04",
        name: "BRAND GUIDELINES",
        shortDescription: "A rigorous brand manual codifying typography rules, grid layouts, logo usage, and color tokens.",
        startingPrice: "STARTING FROM ₹7,000",
        timeline: "5–7 Days",
        included: [
          "01 — Specification deck & grid rules",
          "02 — Do's & Don'ts usage guidance",
          "03 — Digital asset kit"
        ],
        deliverables: ["Brand Manual PDF", "Digital Stylekit"],
        process: ["01 DOCUMENT — System rules", "02 FORMAT — Manual deck", "03 DELIVER — PDF Book"]
      },
      {
        id: "social-media-identity",
        number: "05",
        name: "SOCIAL MEDIA IDENTITY",
        shortDescription: "Cohesive visual identity for social platforms including avatars, cover art, and template grids.",
        startingPrice: "STARTING FROM ₹5,000",
        timeline: "3–4 Days",
        included: [
          "01 — Profile kit & banner art",
          "02 — Story & Feed master templates"
        ],
        deliverables: ["Editable Social Kit (Figma/PNG)"],
        process: ["01 SHAPE — Grid templates", "02 DELIVER — Asset Kit"]
      },
      {
        id: "brand-applications",
        number: "06",
        name: "BRAND APPLICATIONS",
        shortDescription: "Custom stationary, business cards, merchandise, and environmental signage design.",
        startingPrice: "STARTING FROM ₹6,000",
        timeline: "4–5 Days",
        included: [
          "01 — Real-world mockup staging",
          "02 — Print specification & finish files"
        ],
        deliverables: ["Print Production Files", "3D Render Previews"],
        process: ["01 STAGE — Application mockups", "02 DELIVER — Print PDF"]
      }
    ]
  },
  {
    number: "03",
    id: "content",
    title: "CONTENT & VIDEO",
    shortLabel: "CONTENT",
    description: "Editorial video editing, promotional reels, short-form motion, and campaign content.",
    services: [
      {
        id: "video-editing",
        number: "01",
        name: "VIDEO EDITING",
        shortDescription: "Paced, color-graded editorial video editing for brand films, interviews, and showcases.",
        startingPrice: "STARTING FROM ₹2,500 / VIDEO",
        timeline: "2–4 Days",
        included: [
          "01 — Assembly & pacing cut",
          "02 — Color grade & sound leveling",
          "03 — Motion titles & graphic overlays"
        ],
        deliverables: ["MP4 (4K / 1080p)", "Master Render"],
        process: ["01 CUT — Rough cut", "02 GRADE — Color & sound", "03 DELIVER — Final render"]
      },
      {
        id: "promotional-videos",
        number: "02",
        name: "PROMOTIONAL VIDEOS",
        shortDescription: "High-octane commercial edits and launch trailers designed to capture immediate attention.",
        startingPrice: "STARTING FROM ₹5,000",
        timeline: "3–5 Days",
        included: [
          "01 — Storyboard & audio direction",
          "02 — Dynamic motion cuts & VFX integration"
        ],
        deliverables: ["Multi-format MP4 (16:9 & 9:16)"],
        process: ["01 CONCEPT — Storyboard", "02 MAKE — Motion edit", "03 DELIVER — Render package"]
      },
      {
        id: "social-media-content",
        number: "03",
        name: "SOCIAL MEDIA CONTENT",
        shortDescription: "Custom visual content packages created for consistent digital presence across platforms.",
        startingPrice: "STARTING FROM ₹3,000",
        timeline: "3 Days",
        included: [
          "01 — Content asset staging",
          "02 — Pacing & graphic overlays"
        ],
        deliverables: ["Multi-Platform Asset Pack"],
        process: ["01 STAGE — Content design", "02 DELIVER — Package"]
      },
      {
        id: "reels-video",
        number: "04",
        name: "REELS & SHORT VIDEO",
        shortDescription: "Vertical short-form motion content engineered for high reach on Instagram & TikTok.",
        startingPrice: "STARTING FROM ₹1,000 / REEL",
        timeline: "1–2 Days",
        included: [
          "01 — Fast-paced vertical editing",
          "02 — Kinetic captions & audio sync"
        ],
        deliverables: ["9:16 Vertical MP4"],
        process: ["01 CUT — Fast edit", "02 DELIVER — Reel MP4"]
      },
      {
        id: "visual-content-system",
        number: "05",
        name: "VISUAL CONTENT SYSTEM",
        shortDescription: "Scalable graphic and motion framework for ongoing brand marketing campaigns.",
        startingPrice: "STARTING FROM ₹6,000",
        timeline: "5 Days",
        included: [
          "01 — Master content templates",
          "02 — Motion graphic assets"
        ],
        deliverables: ["Content Toolkit Deck", "Figma Kit"],
        process: ["01 SYSTEM — Framework design", "02 DELIVER — Master Toolkit"]
      },
      {
        id: "campaign-content",
        number: "06",
        name: "CAMPAIGN CONTENT",
        shortDescription: "Comprehensive multi-channel creative direction and content creation for key brand moments.",
        startingPrice: "STARTING FROM ₹10,000",
        timeline: "7–10 Days",
        included: [
          "01 — Full campaign art direction",
          "02 — Multi-asset production (Posters, Videos, Stories)"
        ],
        deliverables: ["Master Campaign Assets Suite"],
        process: ["01 STRATEGY — Campaign Brief", "02 MAKE — Multi-channel asset build", "03 DELIVER — Full Launch Suite"]
      }
    ]
  },
  {
    number: "04",
    id: "product",
    title: "PRODUCT DESIGN",
    shortLabel: "PRODUCT",
    description: "Packaging architecture, 3D product visuals, launch creatives, and pitch presentations.",
    services: [
      {
        id: "packaging-design",
        number: "01",
        name: "PACKAGING DESIGN",
        shortDescription: "Tactile packaging design tailored for retail shelf presence and unboxing experience.",
        startingPrice: "STARTING FROM ₹8,000 / PRODUCT",
        timeline: "5–8 Days",
        included: [
          "01 — Dieline layout & structural mockup",
          "02 — Material & finish specifications (foil, emboss)"
        ],
        deliverables: ["Vector Dieline PDF", "3D Render Mockups"],
        process: ["01 DIELINE — Layout prep", "02 DESIGN — Artwork staging", "03 DELIVER — Print files"]
      },
      {
        id: "product-visuals",
        number: "02",
        name: "PRODUCT VISUALS",
        shortDescription: "High-resolution 3D renders and graphic compositions showcasing products in luxury environments.",
        startingPrice: "STARTING FROM ₹5,000",
        timeline: "3–5 Days",
        included: [
          "01 — Lighting & studio environment setup",
          "02 — Texture & material staging"
        ],
        deliverables: ["4K Render Images"],
        process: ["01 RENDER — Studio setup", "02 POST — Grading", "03 DELIVER — 4K Images"]
      },
      {
        id: "product-launch-creatives",
        number: "03",
        name: "PRODUCT LAUNCH CREATIVES",
        shortDescription: "Full visual suite for new product unveilings including digital teasers, banners, and announcement assets.",
        startingPrice: "STARTING FROM ₹7,000",
        timeline: "4–6 Days",
        included: [
          "01 — Teaser campaign assets",
          "02 — Unveiling graphics & story templates"
        ],
        deliverables: ["Launch Asset Suite"],
        process: ["01 CAMPAIGN — Unveiling strategy", "02 MAKE — Asset build", "03 DELIVER — Launch Pack"]
      },
      {
        id: "product-presentation",
        number: "04",
        name: "PRODUCT PRESENTATION",
        shortDescription: "Editorial slide decks and buyer pitch books designed to showcase products to investors and retailers.",
        startingPrice: "STARTING FROM ₹6,000",
        timeline: "4 Days",
        included: [
          "01 — Slide hierarchy & grid design",
          "02 — Product spec staging"
        ],
        deliverables: ["Interactive Pitch PDF"],
        process: ["01 GRID — Slide layout", "02 DELIVER — Interactive PDF"]
      }
    ]
  },
  {
    number: "05",
    id: "social",
    title: "SOCIAL MEDIA",
    shortLabel: "SOCIAL",
    description: "Instagram management, content planning, template systems, reels direction, and monthly retainers.",
    services: [
      {
        id: "instagram-management",
        number: "01",
        name: "INSTAGRAM MANAGEMENT",
        shortDescription: "End-to-end creative direction, grid curation, story management, and publishing system.",
        startingPrice: "STARTING FROM ₹10,000 / MONTH",
        priceNote: "MONTHLY RETAINER",
        timeline: "Ongoing Retainer",
        included: [
          "01 — Monthly content calendar",
          "02 — Post & story design execution",
          "03 — Feed curation & publishing scheduling"
        ],
        deliverables: ["Monthly Content Delivery & Management"],
        process: ["01 PLAN — Monthly roadmap", "02 CREATE — Content batch", "03 PUBLISH — Managed feed"]
      },
      {
        id: "content-planning",
        number: "02",
        name: "CONTENT PLANNING",
        shortDescription: "Strategic content pillars, messaging matrix, and monthly publishing roadmap.",
        startingPrice: "STARTING FROM ₹4,000",
        timeline: "3 Days",
        included: [
          "01 — Content pillar strategy",
          "02 — 30-day topic roadmap"
        ],
        deliverables: ["Content Strategy PDF"],
        process: ["01 AUDIT — Channel review", "02 PLAN — Topic roadmap", "03 DELIVER — PDF Strategy"]
      },
      {
        id: "post-story-design-system",
        number: "03",
        name: "POST & STORY DESIGN SYSTEM",
        shortDescription: "Reusable social template suite enabling internal teams to maintain pristine visual quality.",
        startingPrice: "STARTING FROM ₹5,000",
        timeline: "4 Days",
        included: [
          "01 — Master Figma social templates",
          "02 — Typography & color usage guidance"
        ],
        deliverables: ["Figma Template Kit"],
        process: ["01 SYSTEM — Template design", "02 DELIVER — Master Kit"]
      },
      {
        id: "reels-production",
        number: "04",
        name: "REELS DIRECTION & PRODUCTION",
        shortDescription: "Monthly production of high-converting vertical motion reels with custom audio and captions.",
        startingPrice: "STARTING FROM ₹6,000",
        timeline: "Monthly Retainer",
        included: [
          "01 — Scripting & storyboard",
          "02 — Motion editing & captioning"
        ],
        deliverables: ["Weekly / Monthly Reel Deliveries"],
        process: ["01 STORYBOARD — Concept", "02 EDIT — Render cut", "03 DELIVER — Reel files"]
      },
      {
        id: "creative-direction-strategy",
        number: "05",
        name: "CREATIVE DIRECTION & STRATEGY",
        shortDescription: "High-level visual stewardship ensuring brand consistency across all digital touchpoints.",
        startingPrice: "STARTING FROM ₹8,000",
        timeline: "Monthly Advisory",
        included: [
          "01 — Weekly creative review",
          "02 — Asset auditing & guidance"
        ],
        deliverables: ["Strategy Advisory Deck"],
        process: ["01 ADVISE — Weekly review", "02 GUIDANCE — Creative Deck"]
      },
      {
        id: "monthly-content-retainer",
        number: "06",
        name: "MONTHLY CONTENT RETAINER",
        shortDescription: "Comprehensive monthly package covering post design, story assets, reels, and ongoing art direction.",
        startingPrice: "STARTING FROM ₹12,000 / MONTH",
        priceNote: "MONTHLY RETAINER",
        timeline: "Monthly Retainer",
        included: [
          "01 — 12 Posts + 20 Stories + 4 Reels",
          "02 — Full management & feed staging"
        ],
        deliverables: ["Complete Monthly Management"],
        process: ["01 BATCH — Production", "02 STAGE — Feed layout", "03 RUN — Monthly management"]
      }
    ]
  },
  {
    number: "06",
    id: "ai-creative",
    title: "AI CREATIVE",
    shortLabel: "AI CREATIVE",
    description: "AI-generated advertisements, promotional visuals, concepts, and campaign synthesis.",
    services: [
      {
        id: "ai-advertisements",
        number: "01",
        name: "AI-GENERATED ADVERTISEMENTS",
        shortDescription: "Surreal, high-velocity advertisement visuals powered by cutting-edge AI generation & art direction.",
        startingPrice: "STARTING FROM ₹1,000 / REEL",
        timeline: "1–2 Days",
        included: [
          "01 — Prompt engineering & style tuning",
          "02 — Motion staging & audio sync"
        ],
        deliverables: ["High-Res AI Visual / Reel MP4"],
        process: ["01 PROMPT — Concept synthesis", "02 RENDER — Style tuning", "03 DELIVER — Final edit"]
      },
      {
        id: "ai-promotional-visuals",
        number: "02",
        name: "AI PROMOTIONAL VISUALS",
        shortDescription: "Photorealistic or abstract promotional imagery generated for campaigns, posters, and web banners.",
        startingPrice: "STARTING FROM ₹2,500",
        timeline: "2 Days",
        included: [
          "01 — Concept generation",
          "02 — High-resolution upscaling & retouching"
        ],
        deliverables: ["4K Upscaled Visuals"],
        process: ["01 SYNTHESIZE — AI generation", "02 RETOUCH — Upscale", "03 DELIVER — 4K Images"]
      },
      {
        id: "ai-creative-concepts",
        number: "03",
        name: "AI CREATIVE CONCEPTS",
        shortDescription: "Rapid visual concept exploration decks testing bold aesthetic directions before full production.",
        startingPrice: "STARTING FROM ₹3,000",
        timeline: "2–3 Days",
        included: [
          "01 — Multi-concept generation",
          "02 — Curated moodboard deck"
        ],
        deliverables: ["Concept Exploration Deck PDF"],
        process: ["01 EXPLORE — Concept generation", "02 CURATE — Deck compile", "03 DELIVER — PDF Deck"]
      },
      {
        id: "ai-assisted-campaign",
        number: "04",
        name: "AI-ASSISTED CAMPAIGN CONTENT",
        shortDescription: "Multi-channel campaign content combining human art direction with AI image and motion synthesis.",
        startingPrice: "STARTING FROM ₹5,000",
        timeline: "3–5 Days",
        included: [
          "01 — Hybrid AI + Human design workflow",
          "02 — Multi-channel adaptation"
        ],
        deliverables: ["Campaign Asset Suite"],
        process: ["01 DIRECT — Hybrid workflow", "02 PRODUCE — Multi-channel assets", "03 DELIVER — Campaign Suite"]
      }
    ]
  }
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: "brand-starter",
    title: "THE BRAND STARTER",
    description: "Essential branding toolkit for new ventures needing an instant, iconic visual identity.",
    priceTag: "CUSTOM QUOTE",
    includes: [
      "Logo Architecture & Sub-marks",
      "Basic Visual Identity System",
      "Social Profile & Cover Kit",
      "Brand Color & Typography Guide"
    ]
  },
  {
    id: "digital-starter",
    title: "THE DIGITAL STARTER",
    description: "Bespoke digital architecture built for modern web presence and high conversion.",
    priceTag: "CUSTOM QUOTE",
    includes: [
      "Custom Website Design",
      "Mobile Responsive Architecture",
      "Interactive Micro-Animations",
      "Production Deployment & SEO"
    ]
  },
  {
    id: "content-system",
    title: "THE CONTENT SYSTEM",
    description: "Complete monthly visual engine driving audience engagement across platforms.",
    priceTag: "CUSTOM QUOTE",
    includes: [
      "12 Feed Posts + 20 Stories",
      "4 Short Video Reels / Motion Edits",
      "Monthly Content Roadmap",
      "Ongoing Creative Direction"
    ]
  }
];
