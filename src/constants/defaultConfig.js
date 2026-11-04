/**
 * Default canvas coordinate and style configurations for certificate overlay text.
 * Base canvas resolution: 1700 x 1200 (A4 landscape standard ratio 1.4167:1)
 * 
 * You can adjust X, Y coordinates, font sizes, font families, and colors here
 * or dynamically inside the app using the Live Coordinate Tuner!
 */

export const CANVAS_DIMENSIONS = {
  width: 1700,
  height: 1200,
};

export const IDEATHON_DIMENSIONS = {
  width: 3660,
  height: 2481,
};

export const DEFAULT_TEXT_CONFIG = {
  // 1. Introductory Line: "This certificate is proudly presented to"
  introLine: {
    label: "Introductory Line",
    text: "This certificate is proudly presented to",
    x: 850, // Center aligned (1700 / 2)
    y: 410, // Positioned cleanly below header
    fontSize: 24,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "400",
    fontStyle: "normal",
    color: "#64748B",
    align: "center",
    letterSpacing: 0.5,
  },

  // 2. Recipient Name: Minimalist, authoritative, professional
  recipientName: {
    label: "Recipient Name",
    x: 850, // Center aligned
    y: 490,
    fontSize: 54,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "700",
    fontStyle: "normal",
    color: "#0F172A", // Deep obsidian slate
    align: "center",
    letterSpacing: 0.5,
  },

  // 3. Designation / Class: "B.A. 2nd Semester" or "Assistant Professor"
  designation: {
    label: "Designation / Class",
    x: 850,
    y: 560,
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
    x: 850,
    y: 615,
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
    x: 850,
    y: 685,
    fontSize: 24,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: "500",
    fontStyle: "normal",
    color: "#0F172A",
    align: "center",
    maxWidth: 1300,
    lineHeight: 38,
  },

  // 6. Organized By & Date Line: "organized by Department of Creative Arts & Media on September 15, 2026."
  organizedByDate: {
    label: "Organized By & Date",
    x: 850,
    y: 755,
    fontSize: 23,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: "400",
    fontStyle: "normal",
    color: "#475569",
    align: "center",
    maxWidth: 1350,
    lineHeight: 38,
  },

  // 7. Appreciation Paragraph: 2-3 lines of text
  appreciationParagraph: {
    label: "Appreciation Paragraph",
    x: 850,
    y: 850,
    fontSize: 21,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: "400",
    fontStyle: "normal",
    color: "#334155",
    align: "center",
    maxWidth: 1300,
    lineHeight: 38,
  },

  // 8. Issue Date (Bottom Left): "Date: _______________"
  issueDate: {
    label: "Issue Date (Bottom Left)",
    prefix: "Date: ",
    x: 160, // Left aligned near bottom border
    y: 1040,
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
    x: 160, // Left aligned below Date
    y: 1095,
    fontSize: 22,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontStyle: "normal",
    color: "#1E293B",
    align: "left",
    underlineLength: 14,
  },

  // 10. Security QR Code & Verification Stamp (Bottom Right)
  qrCode: {
    label: "Security QR Code (Bottom Right)",
    x: 1540,
    y: 980,
    size: 130, // 130px square on 1700x1200 canvas
    showCode: true,
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    align: "center",
  }
};

export const IDEATHON_TEXT_CONFIG = {
  isIdeathon: true,
  // 1. Recipient / Student Name: Positioned directly on the line under "This is to certify that"
  recipientName: {
    label: "Student Name",
    x: 1718, // Center of line (runs from x=726 to x=2703, midpoint = 1714.5)
    y: 1475, // Positioned on line (y=1548) with descenders clearing
    fontSize: 78,
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "700",
    fontStyle: "normal",
    color: "#0F172A",
    align: "center",
    letterSpacing: 0.5,
    maxWidth: 1900,
  },

  // 2. Security QR Code (Optional, positioned in top-right corner dot grid)
  qrCode: {
    label: "Security QR Code (Top Right)",
    x: 3450,
    y: 180,
    size: 150,
    showCode: true,
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    align: "center",
    enabled: false, // Disabled by default to keep the official Ideathon artwork pristine
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
