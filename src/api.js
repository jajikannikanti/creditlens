const API_KEY = process.env.REACT_APP_GROQ_API_KEY;

export const callGemini = async (prompt) => {
  console.log("Calling Groq with key:", API_KEY ? "KEY FOUND" : "KEY MISSING");

  if (!API_KEY) throw new Error("Groq API key missing. Check your .env file.");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    const err = await response.text();
    console.error("Groq error:", err);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Empty response from Groq");

  return text.replace(/```json|```/g, "").trim();
};