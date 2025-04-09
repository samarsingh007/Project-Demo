const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { spawn } = require("child_process");
const { Pool } = require("pg");
const { validate: isUuid } = require("uuid");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool
  .connect()
  .then(() => console.log("Connected to Supabase PostgreSQL ✅"))
  .catch((err) => console.error("Error connecting to database ❌", err));

module.exports = pool;

const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const HOST = process.env.HOST;
const PORT = process.env.PORT;
const pythonPath = process.env.PYTHON_PATH;
const allowedOrigins = [
  "https://ai4behavior.xlabub.com",
  "https://backend_ai4behavior.xlabub.com",
];

// const FRONTEND_PORT = process.env.FRONTEND_PORT;
// const FRONTEND_URL = `http://${HOST}:${FRONTEND_PORT}`;
// const allowedOrigins = [
//   FRONTEND_URL,
//   "https://ai4behavior.xlabub.com",
//   "https://backend_ai4behavior.xlabub.com",
// ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  console.log("Request Headers:", req.headers);
  console.log("Request Body:", req.body);
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

const upload = multer({
  dest: "uploads/",
});

const allData = new Map();
const feedbackPending = {};
const analysisCompleted = {};
const analysisQueue = [];
let activeJobs = 0;
const MAX_CONCURRENCY = 2;

async function processNextJob() {
  if (analysisQueue.length === 0) return;
  if (activeJobs >= MAX_CONCURRENCY) return;

  const job = analysisQueue.shift();
  activeJobs++;

  const {
    videoId,
    videoPath,
    outputCsvPath,
    io,
    isDemo,
    onSuccess,
    onError,
  } = job;

  try {
    await analyzeVideoPython(videoId, videoPath, outputCsvPath, io, isDemo);
    if (onSuccess) await onSuccess();
  } catch (error) {
    if (onError) await onError(error);
  } finally {
    activeJobs--;
    processNextJob();
  }

  processNextJob();
}

function addAnalysisJob(job) {
  analysisQueue.push(job);
  processNextJob();
}

const demoAnalysisMessages = [
  {
    "Begin-End": "01:28-01:35",
    "Strategy": "Modeling",
    "Fidelity Score": "3",
    "AI Reasoning":
      "Pay closer attention to non-verbal cues, such as signing or gestures, especially when your child is engaged in activities that may make verbal communication difficult, like being inside a tunnel.",
  },
  {
    "Begin-End": "01:36-01:42",
    "Strategy": "Modeling",
    "Fidelity Score": "4",
    "AI Reasoning":
      "You're effectively following the intervention flowchart steps by establishing joint attention, presenting your strategy, and waiting for at least 3 seconds.\n\nAfter repeating the question, your response should branch into two outcomes: if you receive a correct response, acknowledge and reinforce it; if no response or an incorrect response occurs, repeat the exact question once more. This structured repetition helps the child understand and engage while providing clarity in your feedback process.",
  },
  {
    "Begin-End": "01:43-01:48",
    "Strategy": "Modeling",
    "Fidelity Score": "4",
    "AI Reasoning":
      "The child is now both gesturing and vocalizing, showing progress in her communication. You followed the correct procedure by repeating the question after receiving an unclear response, allowing her to articulate more effectively on the second attempt.\n\nWhile the initial response may have been acceptable despite being unclear, your decision to repeat the question aligns with the flowchart guidelines: if no response or an unclear response is given, repeat the question once more to support clearer communication and reinforce understanding.",
  },
  {
    "Begin-End": "01:49-01:55",
    "Strategy": "Modeling",
    "Fidelity Score": "4",
    "AI Reasoning":
      "You followed an effective approach by waiting approximately 3 seconds after asking the initial question and then repeating the exact same question when there was no response.\n\nThis consistency is key—by not altering the question, you maintained clarity and avoided introducing potential confusion.\n\nChanging the question, even with good intentions, could shift the child's focus and lead to a different response. Sticking to the original question allows for a more accurate follow-through in the flowchart process, keeping the intervention on track.",
  },
  {
    "Begin-End": "01:56-02:02",
    "Strategy": "Modeling",
    "Fidelity Score": "3",
    "AI Reasoning":
      "It's important to recognize that some children may need extra time to process and respond to questions. By repeating the same question after a 3-second pause, you give the child time to understand, process their response, and express it. This is especially crucial for children with developmental delays, such as those with Down syndrome or autism, who may require additional time for both comprehension and expressive language. Although the 3-second pause may feel lengthy for adults, it is essential for the child’s processing. You are already applying this strategy effectively by allowing this pause before repeating the question, which helps reinforce understanding and gives the child an opportunity to respond.",
  },
  {
    "Begin-End": "02:03-02:08",
    "Strategy": "Modeling",
    "Fidelity Score": "1",
    "AI Reasoning":
      "Joint attention is a critical first step in any interaction, whether you're asking a question or modeling language. If the child is not physically or mentally engaged—such as when she shows no interest—this indicates a lack of joint attention. In such moments, it's important not to proceed with asking questions or providing feedback. Instead, focus on gently redirecting her attention to the shared activity before continuing.",
  },
  {
    "Begin-End": "03:36-03:42",
    "Strategy": "Modeling",
    "Fidelity Score": "4",
    "AI Reasoning":
      "Your approach of acknowledging and then expanding on your child's response was highly effective. When Aria responded with 'rain,' you did the right thing by first validating her response with a simple affirmation: 'Yes, rain.' This immediate acknowledgment provides positive feedback and reinforces her language use.\n\nYou then took it a step further by expanding on her single-word response, introducing a more complex sentence ('It's raining,' 'There's an umbrella,' etc.). This method not only enriches her understanding of the concept but also models more complex language structures for her.",
  },
];

