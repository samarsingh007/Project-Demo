import constants
import openai


def contains_trigger_word(text, triggers):
    text_lower = text.lower()
    return any(w.lower() in text_lower for w in triggers)


def split_transcript_by_words(data, triggers):
    segments = []
    current_segment = []
    trigger_active = False

    for entry in data:
        is_trigger_line = contains_trigger_word(entry['text'], triggers)

        if is_trigger_line:
            if not trigger_active:
                # Close off current segment if it exists
                if current_segment:
                    segments.append(current_segment)
                    current_segment = []
                current_segment.append(entry)
                trigger_active = True
            else:
                # Already in a trigger-active state, so just add to current segment
                current_segment.append(entry)
        else:
            # Non-trigger line
            current_segment.append(entry)
            trigger_active = False

    # Add the last segment if it's not empty
    if current_segment:
        segments.append(current_segment)
    segments_times = []
    for seg in segments:
        if seg:  # ensure the segment is not empty
            start_time = seg[0]['start']
            end_time = seg[-1]['end']
            transcript = seg
            segments_times.append({'start': start_time, 'end': end_time, 'transcript': transcript})
    return segments, segments_times


def split_transcript_by_llm(data):
    """
    Splits the transcript data into segments based on an LLM-determined
    teaching strategy classification. Consecutive lines with the same
    classification are grouped together.

    :param data: A list of dictionaries, each dict presumably has:
                 {
                   "start": <timestamp>,
                   "end": <timestamp>,
                   "text": <string>
                 }
    :return: (segments, segments_times)
             - segments: A list of segments, where each segment is
                         a list of entries (dicts).
             - segments_times: A list of dicts:
                 {
                   "start": <timestamp_of_first_entry_in_segment>,
                   "end": <timestamp_of_last_entry_in_segment>,
                   "strategy": <"Modeling" or "Mand-model" or "Time Delay" or None>,
                   "transcript": [the actual list of entries]
                 }
    """

    segments = []
    current_segment = []
    current_strategy = None

    for entry in data:
        # 1) Use LLM (or other classifier) to get the category
        strategy = classify_teaching_strategy(entry['text'])

        # 2) If strategy changes from the previous line, start a new segment
        if strategy != current_strategy:
            # If we have a running segment, finalize it
            if current_segment:
                segments.append((current_strategy, current_segment))
            # Reset for a new segment
            current_segment = [entry]
            current_strategy = strategy
        else:
            # Still the same strategy, so keep accumulating
            current_segment.append(entry)

    # After the loop, finalize the last segment (if any)
    if current_segment:
        segments.append((current_strategy, current_segment))

    # Build the more descriptive segments_times structure
    segments_times = []
    for strategy, seg in segments:
        if seg:  # ensure the segment is not empty
            start_time = seg[0]['start']
            end_time = seg[-1]['end']
            segments_times.append({
                'start': start_time,
                'end': end_time,
                'strategy': strategy,  # LLM classification
                'transcript': seg  # the actual lines
            })

    return segments, segments_times


def check_if_response(current_entry_list, next_entry):
    """
    Uses GPT-4 (via OpenAI API) to check if `next_entry['text']` is a direct
    or relevant response to the conversation contained in `current_entry_list`.
    Returns 1 if it is a response, 0 otherwise.
    """

    if not next_entry:  # Sanity check
        return 0

    # Build the conversation context from the current_entry_list
    conversation_context = ""
    for entry in current_entry_list:
        conversation_context += f"Speaker: {entry['text']}\n"

    conversation_context = conversation_context.strip()

    # We'll construct a user prompt for GPT-4. The prompt attempts to:
    # 1) Provide the conversation so far,
    # 2) Present the new text, and
    # 3) Ask GPT-4 to determine if the new text is a direct or relevant response.
    user_prompt = (
        "Below is a short conversation, followed by a new line of text. "
        "Determine if this new line is a direct response to the conversation.\n\n"
        f"Conversation:\n{conversation_context}\n\n"
        f"New line to evaluate:\n{next_entry['text']}\n\n"
        "Respond ONLY with 'Yes' or 'No', and nothing else."
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a classifier that strictly answers the question: "
                        "'Is the new line a direct or relevant response to the given conversation context?' "
                        "Answer 'Yes' or 'No' only."
                    ),
                },
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=5,  # Keep the answer short
            temperature=0,  # For deterministic output
        )

        # Extract the response text
        gpt_response_text = response["choices"][0]["message"]["content"].strip()

        # Decide based on GPT-4's "Yes" or "No"
        if gpt_response_text.lower().startswith("yes"):
            return 1
        else:
            return 0

    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return 0


