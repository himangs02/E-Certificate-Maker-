import defaultTemplateUrl from '../assets/geeta_university_blank_template.png';
import ideathonTemplateUrl from '../assets/IDEATHON_page-0001.jpg';

export const DEFAULT_TEMPLATE_URL = defaultTemplateUrl;
export const IDEATHON_TEMPLATE_URL = ideathonTemplateUrl;

/**
 * Pixel-accurate blank base certificate template generator for Geeta University.
 * Uses the authentic high-resolution base template image.
 */
export function drawDefaultTemplate(ctx, width = 1200, height = 1700) {
  const img = new Image();
  img.src = defaultTemplateUrl;
  if (img.complete && img.naturalWidth !== 0) {
    ctx.drawImage(img, 0, 0, width, height);
  } else {
    // Ivory fallback if image is still loading
    ctx.fillStyle = "#FAF8F5";
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Loads the default template image as an HTMLImageElement
 */
export function loadDefaultTemplateImage() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = defaultTemplateUrl;
  });
}

/**
 * Loads the official Ideathon 2026 template image as an HTMLImageElement
 */
export function loadIdeathonTemplateImage() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = ideathonTemplateUrl;
  });
}

/**
 * Creates an Image Data URL or returns the template URL
 */
export function createDefaultTemplateDataUrl() {
  return defaultTemplateUrl;
}

export function createIdeathonTemplateDataUrl() {
  return ideathonTemplateUrl;
}

/**
 * Checks whether the specified department string or faculty user belongs
 * to the Computer Science & Engineering department.
 */
export function isCSEDepartment(deptName, facultyDeptName) {
  const normalize = (str) => (str || '').toLowerCase().trim();
  const d1 = normalize(deptName);
  const d2 = normalize(facultyDeptName);
  const match = (s) => s.includes('computer science') || s.includes('cse') || s.includes('computer engineering');
  return match(d1) || match(d2);
}