const chatMessages = {
  introduction: [
    {
      text: "Hi [Parent’s Name]! Let’s review your latest session with [Child’s Name]. I’m here to help you reflect on what went well, provide feedback, and work on any areas where you’d like more support.",
      sender: "bot",
    },
    {
      text: "Let’s begin our session. Ready to start?",
      sender: "bot",
      awaitResponse: true,
    },
  ],
};
function splitMessage(text, maxLen = 180) {
  const sentenceChunks = text
    .match(/[^.!?]+[.!?]+(\s+|$)|.+$/g)
    ?.map(s => s.trim())
    .filter(Boolean) || [];

  const finalChunks = [];

  sentenceChunks.forEach(sentence => {
    if (sentence.length <= maxLen) {
      finalChunks.push(sentence);
    } else {
      let cur = '';
      sentence.split(' ').forEach(word => {
        if ((cur + ' ' + word).trim().length > maxLen) {
          finalChunks.push(cur.trim());
          cur = word;
        } else {
          cur += ' ' + word;
        }
      });
      if (cur) finalChunks.push(cur.trim());
    }
  });

  return finalChunks;
}

function analyzeVideoPython(
  videoId,
  videoPath,
  outputCsvPath,
  socket,
  isDemo = false
) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(pythonPath, [
      path.join(__dirname, "../AI4BeAgent/super_SLP.py"),
      videoId,
      videoPath,
      outputCsvPath,
      isDemo ? "true" : "false",
    ]);

    pythonProcess.stdout.on("data", (data) => {
      const message = data.toString().trim();
      console.log(`Python Output: ${message}`);
      try {
        const jsonData = JSON.parse(message);
        socket.emit("analysis_progress", jsonData);
      } catch (error) {
        console.warn("Received non-JSON data from Python:", message);
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python script exited with code ${code}`));
      }
    });
  });
}

app.post("/api/start-demo", async (req, res) => {
  const { userId } = req.body;
  const demoId = "demo-video-id";
  const sessionId = uuidv4();
  const localDemoPath = path.join(__dirname, "demo", "demo.MOV");
  const outputCsv = path.join(__dirname, "uploads", `${sessionId}.csv`);

  allData.set(sessionId, {
    demoId,
    userId,
    status: "processing",
    csvPath: outputCsv,
    transcriptions: [],
    analysisSegments: [],
  });

  if (userId) {
    await pool.query(
      `INSERT INTO sessions (id, user_id, status, summary, video_url, is_demo)
     VALUES ($1, $2, $3, $4, $5, $6)`,
      [sessionId, userId, "processing", null, null, true]
    );
  }
  res.json({ videoId: sessionId });
  addAnalysisJob({
    videoId: sessionId,
    videoPath: localDemoPath,
    outputCsvPath: outputCsv,
    io,
    isDemo: true,

    onSuccess: async () => {
      demoAnalysisMessages.forEach((message, index) => {
        setTimeout(() => {
          const analysisData = { videoId: sessionId, ...message };
          allData.get(sessionId).analysisSegments.push(analysisData);
          io.emit("analysis_progress", analysisData);
        }, index * 3000);
      });
      setTimeout(async () => {
        allData.set(sessionId, {
          ...allData.get(sessionId),
          status: "completed",
        });
        if (userId) {
          await pool.query(
            `UPDATE sessions SET status = 'completed', updated_at = now() WHERE id = $1`,
            [sessionId]
          );
        }
        analysisCompleted[sessionId] = true;
        await handleAnalysisComplete({
          videoId: sessionId,
          userId,
        });
      }, demoAnalysisMessages.length * 3000 + 2000);
    },
    onError: async (error) => {
      console.error("Error processing demo video:", error);
      allData.set(sessionId, { status: "failed" });
      if (userId) {
        await pool.query(
          `UPDATE sessions SET status = 'failed', updated_at = now() WHERE id = $1`,
          [sessionId]
        );
      }
    },
  });
});

app.post("/api/ai-chat", async (req, res) => {
  try {
    const {
      videoId,
      conversationHistory,
      context,
      parentName,
      childName,
      userId,
    } = req.body;
    if (userId && videoId) {
      const existingRows = await pool.query(
        `SELECT 1 FROM conversation_history WHERE session_id = $1 LIMIT 1`,
        [videoId]
      );

      if (existingRows.rows.length === 0) {
        for (const msg of conversationHistory) {
          if (userId && videoId) {
            await pool.query(
              `
            INSERT INTO conversation_history (session_id, role, message)
            VALUES ($1, $2, $3)
          `,
              [videoId, msg.role, msg.content]
            );
          }
        }
      } else {
        const latestMessage =
          conversationHistory[conversationHistory.length - 1];
        await pool.query(
          `
            INSERT INTO conversation_history (session_id, role, message)
            VALUES ($1, $2, $3)
          `,
          [videoId, latestMessage.role, latestMessage.content]
        );
      }
    }
    const analysisData = [];
    const storeData = allData.get(videoId);

    if (storeData && storeData.analysisSegments) {
      analysisData.push(...storeData.analysisSegments);
    }

    const parent = parentName || "the parent";
    const child = childName || "the child";

    const systemMessage = `
    You are an expert Speech-Language Pathology (SLP) assistant guiding parents through a structured coaching session.
    Your goal is to guide the user through this structured dialogue:

    0️ Base Phase
    - If this is the start of the session and no video has been uploaded yet, guide the user to upload a video in the 'Review' tab before continuing.
    - Do not proceed with self-reflection or feedback until a video is available - you would be able to see 'A new video has successfully been uploaded' in the chat history.
  
    1️ Self-Reflection Phase
        - The first question has already been asked in a predefinded message. Next questions:
       - Ask: "If you were to replay this video, what would you try differently to support ${child}'s learning or communication?"
       - Ask: "How did you feel during this interaction, and how do you think ${child} felt? What might this tell you about their needs?"
       - After these user answers, IMMEDIATELY move to Feedback Phase.
  
    2️ Feedback Phase
      - Explicitly say you're "still analyzing" the video and will send it shortly. 
    
    3 Future Goals Phase - after ai feedback -
      - Based on what you observed, what is one small goal you’d like to focus on for the next interaction?
      - After this, add an emptional support message that will help the user.
  
     **Important Rules**
    - Be supportive and throw in some emotional support in each message to the user.
    - Answer user questions at any time, but **always return to the structured coaching flow**.
    - If a user does not respond meaningfully, gently **guide them forward** without repeating questions too often.
    - If a user explicitly says [skipped], **do so immediately**.
    - Avoid open-ended loops; once a phase has been sufficiently discussed, move to the next.
  `;
    const messages = [
      { role: "system", content: systemMessage },
      ...conversationHistory,
    ];

    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    let botReply = openaiResponse.data.choices[0].message.content;
    botReply = botReply
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\\n/g, "\n");

    if (userId && videoId) {
      await pool.query(
        `
        INSERT INTO conversation_history (session_id, role, message)
        VALUES ($1, $2, $3)
      `,
        [videoId, "assistant", botReply]
      );
    }

    const botReplyChunks = splitMessage(botReply);
    res.json({ botReplyChunks });
    if (botReply.includes("still analyzing")) {
      feedbackPending[videoId] = true;
      if (analysisCompleted[videoId]) {
        await handleAnalysisComplete({ videoId, userId });
      }
    }
  } catch (error) {
    console.error("Error in /api/ai-chat:", error);
    return res.status(500).json({ error: "Failed to process AI chat" });
  }
});

async function handleAnalysisComplete(data) {
  const { videoId, userId } = data;
  const storeData = allData.get(videoId);

  if (!analysisCompleted[videoId]) {
    console.log("Means we havent truly completed analysis, exit");
    return;
  }
  if (!feedbackPending[videoId]) {
    console.log("Means user wasnt waiting for feedback yet, exit");
    return;
  }

  if (!storeData || storeData.status !== "completed") {
    console.log(
      `Analysis not marked as completed yet for ${videoId}, skipping... ${storeData.status}`
    );
    return;
  }

  try {
    const storeData = allData.get(videoId);
    const analysisData = storeData?.analysisSegments || [];

    if (analysisData.length === 0) {
      console.log(`No analysis data found for video ${videoId}.`);
      return;
    }

    const analysisSummary = analysisData
      .map(
        (item, idx) =>
          `TimeStamp ${item["Begin-End"]} - Segment ${idx + 1}: ${
            item.Strategy
          } -> Fidelity ${item["Fidelity Score"]}, Reasoning: ${
            item["AI Reasoning"]
          }`
      )
      .join("\n");

    const conversationHistory = [
      {
        role: "system",
        content: `
      You are continuing an ongoing structured coaching session between an AI assistant and a parent. Earlier in the session, the user had reached the Feedback Phase, but the analysis data was not yet ready. The assistant had responded that it was still analyzing and would provide feedback shortly.
      
      Now, the analysis is complete. Without repeating previous questions or asking for permission, immediately provide the feedback summary based on the following data:
      
      ${analysisSummary}

        - Summarize key takeaways from the analysis data.
        - Highlight areas of improvement based on fidelity scores.
        - Don't make it too long - limit it to 3 - 4 points total.
      
      Your response should be natural, focused on feedback, and follow the structure of the coaching framework. Do not mention again that the analysis was previously unavailable — just provide the feedback directly by saying here's the feedback.
          `.trim(),
      },
    ];

    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: conversationHistory,
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    let feedbackReply = openaiResponse.data.choices[0].message.content;
    feedbackReply = feedbackReply
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\\n/g, "\n");

    if (userId) {
    await pool.query(
      `INSERT INTO conversation_history (session_id, role, message)
       VALUES ($1, 'assistant', $2)`,
      [videoId, feedbackReply]
    );
  }

    io.emit("new_assistant_message", {
      videoId,
      message: feedbackReply,
    });

    console.log(`✅ Feedback sent for video ${videoId}`);

    feedbackPending[videoId] = false;
    if (userId) {
    await generateTrainingSummary(feedbackReply, videoId, userId);
  }
  } catch (err) {
    console.error("Error sending auto-feedback after analysis:", err);
  }
}

app.get("/api/chat/:context", (req, res) => {
  const { context } = req.params;
  const response = chatMessages[context] || [];
  res.json(response);
});

app.post("/api/slp-chat", async (req, res) => {
  try {
    const { videoId, conversationHistory, userId } = req.body;

    if (userId && videoId) {
      const values = conversationHistory
        .filter((msg) => msg.role === "slp" || msg.role === "user-slp")
        .map((msg) => `('${videoId}', '${msg.role}', '${msg.content}')`)
        .join(", ");

      if (values.length > 0) {
        await pool.query(`
        INSERT INTO conversation_history (session_id, role, message)
        VALUES ${values}
      `);
      }
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("Error in /api/slp-chat:", error);
    return res.status(500).json({ error: "Failed to store SLP chat" });
  }
});

app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    let userId = req.body.userId;
    if (!isUuid(userId)) {
      userId = null;
    }
    const videoPath = req.file.path;
    const videoId = uuidv4();
    const videoUrl = `http://${HOST}:${PORT}/uploads/${req.file.filename}`;
    const outputCsv = `uploads/${videoId}.csv`;

    if (userId !== null) {
      await pool.query(
        `INSERT INTO sessions (id, user_id, status, summary, video_url, is_demo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
        [videoId, userId, "processing", null, videoUrl, false]
      );
    }
    allData.set(videoId, {
      userId,
      videoUrl,
      transcriptions: [],
      csvPath: outputCsv,
      status: "processing",
    });

    res.json({ success: true, videoId, videoUrl });
    addAnalysisJob({
      videoId,
      videoPath,
      outputCsvPath: outputCsv,
      io,
      isDemo: false,
      onSuccess: async () => {
        allData.set(videoId, {
          ...allData.get(videoId),
          status: "completed",
        });
        if (userId !== null) {
          await pool.query(
            `
            UPDATE sessions
            SET status = 'completed', updated_at = now()
            WHERE id = $1
          `,
            [videoId]
          );
        }
        analysisCompleted[videoId] = true;
        await handleAnalysisComplete({ videoId, userId });
        fs.unlink(videoPath, (err) => {
          if (err) console.error(`Failed to delete ${videoPath}:`, err);
          else console.log(`Deleted video: ${videoPath}`);
        });
      },

      onError: async (error) => {
        console.error("Error in analysis:", error);
        allData.set(videoId, {
          ...allData.get(videoId),
          status: "failed",
        });
        if (userId !== null) {
          await pool.query(
            `
          UPDATE sessions
          SET status = 'failed', updated_at = now()
          WHERE id = $1
        `,
            [videoId]
          );
        }
      },
    });
  } catch (error) {
    console.error("Error during video upload:", error.message);
    res.status(500).json({ error: "Video analysis failed" });
  }
});

app.get("/api/analysis/:videoId", (req, res) => {
  const { videoId } = req.params;
  if (!allData.has(videoId)) {
    return res.status(404).json({ error: "No data for this video ID" });
  }
  const { csvPath, status } = allData.get(videoId);

  if (status !== "completed") {
    return res.status(200).json({ status });
  }

  const csvData = fs.readFileSync(csvPath, "utf-8");
  res.json({ status: "completed", data: csvData });
});

app.get("/api/transcriptions/:videoId", (req, res) => {
  const { videoId } = req.params;
  const { videoTime, full } = req.query;

  if (!allData.has(videoId)) {
    return res
      .status(404)
      .json({ error: "No transcriptions available for this video." });
  }

  const transcriptions = allData.get(videoId).transcriptions;

  if (!transcriptions || transcriptions.length === 0) {
    return res.status(200).json({ status: "processing" });
  }

  if (full === "true") {
    return res.json(transcriptions);
  }

  const convertToSeconds = (timeString) => {
    const [minutes, seconds] = timeString.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  const filteredTranscriptions = transcriptions.filter((transcription) => {
    const startInSeconds = convertToSeconds(transcription.start);
    const endInSeconds = convertToSeconds(transcription.end);

    return startInSeconds <= videoTime && videoTime <= endInSeconds;
  });

  res.json(filteredTranscriptions);
});

app.post("/api/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file uploaded" });
  }

  const imageUrl = `http://${HOST}:${PORT}/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

app.get("/api/steps-timeline", (req, res) => {
  const stepsTimeline = [
    { timestamp: 88, step: 1, isCorrect: true },
    { timestamp: 96, step: 4, isCorrect: true },
    { timestamp: 100, step: null, isCorrect: true },
    { timestamp: 103, step: null, isCorrect: true },
    { timestamp: 107, step: 3, isCorrect: true },
    { timestamp: 112, step: 6, isCorrect: false },
    { timestamp: 216, step: null, isCorrect: true },
    { timestamp: 393, step: 4, isCorrect: false },
  ];

  res.json(stepsTimeline);
});

app.get("/api/relative-positions", (req, res) => {
  const relativePositions = {
    1: { top: "6.5%", left: "50%" },
    2: { top: "26.5%", left: "50%" },
    3: { top: "47%", left: "50%" },
    4: { top: "72%", left: "24%" },
    5: { top: "100%", left: "24%" },
    6: { top: "72%", left: "76%" },
    7: { top: "100%", left: "76%" },
  };

  res.json(relativePositions);
});

app.get("/api/fidelity-messages", (req, res) => {
  let allFidelityMessages = [];

  allData.forEach((data, videoId) => {
    const transcriptions = data.transcriptions || [];

    transcriptions.forEach((t) => {
      if (t.fidelityScore !== undefined) {
        allFidelityMessages.push({
          timestamp: t.timestamp,
          fidelityScore: t.fidelityScore,
          strategy: t.strategy,
        });
      }
    });
  });

  res.json(allFidelityMessages);
});

app.get("/api/sessions/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, video_url, is_demo, status, summary, created_at
       FROM sessions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

app.get("/api/analysis-details/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const result = await pool.query(
      "SELECT summary FROM sessions WHERE id = $1",
      [sessionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    let summary = result.rows[0].summary;

    // If it's a string (from OpenAI), parse it into JSON
    if (typeof summary === "string") {
      try {
        summary = JSON.parse(summary);
      } catch (parseError) {
        console.warn("⚠️ Stored summary is not valid JSON. Returning raw string.");
        // fallback to raw string if parsing fails
      }
    }

    res.json({ summary });
  } catch (err) {
    console.error("❌ Error fetching analysis summary:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

async function generateTrainingSummary(feedbackReply, videoId, userId) {
  try {
    // 1) Fetch self-reflection chat and final ai feedback from DB
    const [chatResult] = await Promise.all([
      pool.query(
        `SELECT role, message
         FROM conversation_history
         WHERE session_id = $1
         AND role IN ('user', 'assistant')
         AND message ILIKE ANY (ARRAY[
           '%What do you think went well%',
           '%What do you think could have been done differently%',
           '%skipped%',
           '%still analyzing%'  -- Optional: if you want to trim after this
         ])
         ORDER BY created_at ASC`,
        [videoId]
      )
    ]);

    const conversationObject = chatResult.rows.map(row => ({
      role: row.role,
      message: row.message
    }));

    const systemPrompt = `
You are reviewing a coaching conversation between a parent and an AI assistant.
Return a JSON object with exactly these keys:

{
  "feedback": "The exact AI feedback from the system",
  "chatTranscript": [
    {"role": "...", "message": "..."}
  ],
  "chatSummary": "A short 3–4 line summary of the user's self-reflection phase"
}

Use the self-reflection Q&A phase only — where the AI asks what went well and what could’ve been improved, and the user responds. Ignore the rest.

Output valid JSON only. No markdown or explanation.
`.trim();

    // 3) Call OpenAI
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify({
              feedback: feedbackReply,
              chatTranscript: conversationObject
            })
          }
        ],
        temperature: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      }
    );

    const summary = openaiResponse.data.choices[0].message.content;

    await pool.query(
      `UPDATE sessions SET summary = $1, updated_at = NOW() WHERE id = $2`,
      [summary, videoId]
    );

    console.log(`✅ Summary (with chat + feedback) saved for ${videoId}`);
  } catch (err) {
    console.error("❌ Error generating or saving summary:", err);
  }  
  io.emit("analysis_complete", { videoId, userId });
};

io.on("connection", (socket) => {
  console.log("Client connected to WebSocket");

  socket.on("transcription_update", async (data) => {
    const { videoId, start, end, text } = data;
  
    // Save in-memory
    if (!allData.has(videoId)) {
      allData.set(videoId, { transcriptions: [] });
    }
    allData.get(videoId).transcriptions.push({ start, end, text });
  
    // Emit to frontend
    io.emit("transcription_updated", { videoId, start, end, text });
  
    // Save to PostgreSQL
    try {
      await pool.query(
        `INSERT INTO transcriptions (session_id, start_time, end_time, text)
         VALUES ($1, $2, $3, $4)`,
        [videoId, start, end, text]
      );
    } catch (err) {
      console.error("❌ Error inserting transcription into DB:", err);
    }
  });
  

  socket.on("analysis_progress", async (data) => {
    const { videoId, "Begin-End": beginEnd, Strategy, "Fidelity Score": fidelityScore, "AI Reasoning": aiReasoning } = data;
    if (!allData.has(videoId)) {
      allData.set(videoId, {
        transcriptions: [],
        analysisSegments: [],
      });
    }
    const store = allData.get(videoId);

    if (!store.analysisSegments) {
      store.analysisSegments = [];
    }

    if (videoId === "demo-video-id") return;

    const analysisData = {
      videoId,
      beginEnd,
      strategy: Strategy,
      fidelityScore,
      aiReasoning,
    };

    store.analysisSegments.push(analysisData);

    try {
      await pool.query(
        `INSERT INTO analysis_segments (session_id, begin_end, strategy, fidelity_score, ai_reasoning)
         VALUES ($1, $2, $3, $4, $5)`,
        [videoId, beginEnd, Strategy, fidelityScore, aiReasoning]
      );
    } catch (err) {
      console.error("❌ Error saving analysis segment to DB:", err);
    }
  
    io.emit("analysis_progress", data);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