def split_transcript_by_multi_llm(data, description=''):
    """
    Splits the transcript data into segments based on an LLM-determined
    teaching strategy classification. Consecutive lines with the same
    classification are grouped together.

    :param data: A list of dictionaries, each dict presumably has:
                 {
                   "start": <timestamp>,
                   "end": <timestamp>,
                   "text": <string>
                 }
    :return: (segments, segments_times)
             - segments: A list of segments, where each segment is
                         a list of entries (dicts).
             - segments_times: A list of dicts:
                 {
                   "start": <timestamp_of_first_entry_in_segment>,
                   "end": <timestamp_of_last_entry_in_segment>,
                   "strategy": <"Modeling" or "Mand-model" or "Time Delay" or None>,
                   "transcript": [the actual list of entries]
                 }
    """
    segments_list = []
    segments_times = []
    segments = []
    if_response = 0
    i = 0
    j = 0
    while i < len(data):
        current_entry = data[i]
        strategy = classify_teaching_strategy(current_entry['text'])
        # print(f"Entry: {current_entry}")
        # print(f"  -> Strategy: {strategy}")
        if "Modeling" in strategy:
            # print("Modeling")
            segments.append(current_entry)
            j = i + 1
            if j < len(data):
                if_response = check_if_response(segments, data[j])
            if j < len(data) and if_response == 1:
                # print(f"    * Found a response entry: {data[j]}")
                # i += 1 this is correct
                segments.append(data[j])
            i += 1
        elif "Mand-model" in strategy:
            # print("Mand-model")
            segments.append(current_entry)
            # 1st next line
            j = i + 1
            if j < len(data):
                next_class = classify_teaching_strategy(data[j])
                # print(f"    * Next entry Class: {next_class}")
                if ("Mand-model" not in next_class) and ("Time Delay" not in next_class):
                    # print(f"    * Found 1st response entry: {data[j]}")
                    segments.append(data[j])
                    i += 1
                    # Second next line
                    j = i + 1
                    if j < len(data):
                        next_class = classify_teaching_strategy(data[j])
                        # print(f"    * Next 2nd entry Class: {next_class}")
                        if ("Mand-model" not in next_class) and ("Time Delay" not in next_class):
                            # print(f"    * Found a response entry: {data[j]}")
                            segments.append(data[j])
                            i += 1
                            j = i + 1
                        if j < len(data): if_response = check_if_response(segments, data[j])
                        while j < len(data) and if_response == 1:
                            # print(f"    * Found a response entry: {data[j]}")
                            segments.append(data[j])
                            j += 1
                            i += 1
                            if_response = check_if_response(segments, data[j])
            i += 1
        elif "Time Delay" in strategy:
            # print("Time Delay")
            segments.append(current_entry)
            j = i + 1
            next_class = classify_teaching_strategy(data[j])
            # print(f"    * Next entry Class: {next_class}")
            if ("Mand-model" not in next_class) and ("Time Delay" not in next_class):
                if_response = check_if_response(segments, data[j])
                while j < len(data) and if_response == 1:
                    # print(f"    * Found a response entry: {data[j]}")
                    segments.append(data[j])
                    j += 1
                    i += 1
                    if_response = check_if_response(segments, data[j])
            i += 1
        else:
            # print(f"  -> Strategy: {strategy}")
            segments.append(data[i])
            i += 1
        segments_list.append((strategy, segments))
        segments = []

    for strategy, seg in segments_list:
        if seg:  # ensure the segment is not empty
            start_time = seg[0]['start']
            end_time = seg[-1]['end']
            segments_times.append({
                'start': start_time,
                'end': end_time,
                'strategy': strategy,  # LLM classification
                'transcript': seg  # the actual lines
            })

    return segments_list, segments_times


