/**
 * Default canvas coordinate and style configurations for certificate overlay text.
 * Base canvas resolution: 1200 x 1700 (A4 portrait standard ratio 1:1.4167)
 * 
 * You can adjust X, Y coordinates, font sizes, font families, and colors here
 * or dynamically inside the app using the Live Coordinate Tuner!
 */

export const CANVAS_DIMENSIONS = {
  width: 1200,
  height: 1700,
};

export const DEFAULT_TEXT_CONFIG = {
  // 1. Introductory Line: "This certificate is proudly presented to"
  introLine: {
    label: "Introductory Line",
    text: "This certificate is proudly presented to",
    x: 600, // Center aligned (1200 / 2)
    y: 620, // Distance from top
    fontSize: 23,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "400",
    fontStyle: "normal",
    color: "#64748B",
    align: "center",
    letterSpacing: 0.5,
  },

  // 2. Recipient Name: Minimalist, authoritative, professional (No curly italics)
  recipientName: {
    label: "Recipient Name",
    x: 600, // Center aligned
    y: 692,
    fontSize: 52,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "700",
    fontStyle: "normal", // Clean, bold, upright sans-serif
    color: "#0F172A", // Deep obsidian slate
    align: "center",
    letterSpacing: 0.5,
  },

  // 3. Designation / Class: "B.A. 2nd Semester" or "Assistant Professor"
  designation: {
    label: "Designation / Class",
    x: 600,
    y: 755,
    fontSize: 24,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontStyle: "normal",
    color: "#475569",
    align: "center",
    letterSpacing: 0.2,
  },

  // 4. Department: "Department of Arts & Humanities" or "School of Management"
  department: {
    label: "Department",
    x: 600,
    y: 810,
    fontSize: 24,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontStyle: "normal",
    color: "#1E293B",
    align: "center",
    letterSpacing: 0.2,
  },

  // 5. Action / Achievement: "for securing 1st Position in Tech Innovation Competition"
  actionAchievement: {
    label: "Action / Achievement Line",
    x: 600,
    y: 875,
    fontSize: 24,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: "500",
    fontStyle: "normal",
    color: "#0F172A",
    align: "center",
    maxWidth: 920,
    lineHeight: 38,
  },

  // 6. Organized By & Date Line: "organized by Department of Creative Arts & Media on September 15, 2026."
  organizedByDate: {
    label: "Organized By & Date",
    x: 600,
    y: 935,
    fontSize: 23,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: "400",
    fontStyle: "normal",
    color: "#475569",
    align: "center",
    maxWidth: 950,
    lineHeight: 38,
  },

  // 7. Appreciation Paragraph: 2-3 lines of text
  appreciationParagraph: {
    label: "Appreciation Paragraph",
    x: 600,
    y: 1030,
    fontSize: 22,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: "400",
    fontStyle: "normal",
    color: "#334155",
    align: "center",
    maxWidth: 940,
    lineHeight: 40, // Balanced multi-line readability
  },

  // 8. Issue Date (Bottom Left): "Date: _______________"
  issueDate: {
    label: "Issue Date (Bottom Left)",
    prefix: "Date: ",
    x: 135, // Left aligned near bottom border
    y: 1475,
    fontSize: 22,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontStyle: "normal",
    color: "#1E293B",
    align: "left",
    underlineLength: 16,
  },

  // 9. Certificate Reference Number (Bottom Left): "No. GU/Pas/..."
  refNumber: {
    label: "Ref Number (Bottom Left)",
    prefix: "No. ",
    x: 135, // Left aligned below Date
    y: 1540,
    fontSize: 22,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontStyle: "normal",
    color: "#1E293B",
    align: "left",
    underlineLength: 14,
  },

  // 10. Security QR Code & Verification Stamp (Top Right)
  qrCode: {
    label: "Security QR Code (Top Right)",
    x: 1035,
    y: 130,
    size: 130, // 130px crisp square on 1200x1700 canvas
    showCode: true,
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    align: "center",
  }
};

export const AVAILABLE_FONTS = [
  { label: "Montserrat (Modern Clean Sans)", value: "'Montserrat', sans-serif" },
  { label: "Plus Jakarta Sans (Crisp Contemporary)", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Inter (Crisp Minimalist Sans)", value: "'Inter', sans-serif" },
  { label: "Outfit (Geometric Minimalist)", value: "'Outfit', sans-serif" },
  { label: "Cormorant Garamond (Refined Academic Serif)", value: "'Cormorant Garamond', serif" },
  { label: "Playfair Display (Formal Display Serif)", value: "'Playfair Display', Georgia, serif" },
  { label: "Merriweather (Classic Serif)", value: "'Merriweather', serif" },
  { label: "Cinzel (Formal Inscription Serif)", value: "'Cinzel', serif" },
];
