
const chatbody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const API_url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=$GOOGLE_API_KEY`;
const userData = {
    message: null
}
//create message element with dynamic classes and return it 
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}
const generateBotResponse = () => {

}
//handle outgoing user message
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    //create display user message
    const messageContent = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatbody.appendChild(outgoingMessageDiv);
    setTimeout(() => {
        const messageContent = `<div class="message-text"><img src="image copy.png" class="avatar">
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot">.</div>
                        <div class="dot">.</div>
                        <div class="dot">.</div>
                    </div>
                </div>`;
        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatbody.appendChild(incomingMessageDiv);
        generateBotResponse();
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
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));