def classify_teaching_strategy(text):
    """
    Classify a single line of text into one of three categories:
    1. Modeling
    2. Mand-model
           # (e.g., “What do you want?”), a choice (e.g., “Is this an apple or a banana?”),
       # or an explicit mand (e.g., “Say ‘more please’”, “Tell me what you want”).
    3. Time Delay

    using an LLM (e.g., GPT-4).

    :param text: The line of text (string) you want to classify.
    :return: A string: "Modeling", "Mand-model", or "Time Delay".
    """
    openai.api_key = constants.OPENAI_API_KEY

    # Provide clear definitions and examples in the system prompt
    system_prompt = """
    You are an expert in classifying parent-child language intervention strategies.  
Your task is to read a snippet of text (which may span multiple lines) and categorize the **parent’s overall teaching approach** into one of three strategies:

1) **Modeling**  
   - Parent uses demonstrations (verbal or gestural) without prompting.\n\n".  
   - **Examples**:
     - Referring to a ball picture in a book, the parent says, "Blue ball!" expecting the child to imitate.
     - The parent says, "More, please," anticipating imitation.
     - The parent points to a gorilla and says, "Gorilla," expecting the child to imitate. 
   - **Non-Examples:
     - Asking, "What do you have?" (This is a Mand-Model.)
     - Saying, "Say 'gorilla.'" (This is a Mand-Model.)
     - Reading text without pointing to pictures (Not Modeling).



2) **Mand-model**  
   - If the parent is asking a question, offering choices, or telling the child to say something**, it’s **Mand-model**.
   - **includes a prompt** (a question, a choice, or a direct mand like “Say ‘X’”).  
   - No "yes/no" question, like start with 'Can' or 'Could' or "Is" or "Are". 
   - The transcript might also contain the child’s response plus an additional parent feedback line.  
   - **Examples**:
     - Ask question: "What do you have?"
     - Direct mand: "Say 'gorilla.'"
     - Ask question: “Where are the socks?” Child: “Sock.” Mom: “They go on you.”  
     - Choice: “Is this an apple or a banana?” Child: “Banana.”  
   - **Non-Examples:
    - Saying, "Ball," expecting imitation (This is Modeling).
    - Asking a "yes/no" question like, "Is this a gorilla?"
    - Start with 'Can' or 'Could', “Can you say ‘ball’?”
    - Saying, "No," expecting imitation (This is Modeling).



3) **Time Delay**  
   - A strategy in which the parent **pauses or leaves a sentence incomplete**, giving the child time (and an expectation) to respond on their own. If the parent is obviously **pausing** or leaving a blank for the child to fill in**, it’s **Time Delay**.
   - **Example**:
     - “Edwin dropped one large box of ___ on the belt,” (parent pauses for the child to say “sugar”).
     - While reading, the parent leaves a sentence incomplete and waits for the child to finish it.
     - Holding a page and looking expectantly at the child to turn it or say, "My turn!"
    - **Non-Example**:
     - Looking expectantly and saying, "Tell me what this is?" (This is Mand-Model).
     - The child initiates by saying "ball" without any prompting (No teaching strategy used).

---

**Instructions**:
1. Read the provided text, which may contain multiple parent/child turns (including time stamps or other annotations).  
2. Decide which strategy—**Modeling**, **Mand-model**, **Time Delay** or **None**—best characterizes the **parent’s primary approach** in that excerpt.  
3. When you respond, **do not** provide any extra commentary or explanation.  
4. If the text starts with "Can", "Could", "Is", or "Are", respond "None" immediately. 
   If the text starts with "What", "Where", "How", or "Say", respond "Mand-model" immediately.
5. **Only** return **one** of the following strings (exactly):  
   - `"Modeling"`  
   - `"Mand-model"`  
   - `"Time Delay"` 
   - `"None"`   
    """

    user_prompt = f"""
    Classify the following text according to the categories above:
    Text: "{text}"

    Respond only with "Modeling", "Mand-model", "Time Delay" or "None".
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.0  # 0.0 for the most deterministic response
    )

    classification = response.choices[0].message.content.strip()

    return classification


# --- Example use ---
if __name__ == "__main__":
    # Get the segments
    transcript_data = [
        {'start': '0:00', 'end': '0:00', 'text': 'Sit here.'},
        {'start': '0:01', 'end': '0:02', 'text': 'Okay.'},
        {'start': '0:02', 'end': '0:04', 'text': 'Good night, move.'},
        {'start': '0:07', 'end': '0:08', 'text': 'Can you open the book?'},
        {'start': '0:08', 'end': '0:10', 'text': 'Can you open the book?'},
        {'start': '0:10', 'end': '0:11', 'text': 'Try the page?'},
        {'start': '0:12', 'end': '0:16', 'text': 'In the great green room.'},
        {'start': '0:16', 'end': '0:20', 'text': 'There was a telephone and a red balloon.'},
        {'start': '0:21', 'end': '0:23', 'text': 'He went to the red balloon.'},
        {'start': '0:23', 'end': '0:24', 'text': 'Good words.'},
        {'start': '0:25', 'end': '0:29', 'text': 'And a picture of the picture.'},
        {'start': '0:31', 'end': '0:34', 'text': 'The cow jumping over the moon.'},
        {'start': '0:37', 'end': '0:44', 'text': 'And there were three little bears sitting on chairs.'},
        {'start': '0:45', 'end': '0:46', 'text': 'Can you count me?'},
        {'start': '0:46', 'end': '0:50', 'text': 'One, two, three.'},
        {'start': '0:52', 'end': '0:55', 'text': 'Well, just three bears.'},
        {'start': '0:57', 'end': '0:59', 'text': 'What is happening here?'},
        {'start': '1:00', 'end': '1:02', 'text': 'And a pair of mittens.'}
    ]

    result_segments, segments_times = split_transcript_by_multi_llm(transcript_data)
    # result_segments, segments_times = video_manager.split_transcript_by_words(transcript, constants.TRIGGER_WORDS)
    # Print the resulting segments and their times
    # print("\nRAW segments:")
    # for seg_info in result_segments:
    #     print(seg_info)  # (strategy, [list_of_entries])

    # print("\nSegments with times:")
    # for seg_time_info in segments_times:
    #     print(seg_time_info)

    for i, segment in enumerate(result_segments, start=1):
        print(f"Segment {i}:")
        predict_label, lines = segment
        print(f"Predict label: {predict_label}")
        for line in lines:
            print(f"  [{line['start']} - {line['end']}] {line['text']}")
        print()
    # Print the resulting segments and their times
    # for i, segment in enumerate(result_segments, start=1):
    #     print(f"Segment {i}:")
    #     for line in segment:
    #         print(f"  [{line['start']} - {line['end']}] {line['text']}")
    #     print()
    #
    # print("Segment times:")
    # for i, st in enumerate(segments_times, start=1):
    #     print(f"Segment {i}: Start={st['start']}, End={st['end']}")

"""

