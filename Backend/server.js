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
require("dotenv").config();
// const Minio = require("minio");

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
// const allowedOrigins = [FRONTEND_URL, "https://ai4behavior.xlabub.com","https://backend_ai4behavior.xlabub.com"];

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

// const minioClient = new Minio.Client({
//   endPoint: process.env.MINIO_ENDPOINT,
//   port: parseInt(process.env.MINIO_PORT, 10),
//   useSSL: process.env.MINIO_USE_SSL === "true",
//   accessKey: process.env.MINIO_ACCESS_KEY,
//   secretKey: process.env.MINIO_SECRET_KEY,
// });

// const BUCKET = process.env.MINIO_BUCKET || "my-bucket";

// minioClient.bucketExists(BUCKET, (err) => {
//   if (err) {
//     if (err.code === "NoSuchBucket") {
//       minioClient.makeBucket(BUCKET, "", (err2) => {
//         if (err2) console.error("Error creating MinIO bucket:", err2);
//         else console.log("Created MinIO bucket:", BUCKET);
//       });
//     } else {
//       console.error("Error checking MinIO bucket:", err);
//     }
//   } else {
//     console.log(`MinIO bucket "${BUCKET}" exists.`);
//   }
// });

const transcriptionStore = new Map();

const demoAnalysisMessages = [
  {
    "Begin-End": "01:28-01:35",
    "Fidelity Score": "3",
    "AI Reasoning":
      "Pay closer attention to non-verbal cues, such as signing or gestures, especially when your child is engaged in activities that may make verbal communication difficult, like being inside a tunnel.",
  },
  {
    "Begin-End": "01:36-01:42",
    "Fidelity Score": "4",
    "AI Reasoning":
      "You're effectively following the intervention flowchart steps by establishing joint attention, presenting your strategy, and waiting for at least 3 seconds.\n\nAfter repeating the question, your response should branch into two outcomes: if you receive a correct response, acknowledge and reinforce it; if no response or an incorrect response occurs, repeat the exact question once more. This structured repetition helps the child understand and engage while providing clarity in your feedback process.",
  },
  {
    "Begin-End": "01:43-01:48",
    "Fidelity Score": "4",
    "AI Reasoning":
      "The child is now both gesturing and vocalizing, showing progress in her communication. You followed the correct procedure by repeating the question after receiving an unclear response, allowing her to articulate more effectively on the second attempt.\n\nWhile the initial response may have been acceptable despite being unclear, your decision to repeat the question aligns with the flowchart guidelines: if no response or an unclear response is given, repeat the question once more to support clearer communication and reinforce understanding.",
  },
  {
    "Begin-End": "01:49-01:55",
    "Fidelity Score": "4",
    "AI Reasoning":
      "You followed an effective approach by waiting approximately 3 seconds after asking the initial question and then repeating the exact same question when there was no response.\n\nThis consistency is key—by not altering the question, you maintained clarity and avoided introducing potential confusion.\n\nChanging the question, even with good intentions, could shift the child's focus and lead to a different response. Sticking to the original question allows for a more accurate follow-through in the flowchart process, keeping the intervention on track.",
  },
  {
    "Begin-End": "01:56-02:02",
    "Fidelity Score": "3",
    "AI Reasoning":
      "It's important to recognize that some children may need extra time to process and respond to questions. By repeating the same question after a 3-second pause, you give the child time to understand, process their response, and express it. This is especially crucial for children with developmental delays, such as those with Down syndrome or autism, who may require additional time for both comprehension and expressive language. Although the 3-second pause may feel lengthy for adults, it is essential for the child’s processing. You are already applying this strategy effectively by allowing this pause before repeating the question, which helps reinforce understanding and gives the child an opportunity to respond.",
  },
  {
    "Begin-End": "02:03-02:08",
    "Fidelity Score": "1",
    "AI Reasoning":
      "Joint attention is a critical first step in any interaction, whether you're asking a question or modeling language. If the child is not physically or mentally engaged—such as when she shows no interest—this indicates a lack of joint attention. In such moments, it's important not to proceed with asking questions or providing feedback. Instead, focus on gently redirecting her attention to the shared activity before continuing.",
  },
  {
    "Begin-End": "03:36-03:42",
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
    // function analyzeVideoPython(videoId, videoUrl, outputCsvPath, socket, isDemo = false) {
    //   return new Promise((resolve, reject) => {
    //     const pythonProcess = spawn(pythonPath, [
    //       path.join(__dirname, "../AI4BeAgent/super_SLP.py"),
    //       videoId,
    //       videoUrl,
    //       outputCsvPath,
    //       isDemo ? "true" : "false"
    //     ]);

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
  const demoId = "demo-video-id";
  const localDemoPath = path.join(__dirname, "demo", "demo.MOV");
  const outputCsv = path.join(__dirname, "uploads", `${demoId}.csv`);

  transcriptionStore.set(demoId, {
    status: "processing",
    csvPath: outputCsv,
    transcriptions: [],
    analysisSegments: [],
  });

  try {
    analyzeVideoPython(demoId, localDemoPath, outputCsv, io, true).then(() => {
      demoAnalysisMessages.forEach((message, index) => {
        setTimeout(() => {
          const analysisData = { videoId: demoId, ...message };
          transcriptionStore.get(demoId).analysisSegments.push(analysisData);
          io.emit("analysis_progress", analysisData);
        }, index * 3000);
        setTimeout(() => {
          transcriptionStore.set(demoId, {
            ...transcriptionStore.get(demoId),
            status: "completed",
          });
          io.emit("analysis_complete", { videoId: demoId, csvPath: outputCsv });
        }, demoAnalysisMessages.length * 3000 + 2000);
      });
    });
  } catch (error) {
    console.error("Error processing demo video:", error);
    transcriptionStore.set(demoId, { status: "failed" });
  }
  // transcriptionStore.set(demoId, {
  //   status: "processing",
  //   csvPath: outputCsv,
  //   transcriptions: [],
  // });

  // analyzeVideoPython(demoId, localDemoPath, outputCsv, io, true)
  //   .then(() => {
  //     transcriptionStore.set(demoId, {
  //       ...transcriptionStore.get(demoId),
  //       status: "completed",
  //     });
  //     io.emit("analysis_complete", { videoId: demoId, csvPath: outputCsv });
  //   })
  //   .catch((err) => {
  //     console.error("Analysis error for demo:", err);
  //     transcriptionStore.set(demoId, {
  //       ...transcriptionStore.get(demoId),
  //       status: "failed",
  //     });
  //   });

  res.json({ videoId: demoId });
});

