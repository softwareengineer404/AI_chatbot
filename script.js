
const chatbody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
//create message element with dynamic classes and return it 
const createMessageElement = (content, classes) => {
    const div = document.createElement("div");
    div.classList.add("message", classes);
    div.innerHTML = content;
    return div;
}
//handle outgoing user message
const handleOutgoingMessage = (userMessage) => {
    //create display user message
    const messageContent = `<div class="message-text">${userMessage}</div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatbody.appendChild(outgoingMessageDiv);
}
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        const userMessage = messageInput.value.trim();

        if (userMessage) {
            handleOutgoingMessage(userMessage);
            messageInput.value = "";
        }
    }
});