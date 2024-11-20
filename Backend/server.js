const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 5000;
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

const upload = multer({
  dest: 'uploads/',
});

const transcriptions = [
  { timestamp: 8, text: "What is that?" },
  { timestamp: 9, text: "That's the question." },
  { timestamp: 12, text: "So I think she was already telling you like something about the monkey because she's signing it, but maybe you didn't catch it in the tunnel." },
  { timestamp: 20, text: "I love it. Now you've waited long enough, just like from the flow chart steps, and you repeated the same question because the steps as, have joint attention, present your strategy, wait at least 3 seconds, and then your feedback will go on to two different branches. One, you get a correct response, you acknowledge it. If you don't get a response or you get an incorrect response, you repeat the same exact question one more time." },
  { timestamp: 40, text: "Now she's both gesturing and vocalizing. Here you go. See, you asked the same question two times, and now she was able to articulate it in a better way. I will accept her response in the first one. It wasn't clear, it probably wasn't clear to you either, but you repeated the same question to get that. So because that's what the flow chart says if you get no response or you get an incorrect response, you go through the same one more time." },
  { timestamp: 65, text: "So she signed monkey the first response, but she said a different word. And then she said the word stop, stop, stop, or said something similar to that. And I think I don't know if she was getting off task or she was thinking of something else, but I knew at the time, okay, we're close, we're almost there, but that's not the correct response." },
  { timestamp: 85, text: "Hey, what are those?" },
  { timestamp: 90, text: "Oh yeah, what are those?" },
  { timestamp: 100, text: "Again, the reason I'm showing this because I really like that. You did the right thing. You asked the same you asked the question, what are those? She is not responding really." },
  { timestamp: 110, text: "And it's very good. You waited at least, I think I believe about three seconds right around there. And then you repeated the exact same question. Remember, the key is to ask the exact same question without changing it. Because once you change the question, although with good intentions to kind of clarify it, now we're losing where the question is different and the response might be different too." },
  { timestamp: 130, text: "Yeah, they are shoes. So what are those? Shoes." },
  { timestamp: 145, text: "My point here is, sometimes children will not respond to you in your first question because they may need some time to process, positively. And they may need that same question one more time because it kind of helps them understand that there's a question and then I need to think about the answer or I need to think about your response and how I'll respond." },
  { timestamp: 180, text: "Same thing in modeling. Let's say you were modeling shoes, not asking a question about shoes. You just literally say, shoes. [pause 3 seconds] No response. Shoes. [pause 3 seconds] No response. Shoes and I'll move on. But if you said shoes, [pause 3 seconds] no response. Shoes. And she imitates and says, shoes. Yes, shoes. This is how I will respond." },
  { timestamp: 200, text: "So same idea with modeling and men model while the same idea, same amount of waiting in terms of three seconds." },
  { timestamp: 240, text: "So remember one of the steps, the step one in asking a question or modeling something is to have joined the thing attention. That's one example of no joint attention. Because she physically shows no interest. That's clearly there's no joint attention." },
  { timestamp: 270, text: "We see what does he do that?" },
  { timestamp: 290, text: "So I will not ask that question at that moment. It happens with me, it happens with everyone. I will just, that's an example that I just saw. I'm like, oh, I should point it out and let them in and out." },
  { timestamp: 310, text: "Oh, I should point it out and let them in and out. Like I wouldn't ask it once you're right there. Instead, I will probably focus on getting her attention back." },
  { timestamp: 330, text: "So I was using it incorrectly. I was trying, I was attempting to use the man modeling as an attention was this, which is not one of the strategies." },
];

