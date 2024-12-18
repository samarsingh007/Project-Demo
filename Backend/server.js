const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { spawn } = require('child_process');


require('dotenv').config();
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

const upload = multer({
  dest: 'uploads/',
});

const transcriptionStore = new Map();

const messages = [
  { 
      text: "Pay closer attention to non-verbal cues, such as signing or gestures, especially when your child is engaged in activities that may make verbal communication difficult, like being inside a tunnel.", 
      sender: 'bot', 
      timestamp: 88, 
      fidelityScore: 3,
      strategy: 'Modeling'
    },
    { 
      text: "You're effectively following the intervention flowchart steps by establishing joint attention, presenting your strategy, and waiting for at least 3 seconds.\n\nAfter repeating the question, your response should branch into two outcomes: if you receive a correct response, acknowledge and reinforce it; if no response or an incorrect response occurs, repeat the exact question once more. This structured repetition helps the child understand and engage while providing clarity in your feedback process.", 
      sender: 'bot', 
      timestamp: 96, 
      fidelityScore: 4,
      strategy: 'Modeling'
    },
    { 
      text: "The child is now both gesturing and vocalizing, showing progress in her communication. You followed the correct procedure by repeating the question after receiving an unclear response, allowing her to articulate more effectively on the second attempt.\n\nWhile the initial response may have been acceptable despite being unclear, your decision to repeat the question aligns with the flowchart guidelines: if no response or an unclear response is given, repeat the question once more to support clearer communication and reinforce understanding.", 
      sender: 'bot', 
      timestamp: 100, 
      fidelityScore: 4,
      strategy: 'Modeling'
    },
    { 
      text: "You followed an effective approach by waiting approximately 3 seconds after asking the initial question and then repeating the exact same question when there was no response.\n\nThis consistency is key—by not altering the question, you maintained clarity and avoided introducing potential confusion.\n\nChanging the question, even with good intentions, could shift the child's focus and lead to a different response. Sticking to the original question allows for a more accurate follow-through in the flowchart process, keeping the intervention on track.", 
      sender: 'bot', 
      timestamp: 103, 
      fidelityScore: 4,
      strategy: 'Modeling'
    },
    { 
      text: "It's important to recognize that some children may need extra time to process and respond to questions. By repeating the same question after a 3-second pause, you give the child time to understand, process their response, and express it. This is especially crucial for children with developmental delays, such as those with Down syndrome or autism, who may require additional time for both comprehension and expressive language. Although the 3-second pause may feel lengthy for adults, it is essential for the child’s processing. You are already applying this strategy effectively by allowing this pause before repeating the question, which helps reinforce understanding and gives the child an opportunity to respond.\n\nThe same approach can be applied when modeling language: for instance, when teaching a word like 'shoes,' give the child time to process by pausing for 3 seconds before repeating the word. If the child responds, affirm their effort ('Yes, shoes!'), reinforcing their language development. Keep following this method, as it supports both comprehension and expressive language growth.\n\nWhen modeling language for your child, maintain the same 3-second wait time after each modeled phrase to give her time to process and respond. You know her vocabulary best, so tailor your modeling based on her familiarity with the material—books she's more familiar with may require fewer new words, while unfamiliar books can introduce more vocabulary.\n\nAt this stage, consider encouraging multiple-word responses to help expand her language. For example, instead of just modeling 'shoes,' you can expand to 'brown shoes' or 'blue shoes.' This helps her practice two-word utterances, which are appropriate for her developmental level. Model these expanded phrases, then wait for her to imitate. By doing this, you're helping her progress from single words to more complex speech, enhancing both her vocabulary and her ability to form more structured responses.", 
      sender: 'bot', 
      timestamp: 107, 
      fidelityScore: 3,
      strategy: 'Modeling'
    },
    { 
      text: "Joint attention is a critical first step in any interaction, whether you're asking a question or modeling language. If the child is not physically or mentally engaged—such as when she shows no interest—this indicates a lack of joint attention. In such moments, it's important not to proceed with asking questions or providing feedback. Instead, focus on gently redirecting her attention to the shared activity before continuing.\n\nOnce you regain her attention, avoid rushing into the next question or prompt. As you discussed previously, it's okay to let the interaction flow naturally and not feel pressured to ask a question immediately. You can hold onto that question for later or use it in the next part of the activity, such as the following pages of a book, when discussing something related to the story or illustrations. This approach helps maintain engagement and supports a more meaningful interaction when both parties are truly focused on the same thing.", 
      sender: 'bot', 
      timestamp: 112, 
      fidelityScore: 1,
      strategy: 'Modeling'
    },
    { 
      text: "Your approach of acknowledging and then expanding on your child's response was highly effective. When Aria responded with 'rain,' you did the right thing by first validating her response with a simple affirmation: 'Yes, rain.' This immediate acknowledgment provides positive feedback and reinforces her language use.\n\nYou then took it a step further by expanding on her single-word response, introducing a more complex sentence ('It's raining,' 'There's an umbrella,' etc.). This method not only enriches her understanding of the concept but also models more complex language structures for her. By observing your facial expressions and hearing your elaboration, Aria is absorbing more language than she might be able to express at the moment, which is a key part of her learning process.\n\nFor future interactions, you can further simplify or scaffold responses, such as adding two-word combinations ('a lot of rain,' 'umbrella and rain') to gradually build upon her current language level. This balanced approach of acknowledging, expanding, and then simplifying as needed helps nurture her language growth in a structured yet supportive way.", 
      sender: 'bot', 
      timestamp: 216, 
      fidelityScore: 4,
      strategy: 'Modeling'
    }
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
      awaitResponse: true
    }
  ],
  selfReflection: [
    {
      text: "First, let’s take a moment to reflect on today’s interaction. I have a couple of questions for you.",
      sender: "bot",
    },
    {
      text: "What do you think went well during your time with [Child’s Name]?",
      sender: "bot",
      awaitResponse: true
    },
    {
      text: "Thank you for sharing! Now, thinking back, what do you think you could have done differently?",
      sender: "bot",
      awaitResponse: true
    },
    {
      text: "Great reflections! It’s so helpful to consider both the strengths and areas to adjust.",
      sender: "bot"
    },
    {
      text: " Now let’s look at some specific feedback. Now you may begin to play the video.",
      sender: "bot"
    }
  ],
  fidelityScore: {
    0: [
      {
      text: "I’ve reviewed the video from your recent session with [Child’s Name]. Let’s go over some highlights based on your fidelity score, covering what went well and where we can make some adjustments for next time",
      sender: "bot"
      }
    ],
    4: [
      {
        text: "Great job! You received a high fidelity score of 4, meaning you implemented several key steps effectively. Here’s a breakdown of what went well:",
        sender: "bot"
      },
      {
        text: "What did you do well? [Specific positive feedback on a well-executed action, such as engaging in joint attention or giving appropriate wait time].",
        sender: "bot"
      },
      {
        text: "Which steps were implemented correctly? [Description of correctly implemented steps, like following the planned strategy sequence without rushing].",
        sender: "bot"
      },
      {
        text: "Why did you receive the high fidelity score? [Explanation of scoring, e.g., ‘You allowed [Child’s Name] adequate response time and acknowledged their actions].",
        sender: "bot"
      },
      {
        text: "Fantastic work! These positive practices make a big difference. Keep it up, and let’s build on this success.",
        sender: "bot"
      }
    ],
    3: [
      {
        text: "You received a fidelity score of 3 in the following cases, which suggests some good attempts and a few areas where we can work together to improve.",
        sender: "bot"
      },
      {
        text: "Here are the time stamps for reference: Case 1: 1:30-1:43; Case 2: 1:48-2:03.",
        sender: "bot"
      },
      {
        text: "Case 1: 1:30-1:43\nYou did a great job verbally modeling the word 'car' while [Child’s Name] was looking at the picture of the toy car. This helps reinforce language while [Child’s Name] is focused and attentive.",
        sender: "bot"
      },
      {
        text: "However, you missed acknowledging his correct response when he vocalized 'caa' for 'car.' Next time, let’s try to acknowledge his responses right away to encourage and validate his efforts.",
        sender: "bot"
      }
    ],
    2: [
      {
        text: "You received a fidelity score of 2 in the following instances, showing some effective strategies with room to refine your approach.",
        sender: "bot"
      },
      {
        text: "Here are the time stamps for reference: Case 1: 0:45-1:00; Case 2: 1:20-1:35.",
        sender: "bot"
      },
      {
        text: "Case 1: 0:45-1:00\nYou used a choice question effectively, asking, 'Is this a car or a train?' This was a great strategy since [Child’s Name] was paying attention to the car, and choice questions help reinforce his focus and language development.",
        sender: "bot"
      },
      {
        text: "However, you waited only a second before asking the question again. To give [Child’s Name] a chance to process and respond, try waiting 3-5 seconds before repeating. This will help him feel more confident in his ability to respond.",
        sender: "bot"
      }
    ],
    1: [
      {
        text: "You received a fidelity score of 1 in the following instances, which suggests we can work on adjusting some strategies for better engagement.",
        sender: "bot"
      },
      {
        text: "Case 1: 0:10-0:25\nYou modeled a vocabulary word, but [Child’s Name] was looking away, so there was no joint attention. To make sure [Child’s Name] is fully engaged, try to first notice where he’s looking and whether he’s interested in the activity or object.",
        sender: "bot"
      },
      {
        text: "Before introducing the word, pause and wait for [Child’s Name] to look at the toy or object. This will help him connect with what you’re modeling and stay focused.",
        sender: "bot"
      }
    ],
  },
    problemSolvingDialogue: [
      {
        text: "I know strategy implementation can sometimes raise questions or concerns. Let’s work through anything on your mind.",
        sender: "bot",
        awaitResponse: true
      },
      {
        text: "What other questions do you have about implementing strategies?",
        sender: "bot",
        awaitResponse: true
      },
      {
        text: "Thank you for sharing! Is there any specific concern or challenge you’d like to talk about?",
        sender: "bot",
        awaitResponse: true
      },
      {
        text: "Thanks for bringing that up. Here are some suggestions that might help. [Provide targeted advice or resources based on the parent’s specific concerns]",
        sender: "bot",
      },
    ],
    jointPlanning: [
      {
        text: "Let’s make a plan together for next time! I’ll focus on areas where we can keep improving and building on what’s going well.",
        sender: "bot",
      },
      {
        text: "For example, if wait time is a challenge, here’s an idea: after presenting the strategy, count to five in your head before repeating it.",
        sender: "bot",
      },
      {
        text: "Remember, I’m here to help you every step of the way. If anything new comes up, you can always reach out!",
        sender: "bot",
      },
    ],
};