---

**Non-examples or ambiguous cases** should be mapped to whichever of the three categories best fits the **intention** of the parent’s utterance:
- **If the parent is providing a direct demonstration** (hoping the child will imitate the word or phrase), it’s likely **Modeling**.
- **If the parent is asking a question, offering choices, or telling the child to say something**, it’s **Mand-model**.
- **If the parent is obviously **pausing** or leaving a blank for the child to fill in**, it’s **Time Delay**.
"""

"""
system_instructions = (
        "You are an expert in classifying parent-child language intervention strategies.\n"
        "Your task is to read a snippet of text (which may span multiple lines) and "
        "categorize the parent's overall teaching approach into one of three strategies:\n\n"
        "1) Modeling\n"
        "   - Parent uses demonstrations (verbal or gestural) without prompting.\n\n"
        "2) Mand-model\n"
        "   - Includes a prompt, question, or direct 'Say X' instruction.\n\n"
        "3) Time Delay\n"
        "   - Parent deliberately pauses or leaves a sentence incomplete, waiting for the child.\n\n"
        "If the text does not clearly fit any strategy, return \"None\".\n\n"
        "When you respond, do not provide any extra commentary or explanation.\n"
        "Only return one of the following strings (exactly):\n"
        "Modeling\n"
        "Mand-model\n"
        "Time Delay\n"
        "None\n"
    )
"""