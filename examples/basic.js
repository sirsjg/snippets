const { generateCodeImage } = require("code-snippet-image-generator");

const code = `function helloWorld() {
  console.log("Hello, world!");
}

helloWorld();`;

// Generate with default options
generateCodeImage(code, {
  outputPath: "my-code-snippet.png",
});
