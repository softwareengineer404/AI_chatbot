const chatbody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot")
const API_url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};
const initialInputHeight = messageInput.scrollHeight;

// Create message element with dynamic classes
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Generate bot response using API
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    // Prepare API payload
    const parts = [{ text: userData.message }];
    if (userData.file.data) {
        parts.push({
            inline_data: userData.file.data,
            mime_type: userData.file.mime_type
        });
    }

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts }]
        })
    };

    try {
        const response = await fetch(API_url, requestOptions);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || "Request failed");

        const apiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text
            ?.replace(/\*\*(.*?)\*\*/g, "$1")
            .trim() || "No response";

        messageElement.innerText = apiResponseText;
    } catch (error) {
        console.error(error);
        messageElement.innerText = error.message;
        messageElement.style.color = "#ff0000";
    } finally {
        //reset user file data, removing thinking indiactor and scroll chat to bottom
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" });
    }
};

// Handle outgoing user message
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    if (!userData.message && !userData.file.data) return;
    fileUploadWrapper.classList.remove("file-uploaded");

    const messageContent = `
        <div class="message-text">${userData.message || ""}</div>
        ${userData.file.data
            ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />`
            : ""}
    `;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatbody.appendChild(outgoingMessageDiv);

    // Scroll to bottom
    chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" });

    // Reset message input and file data
    messageInput.value = "";
    userData.file = { data: null, mime_type: null };

    // Show bot thinking
    setTimeout(() => {
        const botMessageContent = `
            <img src="image copy.png" class="avatar">
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot">.</div>
                    <div class="dot">.</div>
                    <div class="dot">.</div>
                </div>
            </div>
        `;
        const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message", "thinking");
        chatbody.appendChild(incomingMessageDiv);
        chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" });

        generateBotResponse(incomingMessageDiv);
    }, 600);
};

// Send message on Enter key
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingMessage(e);
    }
});
//adjust input field height dyanamically
messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").styale.borderRadius = messageInput.scrollHeight >
    initialInputHeight ? "15px" : "32px";
})

// Handle file input change and preview the selected file
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        const base64String = e.target.result.split(",")[1];
        userData.file = {
            data: base64String,
            mime_type: file.type
        };
        fileInput.value = ""; // reset file input
    };
    reader.readAsDataURL(file);
});
//cancel file upload
fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
});
//initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
    }
});
document.querySelector(".chat-form").appendChild(picker);

// File upload button triggers hidden file input
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());

// Send button click
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));