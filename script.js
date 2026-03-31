const messageInput = document.querySelector(".message-input");
const handleOutgoingMessage = (userMessage) => {
    const messageContent = `<div class="message-text">&{userMessage}</div>`;
    createMessageElement(messageContent, "user-message");
}
// handle enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage) {
        console.log(userMessage);
        handleOutgoingMessage(userMessage);

    }
})