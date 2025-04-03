const { createCanvas, registerFont } = require("canvas");
const fs = require("fs");

/**
 * Generates a beautiful image from a code snippet
 * @param {string} code - The code snippet to display
 * @param {Object} options - Configuration options
 * @param {string} options.backgroundColor - Base color for background (hex format, default: "#ff3366")
 * @param {string} options.outputPath - Path to save the image (default: "code-snippet.png")
 * @param {number} options.width - Canvas width (default: 1200)
 * @param {number} options.height - Canvas height (default: 800)
 * @param {number} options.padding - Padding around the code (default: 60)
 * @param {string} options.fontFamily - Font family for code (default: "monospace")
 * @param {number} options.fontSize - Font size for code (default: 24)
 * @returns {Promise<Buffer>} - Returns a promise that resolves to the image buffer
 */
function codeToImage(code, options = {}) {
  // Calculate the dimensions based on code content
  const calculateDimensions = (code, fontSize, lineHeight) => {
    // Create a temporary canvas to measure text
    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.font = `${fontSize}px monospace`;

    // Split the code into lines and find the longest line
    const lines = code.split("\n");
    const lineCount = lines.length;

    // Calculate width based on the longest line
    let maxLineWidth = 0;
    lines.forEach((line) => {
      const lineWidth = tempCtx.measureText(line).width;
      maxLineWidth = Math.max(maxLineWidth, lineWidth);
    });

    // Add padding for the width and height
    const paddingX = 150; // Left and right padding combined
    const paddingY = 150; // Top and bottom padding combined

    // Calculate the adaptive width and height
    const adaptiveWidth = Math.max(400, maxLineWidth + paddingX);
    // Add extra space at the bottom for the closing brace and shadow
    const adaptiveHeight = Math.max(
      200,
      lineCount * fontSize * lineHeight + paddingY + 40
    );

    return {
      width: Math.min(2000, adaptiveWidth), // Cap width at 2000px
      height: Math.min(1500, adaptiveHeight), // Cap height at 1500px
    };
  };

  // Get the font size from options or default
  const fontSize = options.fontSize || 24;
  const lineHeight = options.lineHeight || 1.5;

  // Calculate adaptive dimensions if not explicitly provided
  const adaptiveDimensions = calculateDimensions(code, fontSize, lineHeight);

  // Default options with adaptive dimensions
  const config = {
    backgroundColor: options.backgroundColor || "#ff3366",
    outputPath: options.outputPath || "code-snippet.png",
    width: options.width || adaptiveDimensions.width,
    height: options.height || adaptiveDimensions.height,
    padding: options.padding || 50,
    fontFamily: options.fontFamily || "monospace",
    fontSize: fontSize,
    lineHeight: lineHeight,
    terminalRadius: options.terminalRadius || 15,
    controlButtonRadius: options.controlButtonRadius || 12,
    controlButtonSpacing: options.controlButtonSpacing || 25,
  };

  // Create canvas with the specified dimensions
  const canvas = createCanvas(config.width, config.height);
  const ctx = canvas.getContext("2d");

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, config.height);

  // Create a darker version of the background color for gradient
  const darkenHexColor = (hex, percent) => {
    // Parse the hex color
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    // Darken the color by reducing RGB values
    r = Math.max(0, Math.floor(r * (1 - percent / 100)));
    g = Math.max(0, Math.floor(g * (1 - percent / 100)));
    b = Math.max(0, Math.floor(b * (1 - percent / 100)));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const darkColor = darkenHexColor(config.backgroundColor, 20);

  gradient.addColorStop(0, config.backgroundColor);
  gradient.addColorStop(1, darkColor);

  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, config.width, config.height);

  // Calculate terminal window dimensions
  const terminalWidth = config.width - config.padding * 2;
  const terminalHeight = config.height - config.padding * 2;
  const terminalX = config.padding;
  const terminalY = config.padding;

  // Draw terminal window with shadow
  // First draw the shadow - subtle with larger spread

  // Shadow blur effect with larger spread (simulate with multiple layers)
  for (let i = 2; i <= 12; i += 2) {
    // Increased max from 8 to 12 for larger spread
    ctx.fillStyle = `rgba(0, 0, 0, ${0.1 - i * 0.008})`; // Adjusted opacity formula
    // Use manual rounded rect if roundRect not available
    if (!ctx.roundRect) {
      // Draw rounded rectangle for shadow
      const radius = config.terminalRadius;
      const x = terminalX + i;
      const y = terminalY + i;
      const width = terminalWidth;
      const height = terminalHeight;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.roundRect(
        terminalX + i,
        terminalY + i,
        terminalWidth,
        terminalHeight,
        config.terminalRadius
      );
      ctx.fill();
    }
  }

  // Main shadow with slightly increased opacity
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)"; // Slightly increased from 0.15
  ctx.beginPath();
  // Use manual rounded rect if roundRect not available
  if (!ctx.roundRect) {
    // Draw rounded rectangle for shadow
    const radius = config.terminalRadius;
    const x = terminalX + 2; // Reduced offset from 4 to 2
    const y = terminalY + 2; // Reduced offset from 4 to 2
    const width = terminalWidth;
    const height = terminalHeight;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  } else {
    ctx.roundRect(
      terminalX + 2,
      terminalY + 2,
      terminalWidth,
      terminalHeight,
      config.terminalRadius
    );
  }
  ctx.fill();

  // Then draw the terminal
  ctx.fillStyle = "#0a192f"; // Dark blue terminal background
  ctx.beginPath();
  // Use manual rounded rect if roundRect not available
  if (!ctx.roundRect) {
    // Draw rounded rectangle for terminal
    const radius = config.terminalRadius;
    const x = terminalX;
    const y = terminalY;
    const width = terminalWidth;
    const height = terminalHeight;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  } else {
    ctx.roundRect(
      terminalX,
      terminalY,
      terminalWidth,
      terminalHeight,
      config.terminalRadius
    );
  }
  ctx.fill();

  // Draw terminal controls (the colored circles)
  const controlsY = terminalY + config.controlButtonRadius + 15;
  const colors = ["#ff6057", "#ffbd2e", "#27c93f"]; // Red, Yellow, Green

  // Increased spacing between the control buttons
  const buttonSpacing = config.controlButtonSpacing + 5; // Add 5px more space

  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      terminalX + config.controlButtonRadius + 15 + i * buttonSpacing,
      controlsY,
      config.controlButtonRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  // Syntax highlighting colors (Monokai-like theme)
  const syntaxColors = {
    keyword: "#f92672", // magenta
    function: "#66d9ef", // blue
    string: "#e6db74", // yellow
    comment: "#75715e", // gray
    variable: "#a6e22e", // green
    normal: "#f8f8f2", // light gray
  };

  // Simple syntax highlighting for JavaScript
  function getTokenType(token) {
    // Check if token is a keyword
    if (
      /^(console|const|let|var|function|return|if|else|for|while|class|import|export|from|=>)$/.test(
        token
      )
    ) {
      return "keyword";
    }

    // Check if token is a function call (ends with parenthesis)
    if (/\w+\(/.test(token)) {
      return "function";
    }

    // Check if token contains a string
    if (/(["'`]).*\1/.test(token)) {
      return "string";
    }

    // Check if token is a comment
    if (/\/\//.test(token)) {
      return "comment";
    }

    // Default color
    return "normal";
  }

  // Draw text with syntax highlighting
  function drawCodeWithHighlighting(ctx, code, x, y, options) {
    const { fontSize, fontFamily, lineHeight } = options;

    // Split the code into lines
    const lines = code.split("\n");

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";

    lines.forEach((line, lineIndex) => {
      const lineY = y + lineIndex * fontSize * lineHeight;

      // Simple tokenization by splitting on spaces and special characters
      let currentX = x;
      let currentWord = "";

      // Process each character
      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Handle strings
        if (char === '"' || char === "'" || char === "`") {
          // Draw any accumulated word first
          if (currentWord) {
            const tokenType = getTokenType(currentWord);
            ctx.fillStyle = syntaxColors[tokenType];
            ctx.fillText(currentWord, currentX, lineY);
            currentX += ctx.measureText(currentWord).width;
            currentWord = "";
          }

          // Find the end of the string
          let stringContent = char;
          let j = i + 1;
          while (j < line.length && line[j] !== char) {
            stringContent += line[j];
            j++;
          }

          // Add the closing quote if found
          if (j < line.length) {
            stringContent += line[j];
            i = j; // Skip to the end of the string
          }

          // Draw the string
          ctx.fillStyle = syntaxColors.string;
          ctx.fillText(stringContent, currentX, lineY);
          currentX += ctx.measureText(stringContent).width;
          continue;
        }

        // Handle spaces
        if (char === " ") {
          // Draw any accumulated word
          if (currentWord) {
            const tokenType = getTokenType(currentWord);
            ctx.fillStyle = syntaxColors[tokenType];
            ctx.fillText(currentWord, currentX, lineY);
            currentX += ctx.measureText(currentWord).width;
            currentWord = "";
          }

          // Add the space
          currentX += ctx.measureText(" ").width;
          continue;
        }

        // Handle punctuation and special characters
        if (/[(){}[\],;:.]/.test(char)) {
          // Draw any accumulated word
          if (currentWord) {
            const tokenType = getTokenType(currentWord);
            ctx.fillStyle = syntaxColors[tokenType];
            ctx.fillText(currentWord, currentX, lineY);
            currentX += ctx.measureText(currentWord).width;
            currentWord = "";
          }

          // Draw the punctuation
          ctx.fillStyle = syntaxColors.normal;
          ctx.fillText(char, currentX, lineY);
          currentX += ctx.measureText(char).width;
          continue;
        }

        // Accumulate characters for the current word
        currentWord += char;
      }

      // Draw any remaining word
      if (currentWord) {
        const tokenType = getTokenType(currentWord);
        ctx.fillStyle = syntaxColors[tokenType];
        ctx.fillText(currentWord, currentX, lineY);
      }
    });
  }

  // Draw the code with syntax highlighting
  const codeX = terminalX + 30; // Reduced left margin
  const codeY = controlsY + 35; // Reduced top margin

  drawCodeWithHighlighting(ctx, code, codeX, codeY, {
    fontSize: config.fontSize,
    fontFamily: config.fontFamily,
    lineHeight: config.lineHeight,
  });

  // Return the image buffer
  return canvas.toBuffer("image/png");
}

/**
 * Save the generated image to a file
 * @param {Buffer} imageBuffer - The image buffer
 * @param {string} outputPath - Path to save the image
 * @returns {Promise<void>}
 */
async function saveImage(imageBuffer, outputPath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputPath, imageBuffer, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Generate a code image and save it to file
 * @param {string} code - The code snippet
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Path to the saved image
 */
async function generateCodeImage(code, options = {}) {
  try {
    const imageBuffer = codeToImage(code, options);
    const outputPath = options.outputPath || "code-snippet.png";
    await saveImage(imageBuffer, outputPath);
    console.log(`Image saved to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error generating code image:", error);
    throw error;
  }
}

module.exports = {
  codeToImage,
  saveImage,
  generateCodeImage,
};

// If running this file directly, generate an example
if (require.main === module) {
  const exampleCode = `console.log("It's that SIMPLE?");`;

  generateCodeImage(exampleCode, {
    backgroundColor: "#ff3366",
    outputPath: "example-code-snippet.png",
  });
}
