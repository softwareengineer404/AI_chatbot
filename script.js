const chatbody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const API_url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}
//create message element with dynamic classes and return it 
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}
//generate bot response using API
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: userData.message }, ...(userData.file.data ? [{ inline_data}] : userData.file[])
                    ]
                }
            ]
        })
    };

    try {
        //fetch bot response from API
        const response = await fetch(API_url, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Request failed');
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;

    } catch (error) {
        console.error(error);
        messageElement.innerText = "error.message";
        messageElement.style.color = "#ff0000";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" });
    }

}
//handle outgoing user message
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    //create display user message
    const messageContent = `
        <div class="message-text"></div>
            ${userData.file.data 
        ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` 
        : ""}
   `;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatbody.appendChild(outgoingMessageDiv);
    chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" })
    setTimeout(() => {
        const messageContent = `
            <img src="image copy.png" class="avatar">
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot">.</div>
                    <div class="dot">.</div>
                    <div class="dot">.</div>
                </div>
            </div>
        `;
        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatbody.appendChild(incomingMessageDiv);
        chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);
    }, 600);
}
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        const userMessage = messageInput.value.trim();

        if (userMessage) {
            handleOutgoingMessage(e);
            messageInput.value = "";
        }
    }
});
//handle file input change
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64String = e.target.result.split(","[1]);
        //store file data and mime type in userData for later use in API request
        userData.file = {
            data: null,
            mime_type: file.type
        }
        fileInput.value = "";
    }
    reader.readAsDataURL(file);
});
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());