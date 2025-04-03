const { generateCodeImage } = require("code-snippet-image-generator");

const code = `// Your complex code here...`;

generateCodeImage(code, {
  backgroundColor: "#6c5ce7", // Purple background
  outputPath: "custom-code-snippet.png",
  width: 1400, // Custom width
  height: 1000, // Custom height
  padding: 70, // Padding around the code
  fontFamily: "Fira Code", // Custom font (must be registered)
  fontSize: 28, // Larger text
  lineHeight: 1.7, // More spacing between lines
  terminalRadius: 18, // More rounded corners
  controlButtonRadius: 14, // Larger control buttons
  controlButtonSpacing: 30, // More space between buttons
});
