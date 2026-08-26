import Groq from "groq-sdk";

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

// Initialize Groq client (will use GROQ_API_KEY from env)
const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

/**
 * AI Chat Assistant - answers student questions about the dashboard
 */
export async function chatWithAssistant(message, context = {}) {
  if (!groq) {
    return {
      success: false,
      message: "AI assistant is not configured. Please add GROQ_API_KEY to .env file.",
      isDemo: true,
      response: getDemoResponse(message),
    };
  }

  try {
    const systemPrompt = `You are a helpful AI assistant for the Rahul Lab Academy student portal.
You help students understand their dashboard, navigate features, and answer questions about:
- Student registration and login
- Sprint workflows and agile practices
- MongoDB database records
- Account management

Current context:
- Student name: ${context.studentName || "Student"}
- Total students in system: ${context.totalStudents || "unknown"}
- Database: student_db.students collection

Keep responses concise (2-3 sentences), friendly, and focused on the portal features.`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return {
      success: true,
      response: completion.choices[0].message.content,
      isDemo: false,
    };
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    return {
      success: false,
      message: error.message,
      isDemo: true,
      response: getDemoResponse(message),
    };
  }
}

/**
 * Generate AI-powered insights for a student
 */
export async function generateStudentInsights(studentData, allStudents = []) {
  if (!groq) {
    return {
      success: false,
      isDemo: true,
      insights: getDemoInsights(studentData),
    };
  }

  try {
    const prompt = `Analyze this student profile and provide 3 personalized insights:

Student: ${studentData.name}
Email: ${studentData.email}
Joined: ${studentData.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : "Recently"}
Total students: ${allStudents.length}

Provide 3 short, actionable insights (one sentence each) about:
1. Learning path suggestion
2. Collaboration opportunity
3. Sprint goal recommendation

Format as JSON array: ["insight1", "insight2", "insight3"]`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 200,
    });

    const responseText = completion.choices[0].message.content?.trim() || "";
    const jsonText = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const insights = JSON.parse(jsonText);

    if (!Array.isArray(insights) || insights.length === 0) {
      throw new Error("Groq returned an invalid insights format");
    }

    return {
      success: true,
      insights,
      isDemo: false,
    };
  } catch (error) {
    console.error("AI Insights Error:", error.message);
    return {
      success: false,
      isDemo: true,
      insights: getDemoInsights(studentData),
    };
  }
}

/**
 * Semantic search - understands intent, not just keywords
 */
export async function semanticSearch(query, students) {
  if (!groq || students.length === 0) {
    return {
      success: false,
      isDemo: true,
      results: students.slice(0, 5),
      message: "Semantic search requires GROQ_API_KEY",
    };
  }

  try {
    // Use Groq to understand the search intent
    const prompt = `Given this search query: "${query}"
And these students: ${JSON.stringify(students.map(s => ({ name: s.name, email: s.email })))}

Which students are most relevant? Consider synonyms, related concepts, and intent.
Return JSON array of student emails in order of relevance: ["email1", "email2", ...]
Maximum 10 results.`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const responseText = completion.choices[0].message.content;
    const relevantEmails = JSON.parse(responseText);
    
    // Map back to full student objects
    const results = relevantEmails
      .map(email => students.find(s => s.email === email))
      .filter(Boolean)
      .slice(0, 10);

    return {
      success: true,
      results,
      isDemo: false,
      message: `Found ${results.length} relevant students using Groq AI semantic search`,
    };
  } catch (error) {
    console.error("Semantic Search Error:", error.message);
    // Fallback to simple text search
    const query_lower = query.toLowerCase();
    const results = students
      .filter(s => 
        s.name.toLowerCase().includes(query_lower) || 
        s.email.toLowerCase().includes(query_lower)
      )
      .slice(0, 10);
    
    return {
      success: false,
      isDemo: true,
      results,
      message: error.message,
    };
  }
}

// Demo responses when Groq is not configured
function getDemoResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes("sprint") || msg.includes("agile")) {
    return "Sprints are 2-week development cycles. Check the 'Activity' section to see your current sprint status and upcoming demos!";
  }
  if (msg.includes("student") || msg.includes("record")) {
    return "You can view all registered students in the 'Students' table. Use the search bar to filter by name or email.";
  }
  if (msg.includes("profile") || msg.includes("account")) {
    return "Click the avatar in the top-right or go to 'Profile' in the sidebar to view your complete profile with skills and projects.";
  }
  if (msg.includes("mongodb") || msg.includes("database")) {
    return "All student records are stored in MongoDB (student_db.students collection). You're connected and live!";
  }
  
  return "I'm here to help! Ask me about sprints, student records, your profile, or the MongoDB database. (Note: Add GROQ_API_KEY to .env for full AI features)";
}

function getDemoInsights(studentData) {
  return [
    `Welcome ${studentData.name?.split(" ")[0] || "Student"}! Start by exploring the Sprint workflow section.`,
    "Connect with other students in your cohort to practice pair programming.",
    "Set a sprint goal this week: complete one feature demo by Friday.",
  ];
}

export default {
  chatWithAssistant,
  generateStudentInsights,
  semanticSearch,
};
