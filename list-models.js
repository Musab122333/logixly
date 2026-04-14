const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDn3FAcYsnA52LQQKfPsjQjkAbu5jIdcOY");
  console.log("Fetching models...");
  try {
     const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + "AIzaSyDn3FAcYsnA52LQQKfPsjQjkAbu5jIdcOY");
     const data = await response.json();
     console.log(data.models.map(m => m.name).join("\n"));
  } catch (e) {
     console.error(e);
  }
}

main();
