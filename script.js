
const chatbody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const API_KEY = "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";
const API_url =  `https://api.openai.com/v1/chat/completions`;
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
//generate bot response using API

const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            //contents: [{
            //   parts: [ {text: userData.message} ]
            //}]
            messages: [{ role: "user", content: userData.message }],
            temperature: 0.7,
        })
    }
    try {
        //fetch bot response from API
        const response = await fetch(API_url, requestOptions);
        const data = await response.json();
        if(!response.ok)  throw new Error(data.error.message);
        //extract and display bot response text
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1).trim();
        messageElement.innerText = apiResponseText;

    } catch (error) {
        console.log(error);

    } finally {
        incomingMessageDiv.classList.remove("thinking");
    }

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
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));