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

const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

require("dotenv").config();
const HOST = process.env.HOST;
const PORT = process.env.PORT;
const FRONTEND_PORT = process.env.FRONTEND_PORT;
const TRANSCRIPTION_HOST = process.env.TRANSCRIPTION_HOST;
const TRANSCRIPTION_PORT = process.env.TRANSCRIPTION_PORT;
const FRONTEND_URL = `http://${HOST}:${FRONTEND_PORT}`;
const TRANSCRIPTION_URL = `http://${TRANSCRIPTION_HOST}:${TRANSCRIPTION_PORT}`;

app.use(cors({ origin: FRONTEND_URL }));
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

const upload = multer({
  dest: "uploads/",
});

const transcriptionStore = new Map();

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

function analyzeVideoPython(videoId, videoPath, outputCsvPath, socket) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      path.join(__dirname, "../AI4BeAgent/super_SLP.py"),
      videoId,
      videoPath,
      outputCsvPath,
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

app.post("/api/ai-chat", async (req, res) => {
  try {
    const { videoId, conversationHistory, context, parentName, childName } =
      req.body;
    let userMessage = req.body.userMessage;

    const analysisData = [];
    const storeData = transcriptionStore.get(videoId);

    console.log("Store Data:", storeData);

    if (storeData && storeData.analysisSegments) {
      analysisData.push(...storeData.analysisSegments);
    }

    console.log("Analysis", analysisData);

    let analysisSummary = analysisData
      .map((item, idx) => {
        return `TimeStamp ${item["Begin-End"]} - Segment ${idx + 1}: ${
          item.Strategy
        } -> Fidelity ${item["Fidelity Score"]}, Reasoning: ${
          item["AI Reasoning"]
        }`;
      })
      .join("\n");

    const parent = parentName || "the parent";
    const child = childName || "the child";

    if (!analysisSummary) {
      analysisSummary = "No analysis data available yet.";
    }

    const systemMessage = `
    You are an expert Speech-Language Pathology (SLP) assistant guiding parents through a structured coaching session.
    Your goal is to guide the user through this structured dialogue:
  
    1️ Self-Reflection Phase
       - Ask: "What do you think went well during your time with ${child}?"
       - Ask: "What do you think could have been done differently?"
       - After two responses, summarize their answers, then move to the next step.
  
    2️ Feedback Phase
       - If the analysis data is not yet available, explicilty say that you're currenlty analyzing the video.
       - Summarize key takeaways from the analysis data.
       - Highlight areas of improvement based on fidelity scores.
       - Move to the next phase after explaining the insights.
  
    3️ Problem-Solving Phase
       - Ask if the user has any concerns or difficulties in implementing strategies.
       - Provide targeted suggestions from the analysis data.
       - Move forward after at least one response.
  
    4️ Joint Planning Phase
       - Work with the user to plan improvements for the next session.
       - Offer practical tips and ensure the conversation ends with encouragement.
  
     **Important Rules**
    - Answer user questions at any time, but **always return to the structured coaching flow**.
    - If a user does not respond meaningfully, gently **guide them forward** without repeating questions too often.
    - If a user explicitly says they want to move forward, **do so immediately**.
    - Avoid open-ended loops; once a phase has been sufficiently discussed, move to the next.
  
    **Analysis Data for This Session**:
    ${analysisSummary}
  `;
    console.log("Analysis Summary", analysisSummary);
    console.log("Generated System Message:", systemMessage);
    console.log(
      "-------------TRASNCRIPTION STORE-------------",
      transcriptionStore
    );

    const messages = [
      { role: "system", content: systemMessage },
      ...conversationHistory,
    ];

    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    let botReply = openaiResponse.data.choices[0].message.content;

    return res.json({ botReply });
  } catch (error) {
    console.error("Error in /api/ai-chat:", error);
    return res.status(500).json({ error: "Failed to process AI chat" });
  }
});

app.get("/api/chat/:context", (req, res) => {
  const { context } = req.params;
  const response = chatMessages[context] || [];
  res.json(response);
});

app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const videoPath = req.file.path;
    const videoId = uuidv4();
    const videoUrl = `http://${HOST}:${PORT}/uploads/${req.file.filename}`;
    const outputCsv = `uploads/${videoId}.csv`;

    transcriptionStore.set(videoId, {
      videoUrl,
      transcriptions: [],
      csvPath: outputCsv,
      status: "processing",
    });

    res.json({ success: true, videoId, videoUrl });

    analyzeVideoPython(videoId, videoPath, outputCsv, io)
      .then(() => {
        transcriptionStore.set(videoId, {
          ...transcriptionStore.get(videoId),
          status: "completed",
        });
        io.emit("analysis_complete", { videoId, csvPath: outputCsv });
        fs.unlink(videoPath, (err) => {
          if (err) console.error(`Failed to delete ${videoPath}:`, err);
          else console.log(`Deleted video: ${videoPath}`);
        });
      })
      .catch((error) => {
        console.error("Error in analysis:", error);
        transcriptionStore.set(videoId, {
          ...transcriptionStore.get(videoId),
          status: "failed",
        });
      });
  } catch (error) {
    console.error("Error during video upload:", error.message);
    res.status(500).json({ error: "Video analysis failed" });
  }
});

app.get("/api/analysis/:videoId", (req, res) => {
  const { videoId } = req.params;
  if (!transcriptionStore.has(videoId)) {
    return res.status(404).json({ error: "No data for this video ID" });
  }
  const { csvPath, status } = transcriptionStore.get(videoId);

  if (status !== "completed") {
    return res.status(200).json({ status });
  }

  const csvData = fs.readFileSync(csvPath, "utf-8");
  res.json({ status: "completed", data: csvData });
});

app.get("/api/transcriptions/:videoId", (req, res) => {
  const { videoId } = req.params;
  const videoTime = parseFloat(req.query.videoTime);

  if (!transcriptionStore.has(videoId)) {
    return res
      .status(404)
      .json({ error: "No transcriptions available for this video." });
  }

  const transcriptions = transcriptionStore.get(videoId).transcriptions;

  if (!transcriptions || transcriptions.length === 0) {
    return res.status(200).json({ status: "processing" });
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

  transcriptionStore.forEach((data, videoId) => {
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

io.on("connection", (socket) => {
  console.log("Client connected to WebSocket");

  socket.on("transcription_update", (data) => {
    if (!transcriptionStore.has(data.videoId)) {
      transcriptionStore.set(data.videoId, { transcriptions: [] });
    }
    transcriptionStore.get(data.videoId).transcriptions.push({
      start: data.start,
      end: data.end,
      text: data.text,
    });
  });

  socket.on("analysis_progress", (data) => {
    console.log("Forwarding analysis_progress to frontend:", data);

    const { videoId } = data;
    if (!transcriptionStore.has(videoId)) {
      transcriptionStore.set(videoId, {
        transcriptions: [],
        analysisSegments: [],
      });
    }

    const store = transcriptionStore.get(videoId);

    if (!store.analysisSegments) {
      store.analysisSegments = [];
    }

    store.analysisSegments.push(data);

    io.emit("analysis_progress", data);
  });

  socket.on("analysis_complete", (data) => {
    console.log("Forwarding analysis_complete to frontend:", data);
    io.emit("analysis_complete", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