app.get('/generate-dag', (req, res) => {
  const dag = `
  digraph G {
      rankdir=TB; // Top to Bottom layout

      // Default node style with fixed size
      node [shape=box style="rounded,filled" fontsize=12 fontname="Helvetica, Arial, sans-serif" width=2 height=0.8 fixedsize=true];

      // Nodes with specific colors and wrapped labels
      "Establish Joint Attention" [fillcolor=lightgrey label="Establish\\nJoint Attention"];
      "Present Strategy" [fillcolor=lightgrey label="Present\\nStrategy"];
      "Wait for Response" [fillcolor=lightgrey label="Wait for\\nResponse"];
      "Correct Response" [fillcolor=lightgreen label="Correct\\nResponse"];
      "Acknowledge and Praise" [fillcolor=lightgrey label="Acknowledge\\nand Praise"];
      "Repeat Strategy" [fillcolor=lightgrey label="Repeat\\nStrategy"];
      "Move On" [fillcolor=lightgrey label="Move On"];
      "No Response or Incorrect Response" [fillcolor=lightcoral label="No Response\\nor Incorrect\\nResponse"];

      // Edges
      "Establish Joint Attention" -> "Present Strategy";
      "Present Strategy" -> "Wait for Response";
      "Wait for Response" -> "Correct Response";
      "Wait for Response" -> "No Response or Incorrect Response";
      "No Response or Incorrect Response" -> "Repeat Strategy";
      "Repeat Strategy" -> "Move On";
      "Correct Response" -> "Acknowledge and Praise";
  }
`;

  const dot = spawn('dot', ['-Tpng']);

  dot.stdin.write(dag);
  dot.stdin.end();

  const chunks = [];
  dot.stdout.on('data', (chunk) => {
      chunks.push(chunk);
  });

  dot.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
  });

  dot.on('close', (code) => {
      if (code === 0) {
          const imageBuffer = Buffer.concat(chunks);
          res.setHeader('Content-Type', 'image/png');
          res.send(imageBuffer);
      } else {
          res.status(500).send('Error generating DAG');
      }
  });
});

