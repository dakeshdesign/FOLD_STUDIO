export interface Project {
  id: string;
  number: string;
  title: string;
  category: string;
  year: string;
  client?: string;
  deliverables?: string[];
  summary: string;
  challenge?: string;
  solution?: string;
  heroImage: string;
  galleryImages?: string[];
  accentColor?: string;
  featured?: boolean;
  link?: string;
  metrics?: { label: string; value: string }[];
}

/**
 * ============================================================================
 * FOLD STUDIO — PROJECT PORTFOLIO DATA
 * ============================================================================
 *
 * All previous demo case studies have been removed.
 * Currently this array is empty ([]) to display the clean editorial empty state:
 * "NEW WORK COMING SOON."
 *
 * ----------------------------------------------------------------------------
 * HOW TO ADD YOUR OWN PROJECTS LATER:
 * ----------------------------------------------------------------------------
 * 1. Add your project images (hero, mockups, screenshots) into `/public/images/`
 *    or use external image URLs.
 * 2. Add an object to the `PROJECTS_DATA` array below following the template:
 *
 * export const PROJECTS_DATA: Project[] = [
 *   {
 *     id: "client-project-name",                      // Unique slug (e.g., "acme-rebrand")
 *     number: "01",                                   // Display number ("01", "02", etc.)
 *     title: "PROJECT TITLE",                         // Project / client name
 *     category: "Website Design / Brand Identity",    // Discipline / Scope
 *     year: "2026",                                   // Launch or completion year
 *     client: "Client Name",                          // Client / Company name
 *     deliverables: [                                 // Array of deliverables
 *       "Brand Identity",
 *       "Website Design",
 *       "Creative Direction"
 *     ],
 *     summary: "A concise 1-2 sentence overview of the project and impact.",
 *     challenge: "Context and design challenges faced.",
 *     solution: "How FOLD designed and delivered the creative solution.",
 *     heroImage: "/images/your-project-hero.jpg",     // Main visual (local or URL)
 *     galleryImages: [                                // Additional gallery visuals
 *       "/images/your-project-1.jpg",
 *       "/images/your-project-2.jpg"
 *     ],
 *     link: "https://example.com",                    // Optional live website link
 *     featured: true,                                 // Highlight on homepage
 *     metrics: [                                      // Optional key outcome metrics
 *       { label: "Deliverable", value: "Flagship Site" },
 *       { label: "Status", value: "Completed 2026" }
 *     ]
 *   }
 * ];
 */

export const PROJECTS_DATA: Project[] = [];
