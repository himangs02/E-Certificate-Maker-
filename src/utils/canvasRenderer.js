/**
 * Canvas Drawing and Layout Rendering Utilities.
 * Handles high-resolution canvas scaling, wrapped text formatting,
 * and precise coordinate-based element drawing.
 */

/**
 * Splits text into lines based on maximum width on canvas.
 */
export function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + " " + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Draws all variable certificate content onto the given canvas context.
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
 * @param {HTMLImageElement|null} baseImage - Loaded base template image
 * @param {Object} formData - Form input values
 * @param {Object} config - Coordinates, typography & styling config
 * @param {Object} options - Additional rendering options (e.g. showGuides, selectedField)
 */
export function renderCertificate(ctx, baseImage, formData, config, options = {}) {
  const { width, height } = ctx.canvas;
  const { showGuides = false, activeField = null } = options;

  // 1. Clear Canvas
  ctx.clearRect(0, 0, width, height);

  // 2. Draw Base Template Image (or plain background)
  if (baseImage && baseImage.complete && baseImage.naturalWidth !== 0) {
    ctx.drawImage(baseImage, 0, 0, width, height);
  } else {
    ctx.fillStyle = "#FAF8F5";
    ctx.fillRect(0, 0, width, height);
  }

  // 3. Helper to format font string
  const getFontString = (styleObj) => {
    const style = styleObj.fontStyle || "normal";
    const weight = styleObj.fontWeight || "400";
    const size = styleObj.fontSize || 24;
    const family = styleObj.fontFamily || "'Merriweather', serif";
    return `${style} ${weight} ${size}px ${family}`;
  };

  // 4. Helper to draw single line text
  const drawTextItem = (key, text, defaultText = "") => {
    const cfg = config[key];
    if (!cfg) return;

    const content = text !== undefined && text !== null && text !== "" ? text : defaultText;
    if (!content) return;

    ctx.save();
    ctx.font = getFontString(cfg);
    ctx.fillStyle = cfg.color || "#2D3748";
    ctx.textAlign = cfg.align || "center";
    ctx.textBaseline = "middle";
    if ('letterSpacing' in ctx && cfg.letterSpacing) {
      ctx.letterSpacing = `${cfg.letterSpacing}px`;
    }

    let drawX = cfg.x;
    let drawY = cfg.y;

    // Multi-line wrap check if maxWidth is specified
    if (cfg.maxWidth) {
      const lines = wrapText(ctx, content, cfg.maxWidth);
      const lineHeight = cfg.lineHeight || cfg.fontSize * 1.5;
      const totalHeight = (lines.length - 1) * lineHeight;
      const startY = drawY - totalHeight / 2;

      lines.forEach((line, idx) => {
        ctx.fillText(line, drawX, startY + idx * lineHeight);
      });

      // Draw guides if enabled
      if (showGuides) {
        ctx.strokeStyle = activeField === key ? "#3B82F6" : "rgba(234, 88, 12, 0.4)";
        ctx.lineWidth = activeField === key ? 2 : 1;
        ctx.setLineDash(activeField === key ? [] : [4, 4]);
        const boxWidth = cfg.maxWidth;
        const boxLeft = cfg.align === "center" ? drawX - boxWidth / 2 : drawX;
        ctx.strokeRect(boxLeft - 10, startY - cfg.fontSize / 2 - 5, boxWidth + 20, totalHeight + cfg.fontSize + 10);
        
        // Draw coordinate handle
        ctx.fillStyle = activeField === key ? "#2563EB" : "#EA580C";
        ctx.beginPath();
        ctx.arc(drawX, drawY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillText(content, drawX, drawY);

      // Draw guides if enabled
      if (showGuides) {
        const metrics = ctx.measureText(content);
        const textWidth = metrics.width;
        let left = drawX;
        if (cfg.align === "center") left = drawX - textWidth / 2;
        if (cfg.align === "right") left = drawX - textWidth;

        ctx.strokeStyle = activeField === key ? "#3B82F6" : "rgba(234, 88, 12, 0.4)";
        ctx.lineWidth = activeField === key ? 2 : 1;
        ctx.setLineDash(activeField === key ? [] : [4, 4]);
        ctx.strokeRect(left - 8, drawY - cfg.fontSize / 2 - 4, textWidth + 16, cfg.fontSize + 8);

        // Draw coordinate handle
        ctx.fillStyle = activeField === key ? "#2563EB" : "#EA580C";
        ctx.beginPath();
        ctx.arc(drawX, drawY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  // 5. Draw Variable Items
  // Intro Line
  drawTextItem("introLine", config.introLine?.text || "This certificate is proudly presented to");

  // Recipient Name
  drawTextItem("recipientName", formData.recipientName, "Recipient Name");

  // Designation / Class
  drawTextItem("designation", formData.designation, "Designation / Class");

  // Department
  drawTextItem("department", formData.department, "Department");

  // Action / Achievement
  drawTextItem("actionAchievement", formData.actionAchievement, "for actively participating in");

  // Organized By & Date
  drawTextItem("organizedByDate", formData.organizedByDate, "organized by Department on Date.");

  // Appreciation Paragraph
  drawTextItem("appreciationParagraph", formData.appreciationParagraph, "Your dedication and commitment are sincerely appreciated.");

  // Issue Date (Bottom Left)
  if (config.issueDate) {
    const cfg = config.issueDate;
    ctx.save();
    ctx.font = getFontString(cfg);
    ctx.fillStyle = cfg.color || "#1E293B";
    ctx.textAlign = cfg.align || "left";
    ctx.textBaseline = "middle";

    const dateVal = formData.issueDate;
    const dateText = dateVal ? `Date: ${dateVal}` : `Date: __________________`;
    ctx.fillText(dateText, cfg.x, cfg.y);

    if (showGuides) {
      ctx.fillStyle = activeField === "issueDate" ? "#2563EB" : "#EA580C";
      ctx.beginPath();
      ctx.arc(cfg.x, cfg.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Certificate Reference Number (Bottom Left)
  if (config.refNumber) {
    const cfg = config.refNumber;
    ctx.save();
    ctx.font = getFontString(cfg);
    ctx.fillStyle = cfg.color || "#1E293B";
    ctx.textAlign = cfg.align || "left";
    ctx.textBaseline = "middle";

    const refVal = formData.refNumber;
    const refText = refVal ? `No.: ${refVal}` : `No.: GU/Pas/__________`;
    ctx.fillText(refText, cfg.x, cfg.y);

    if (showGuides) {
      ctx.fillStyle = activeField === "refNumber" ? "#2563EB" : "#EA580C";
      ctx.beginPath();
      ctx.arc(cfg.x, cfg.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 6. Security QR Code & Verification Stamp (Bottom Right)
  if (config.qrCode) {
    const cfg = config.qrCode;
    const qrImg = options.qrImage || formData.qrImageElement;
    const qrSize = cfg.size || 120;
    const qrX = cfg.x; // center X of QR code
    const qrY = cfg.y; // top Y of QR code

    ctx.save();
    
    if (qrImg && qrImg.complete && qrImg.naturalWidth !== 0) {
      // Draw solid white container backing with clean padding
      const pad = 6;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(qrX - qrSize / 2 - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2);

      // Draw subtle border around plate
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX - qrSize / 2 - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2);

      // Draw crisp QR Code
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(qrImg, qrX - qrSize / 2, qrY, qrSize, qrSize);
    } else {
      // Placeholder representation if QR is loading
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(qrX - qrSize / 2 - 4, qrY - 4, qrSize + 8, qrSize + 8);
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(qrX - qrSize / 2, qrY, qrSize, qrSize);
      ctx.fillStyle = "#94A3B8";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("QR Code", qrX, qrY + qrSize / 2);
    }

    // Draw Verification Text & Code under QR Code
    if (cfg.showCode !== false) {
      ctx.fillStyle = cfg.color || "#64748B";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `600 ${cfg.fontSize || 12}px ${cfg.fontFamily || "'Montserrat', sans-serif"}`;
      ctx.fillText("SCAN TO VERIFY", qrX, qrY + qrSize + 6);

      if (formData.verification_code) {
        ctx.font = `700 ${cfg.fontSize ? cfg.fontSize + 1 : 13}px ${cfg.fontFamily || "'Montserrat', sans-serif"}`;
        ctx.fillStyle = "#0F172A";
        ctx.fillText(formData.verification_code, qrX, qrY + qrSize + 22);
      }
    }

    if (showGuides) {
      ctx.strokeStyle = activeField === "qrCode" ? "#3B82F6" : "rgba(234, 88, 12, 0.4)";
      ctx.lineWidth = activeField === "qrCode" ? 2 : 1;
      ctx.setLineDash(activeField === "qrCode" ? [] : [4, 4]);
      ctx.strokeRect(qrX - qrSize / 2 - 6, qrY - 6, qrSize + 12, qrSize + 44);

      ctx.fillStyle = activeField === "qrCode" ? "#2563EB" : "#EA580C";
      ctx.beginPath();
      ctx.arc(qrX, qrY + qrSize / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