app.get('/api/chat/:context', (req, res) => {
  const { context } = req.params;
  const { videoTime, fidelityScore } = req.query;

  let response = [];
  if (context === 'fidelity') {
    if (fidelityScore) {
      response = chatMessages.fidelityScore[fidelityScore] || [];
    } else {
      response = messages.filter((msg) => msg.timestamp <= parseFloat(videoTime));
    }
  } else if (chatMessages[context]) {
    response = chatMessages[context];
  }

  res.json(response);
});

app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const videoPath = req.file.path;
    const videoId = uuidv4();
    const videoUrl = `http://${HOST}:${PORT}/uploads/${req.file.filename}`;

    transcriptionStore.set(videoId, { videoUrl, transcription: null, status: "processing" });

    (async () => {
      try {
        const formData = new FormData();
        formData.append("video", fs.createReadStream(videoPath));

        const response = await axios.post(`${TRANSCRIPTION_URL}/transcribe`, formData, {
          headers: formData.getHeaders(),
        });

        transcriptionStore.set(videoId, {
          videoUrl,
          transcription: response.data.transcriptions,
          status: "completed",
        });

      } catch (error) {
        console.error(`Error during transcription for video ${videoId}:`, error.message);
        transcriptionStore.set(videoId, {
          videoUrl,
          transcription: null,
          status: "failed",
        });
      }
    })();

    res.json({ success: true, videoId, videoUrl });
  } catch (error) {
    console.error("Error during video upload:", error.message);
    res.status(500).json({ error: "Failed to upload video" });
  }
});
  
