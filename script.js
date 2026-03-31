const messageInput = document.querySelector(".message-input");
//create message element with dynamic classes and return it 
const createMessageElement = (content, classes) => {
    const div = document.createElement("div");
    div.classList.add("message", classes);
    div.innerHTML = content;
    return div;
}
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