const messageInput = document.querySelector(".message-input");
// handle enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage) {
        console.log(userMessage);
    }
})