app.get('/api/transcriptions/:videoId', (req, res) => {
  const { videoId } = req.params;
  const videoTime = parseFloat(req.query.videoTime);

  if (!transcriptionStore.has(videoId)) {
    return res.status(404).json({ error: 'Transcription not found for the given video ID' });
  }

  const transcriptionData = transcriptionStore.get(videoId);

  if (!transcriptionData.transcription) {
    return res.status(200).json({ status: transcriptionData.status });
  }

  const convertToSeconds = (timeString) => {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const filteredTranscriptions = transcriptionData.transcription.filter((transcription) => {
    const startInSeconds = convertToSeconds(transcription.start);
    const endInSeconds = convertToSeconds(transcription.end);

    return startInSeconds <= videoTime && videoTime <= endInSeconds;
  });

  res.json(filteredTranscriptions);
});

app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const imageUrl = `http://${HOST}:${PORT}/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

app.get('/api/steps-timeline', (req, res) => {
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

app.get('/api/relative-positions', (req, res) => {
  const relativePositions = {
    1: { top: '6.5%', left: '50%' },
    2: { top: '23.5%', left: '50%' },
    3: { top: '40.5%', left: '50%' },
    4: { top: '58%', left: '24%' },
    5: { top: '76%', left: '24%' },
    6: { top: '58%', left: '76%' },
    7: { top: '76%', left: '76%' },
    8: { top: '93%', left: '76%' },
  };

  res.json(relativePositions);
});

app.get('/api/fidelity-messages', (req, res) => {
  const fidelityMessages = messages.map((message) => ({
      timestamp: message.timestamp,
      fidelityScore: message.fidelityScore,
      strategy: message.strategy,
  }));

  res.json(fidelityMessages);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