const messages = [
  { 
      text: "Pay closer attention to non-verbal cues, such as signing or gestures, especially when your child is engaged in activities that may make verbal communication difficult, like being inside a tunnel.", 
      sender: 'bot', 
      timestamp: 88, 
      fidelityScore: 3
    },
    { 
      text: "You're effectively following the intervention flowchart steps by establishing joint attention, presenting your strategy, and waiting for at least 3 seconds.\n\nAfter repeating the question, your response should branch into two outcomes: if you receive a correct response, acknowledge and reinforce it; if no response or an incorrect response occurs, repeat the exact question once more. This structured repetition helps the child understand and engage while providing clarity in your feedback process.", 
      sender: 'bot', 
      timestamp: 96, 
      fidelityScore: 4
    },
    { 
      text: "The child is now both gesturing and vocalizing, showing progress in her communication. You followed the correct procedure by repeating the question after receiving an unclear response, allowing her to articulate more effectively on the second attempt.\n\nWhile the initial response may have been acceptable despite being unclear, your decision to repeat the question aligns with the flowchart guidelines: if no response or an unclear response is given, repeat the question once more to support clearer communication and reinforce understanding.", 
      sender: 'bot', 
      timestamp: 100, 
      fidelityScore: 4
    },
    { 
      text: "You followed an effective approach by waiting approximately 3 seconds after asking the initial question and then repeating the exact same question when there was no response.\n\nThis consistency is key—by not altering the question, you maintained clarity and avoided introducing potential confusion.\n\nChanging the question, even with good intentions, could shift the child's focus and lead to a different response. Sticking to the original question allows for a more accurate follow-through in the flowchart process, keeping the intervention on track.", 
      sender: 'bot', 
      timestamp: 103, 
      fidelityScore: 4
    },
    { 
      text: "It's important to recognize that some children may need extra time to process and respond to questions. By repeating the same question after a 3-second pause, you give the child time to understand, process their response, and express it. This is especially crucial for children with developmental delays, such as those with Down syndrome or autism, who may require additional time for both comprehension and expressive language. Although the 3-second pause may feel lengthy for adults, it is essential for the child’s processing. You are already applying this strategy effectively by allowing this pause before repeating the question, which helps reinforce understanding and gives the child an opportunity to respond.\n\nThe same approach can be applied when modeling language: for instance, when teaching a word like 'shoes,' give the child time to process by pausing for 3 seconds before repeating the word. If the child responds, affirm their effort ('Yes, shoes!'), reinforcing their language development. Keep following this method, as it supports both comprehension and expressive language growth.\n\nWhen modeling language for your child, maintain the same 3-second wait time after each modeled phrase to give her time to process and respond. You know her vocabulary best, so tailor your modeling based on her familiarity with the material—books she's more familiar with may require fewer new words, while unfamiliar books can introduce more vocabulary.\n\nAt this stage, consider encouraging multiple-word responses to help expand her language. For example, instead of just modeling 'shoes,' you can expand to 'brown shoes' or 'blue shoes.' This helps her practice two-word utterances, which are appropriate for her developmental level. Model these expanded phrases, then wait for her to imitate. By doing this, you're helping her progress from single words to more complex speech, enhancing both her vocabulary and her ability to form more structured responses.", 
      sender: 'bot', 
      timestamp: 107, 
      fidelityScore: 3
    },
    { 
      text: "Joint attention is a critical first step in any interaction, whether you're asking a question or modeling language. If the child is not physically or mentally engaged—such as when she shows no interest—this indicates a lack of joint attention. In such moments, it's important not to proceed with asking questions or providing feedback. Instead, focus on gently redirecting her attention to the shared activity before continuing.\n\nOnce you regain her attention, avoid rushing into the next question or prompt. As you discussed previously, it's okay to let the interaction flow naturally and not feel pressured to ask a question immediately. You can hold onto that question for later or use it in the next part of the activity, such as the following pages of a book, when discussing something related to the story or illustrations. This approach helps maintain engagement and supports a more meaningful interaction when both parties are truly focused on the same thing.", 
      sender: 'bot', 
      timestamp: 112, 
      fidelityScore: 1
    },
    { 
      text: "Your approach of acknowledging and then expanding on your child's response was highly effective. When Aria responded with 'rain,' you did the right thing by first validating her response with a simple affirmation: 'Yes, rain.' This immediate acknowledgment provides positive feedback and reinforces her language use.\n\nYou then took it a step further by expanding on her single-word response, introducing a more complex sentence ('It's raining,' 'There's an umbrella,' etc.). This method not only enriches her understanding of the concept but also models more complex language structures for her. By observing your facial expressions and hearing your elaboration, Aria is absorbing more language than she might be able to express at the moment, which is a key part of her learning process.\n\nFor future interactions, you can further simplify or scaffold responses, such as adding two-word combinations ('a lot of rain,' 'umbrella and rain') to gradually build upon her current language level. This balanced approach of acknowledging, expanding, and then simplifying as needed helps nurture her language growth in a structured yet supportive way.", 
      sender: 'bot', 
      timestamp: 216, 
      fidelityScore: 4
    }
];


const chatMessages = {
  introduction: [
    {
    text: "Hi [Parent’s Name]! Let’s review your latest session with [Child’s Name]. I’m here to help you reflect on what went well, provide feedback, and work on any areas where you’d like more support. Ready to start?",
    sender: "bot",
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
      text: "Great reflections! It’s so helpful to consider both the strengths and areas to adjust. Now let’s look at some specific feedback.",
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

app.post('/upload', upload.single('video'), (req, res) => {
  const videoId = uuidv4();
  const videoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ success: true, videoId, videoUrl });
});
  
app.get('/api/transcriptions', (req, res) => {
    const videoTime = parseFloat(req.query.videoTime);
  
    if (!videoTime) {
      return res.status(400).json({ error: 'Missing videoTime query parameter' });
    }
  
    const filteredTranscriptions = transcriptions.filter(
      (transcription) => transcription.timestamp <= videoTime
    );
  
    res.json(filteredTranscriptions);
  });  

app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
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
    1: { top: '6%', left: '40%' },
    2: { top: '18%', left: '40%' },
    3: { top: '31%', left: '40%' },
    4: { top: '44%', left: '20%' },
    5: { top: '56%', left: '20%' },
    6: { top: '44%', left: '60%' },
  };

  res.json(relativePositions);
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