// app.get("/api/get-presigned-url", async (req, res) => {
//   try {
//     const { filename } = req.query;

//     const videoId = uuidv4();
//     const ext = path.extname(filename) || ".mp4";
//     const objectName = `${videoId}${ext}`;

//     const presignedUrl = await new Promise((resolve, reject) => {
//       minioClient.presignedPutObject(
//         BUCKET,
//         objectName,
//         3600,
//         (err, url) => {
//           if (err) reject(err);
//           else resolve(url);
//         }
//       );
//     });

//     transcriptionStore.set(videoId, {
//       objectName,
//       status: "uploaded",
//       transcriptions: [],
//     });

//     return res.json({ videoId, presignedUrl, objectName });
//   } catch (error) {
//     console.error("Error generating presigned URL:", error);
//     return res.status(500).json({ error: "Could not generate presigned URL" });
//   }
// });

// app.post("/api/start-analysis", async (req, res) => {
//   try {
//     const { videoId } = req.body;

//     // Ensure we have a record of this video
//     if (!transcriptionStore.has(videoId)) {
//       return res
//         .status(404)
//         .json({ error: "No record found for this videoId." });
//     }

//     const { objectName } = transcriptionStore.get(videoId);
//     if (!objectName) {
//       return res.status(400).json({ error: "No objectName found in store." });
//     }

//     const outputCsv = path.join(__dirname, "uploads", `${videoId}.csv`);

//     // Save status in store
//     transcriptionStore.set(videoId, {
//       ...transcriptionStore.get(videoId),
//       status: "processing",
//       csvPath: outputCsv,
//     });

//     const getUrl = await new Promise((resolve, reject) => {
//       minioClient.presignedGetObject(BUCKET, objectName, 3600, (err, url) => {
//         if (err) reject(err);
//         else resolve(url);
//       });
//     });

//     console.log("Running Python script with:", videoId, objectName, outputCsv);
//     analyzeVideoPython(videoId, getUrl, outputCsv, io)
//       .then(() => {
//         // Update store
//         transcriptionStore.set(videoId, {
//           ...transcriptionStore.get(videoId),
//           status: "completed",
//         });
//         // Let the front-end know
//         io.emit("analysis_complete", { videoId, csvPath: outputCsv });
//       })
//       .catch((err) => {
//         console.error("Analysis error:", err);
//         transcriptionStore.set(videoId, {
//           ...transcriptionStore.get(videoId),
//           status: "failed",
//         });
//       });

//     return res.json({ success: true, status: "analysis-started" });
//   } catch (error) {
//     console.error("Error in /api/start-analysis:", error);
//     return res.status(500).json({ error: "Failed to start analysis" });
//   }
// });

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
       - If the analysis data is not yet available, say that you're currenlty analyzing the video and don't proceed further.
       - Summarize key takeaways from the analysis data.
       - Highlight areas of improvement based on fidelity scores.
       - Move to the next phase after explaining the insights.
  
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
  const { videoTime, full } = req.query;

  if (!transcriptionStore.has(videoId)) {
    return res
      .status(404)
      .json({ error: "No transcriptions available for this video." });
  }

  const transcriptions = transcriptionStore.get(videoId).transcriptions;

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
    io.emit("transcription_updated", {
      videoId: data.videoId,
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

    if (videoId === "demo-video-id") return;

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
