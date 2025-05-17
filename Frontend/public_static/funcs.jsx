import axiosInstance from './utils/axiosInstance';

// Format text with markdown-like rules
function format_text(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, "<br><code class='code_area'>$1</code><br>")
    .replace(/\n/g, "<br>");
}

// Typewriter effect with callback-based rendering
function typewriter_effect(data, onUpdate, onDone) {
  const formattedText = format_text(data);
  let i = 0;
  let temp = "";

  const interval = setInterval(() => {
    if (i < formattedText.length) {
      temp += formattedText[i];
      onUpdate(temp); // You can set innerHTML or React state with this
      i++;
    } else {
      clearInterval(interval);
      onDone && onDone(); // optional done callback
    }

    if (i % 200 === 0) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, 22);

  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

// Async delay helper
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Handles sending message to backend and updating UI
async function to_server_api(text, currentTool, onStreamUpdate, submitButton) {
  const token = localStorage.getItem("token");

  try {
    const response = await axiosInstance.post(
      "http://localhost:5000/api/chat",
      {
        message: text,
        section: currentTool,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await delay(300); // Simulate slight processing delay

    const reply = response.data.reply;
    typewriter_effect(reply, onStreamUpdate);
    return reply;
  } catch (error) {
    console.error("There was an error!", error);
    if (submitButton) submitButton.disabled = false;
    return "";
  }
}

export { format_text, typewriter_effect, to_server_api };
