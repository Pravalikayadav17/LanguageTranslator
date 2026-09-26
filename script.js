// ========================================
// GET HTML ELEMENTS
// ========================================

const inputText = document.getElementById("inputText");

const sourceLanguage =
    document.getElementById("sourceLanguage");

const targetLanguage =
    document.getElementById("targetLanguage");

const translationResult =
    document.getElementById("translationResult");

const translateButton =
    document.getElementById("translateButton");

const copyButton =
    document.getElementById("copyButton");

const speakButton =
    document.getElementById("speakButton");

const clearButton =
    document.getElementById("clearButton");

const swapButton =
    document.getElementById("swapButton");

const statusMessage =
    document.getElementById("statusMessage");

const characterCount =
    document.getElementById("characterCount");

const historyList =
    document.getElementById("historyList");

const clearHistoryButton =
    document.getElementById("clearHistoryButton");

const themeButton =
    document.getElementById("themeButton");

const voiceButton =
    document.getElementById("voiceButton");

const resultSpeakButton =
    document.getElementById("resultSpeakButton");


// ========================================
// LANGUAGE NAMES
// ========================================

const languageNames = {

    en: "English",
    te: "Telugu",
    hi: "Hindi",
    ta: "Tamil",
    kn: "Kannada",
    ml: "Malayalam",
    mr: "Marathi",
    bn: "Bengali",
    gu: "Gujarati",
    pa: "Punjabi",
    fr: "French",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    ar: "Arabic",
    ru: "Russian"

};


// ========================================
// CHARACTER COUNTER
// ========================================

inputText.addEventListener("input", function () {

    characterCount.textContent =
        inputText.value.length;

});


// ========================================
// TRANSLATE BUTTON
// ========================================

translateButton.addEventListener(
    "click",
    translateText
);


// ========================================
// TRANSLATION FUNCTION
// ========================================

async function translateText() {

    const text =
        inputText.value.trim();

    const source =
        sourceLanguage.value;

    const target =
        targetLanguage.value;


    // Empty input
    if (text === "") {

        statusMessage.textContent =
            "⚠️ Please enter some text.";

        return;

    }


    // Same language
    if (source === target) {

        statusMessage.textContent =
            "⚠️ Please select different languages.";

        return;

    }


    // Loading
    statusMessage.textContent =
        "⏳ Translating...";

    translationResult.textContent =
        "Translating...";

    translateButton.disabled = true;


    try {

        /*
         * MyMemory Translation API
         *
         * Example:
         * English → Telugu
         * en|te
         */

        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" +
            encodeURIComponent(text) +
            "&langpair=" +
            encodeURIComponent(source + "|" + target);


        console.log("Translation URL:", url);


        // Send request
        const response =
            await fetch(url, {
                method: "GET"
            });


        console.log(
            "API status:",
            response.status
        );


        // Convert response
        const data =
            await response.json();


        console.log(
            "API response:",
            data
        );


        // Check HTTP error
        if (!response.ok) {

            throw new Error(
                "API HTTP error: " +
                response.status
            );

        }


        // Check API response
        if (
            !data.responseData ||
            !data.responseData.translatedText
        ) {

            throw new Error(
                "Translation was not returned by the API."
            );

        }


        // Get translation
        const translatedText =
            data.responseData.translatedText;


        // Display translation
        translationResult.textContent =
            translatedText;


        // Success
        statusMessage.textContent =
            "✅ Translation completed!";


        // Save history
        saveToHistory(
            text,
            translatedText,
            source,
            target
        );

    }


    catch (error) {

        console.error(
            "Translation Error:",
            error
        );


        translationResult.textContent =
            "Translation failed.";


        statusMessage.textContent =
            "❌ Translation service is currently unavailable. Please try again.";

    }


    finally {

        translateButton.disabled =
            false;

    }

}


// ========================================
// SAVE HISTORY
// ========================================

function saveToHistory(
    input,
    output,
    source,
    target
) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "translationHistory"
            )
        ) || [];


    const item = {

        input: input,

        output: output,

        source: source,

        target: target,

        date: new Date().toLocaleString()

    };


    history.unshift(item);


    // Keep latest 10 translations
    if (history.length > 10) {

        history.pop();

    }


    localStorage.setItem(
        "translationHistory",
        JSON.stringify(history)
    );


    displayHistory();

}


// ========================================
// DISPLAY HISTORY
// ========================================

function displayHistory() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "translationHistory"
            )
        ) || [];


    historyList.innerHTML = "";


    if (history.length === 0) {

        historyList.innerHTML = `
            <p class="empty-history">
                No translation history yet.
            </p>
        `;

        return;

    }


    history.forEach(function (item) {

        const historyItem =
            document.createElement("div");


        historyItem.className =
            "history-item";


        historyItem.innerHTML = `

            <div class="history-language">

                ${languageNames[item.source]}
                →
                ${languageNames[item.target]}

            </div>

            <div class="history-input">

                ${escapeHTML(item.input)}

            </div>

            <div class="history-output">

                ${escapeHTML(item.output)}

            </div>

        `;


        historyItem.addEventListener(
            "click",
            function () {

                inputText.value =
                    item.input;

                translationResult.textContent =
                    item.output;

                sourceLanguage.value =
                    item.source;

                targetLanguage.value =
                    item.target;

                characterCount.textContent =
                    item.input.length;

                statusMessage.textContent =
                    "📜 History item loaded.";

            }
        );


        historyList.appendChild(
            historyItem
        );

    });

}


// ========================================
// SAFE HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ========================================
// CLEAR HISTORY
// ========================================

clearHistoryButton.addEventListener(
    "click",
    function () {

        const confirmClear =
            confirm(
                "Are you sure you want to clear translation history?"
            );


        if (!confirmClear) {

            return;

        }


        localStorage.removeItem(
            "translationHistory"
        );


        displayHistory();


        statusMessage.textContent =
            "🗑️ History cleared.";

    }
);


// ========================================
// COPY
// ========================================

copyButton.addEventListener(
    "click",
    async function () {

        const text =
            translationResult.textContent.trim();


        if (
            text === "" ||
            text ===
            "Your translation will appear here..." ||
            text ===
            "Translation failed." ||
            text ===
            "Translating..."
        ) {

            statusMessage.textContent =
                "⚠️ Nothing to copy.";

            return;

        }


        try {

            await navigator.clipboard.writeText(
                text
            );


            copyButton.textContent =
                "✅ Copied!";


            statusMessage.textContent =
                "📋 Translation copied!";


            setTimeout(function () {

                copyButton.textContent =
                    "📋 Copy";

            }, 2000);

        }


        catch (error) {

            console.error(
                "Copy error:",
                error
            );


            statusMessage.textContent =
                "❌ Unable to copy.";

        }

    }
);


// ========================================
// TEXT TO SPEECH
// ========================================

function speakText(text) {

    if (
        !text ||
        text.trim() === "" ||
        text === "Translation failed."
    ) {

        statusMessage.textContent =
            "⚠️ Nothing to speak.";

        return;

    }


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang =
        targetLanguage.value;


    speech.rate = 0.9;

    speech.pitch = 1;


    window.speechSynthesis.speak(
        speech
    );


    statusMessage.textContent =
        "🔊 Speaking...";

}


speakButton.addEventListener(
    "click",
    function () {

        speakText(
            translationResult.textContent
        );

    }
);


resultSpeakButton.addEventListener(
    "click",
    function () {

        speakText(
            translationResult.textContent
        );

    }
);


// ========================================
// CLEAR
// ========================================

clearButton.addEventListener(
    "click",
    function () {

        inputText.value = "";

        translationResult.textContent =
            "Your translation will appear here...";

        characterCount.textContent =
            "0";

        statusMessage.textContent = "";

        inputText.focus();

    }
);


// ========================================
// SWAP LANGUAGES
// ========================================

swapButton.addEventListener(
    "click",
    function () {

        const oldSource =
            sourceLanguage.value;


        sourceLanguage.value =
            targetLanguage.value;


        targetLanguage.value =
            oldSource;


        const currentTranslation =
            translationResult.textContent;


        if (
            currentTranslation !==
            "Your translation will appear here..." &&
            currentTranslation !==
            "Translation failed."
        ) {

            inputText.value =
                currentTranslation;

            characterCount.textContent =
                currentTranslation.length;

            translationResult.textContent =
                "Your translation will appear here...";

        }


        statusMessage.textContent =
            "🔄 Languages swapped.";

    }
);


// ========================================
// DARK MODE
// ========================================

themeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );


        const isDark =
            document.body.classList.contains(
                "dark"
            );


        if (isDark) {

            themeButton.textContent =
                "☀️";

            localStorage.setItem(
                "theme",
                "dark"
            );

        }

        else {

            themeButton.textContent =
                "🌙";

            localStorage.setItem(
                "theme",
                "light"
            );

        }

    }
);


// Load saved theme
const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark"
    );

    themeButton.textContent =
        "☀️";

}


// ========================================
// VOICE INPUT
// ========================================

voiceButton.addEventListener(
    "click",
    startVoiceInput
);


function startVoiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        statusMessage.textContent =
            "❌ Voice input is not supported in this browser.";

        return;

    }


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        sourceLanguage.value;


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    statusMessage.textContent =
        "🎤 Listening...";


    recognition.start();


    recognition.onresult =
        function (event) {

            const speechText =
                event.results[0][0].transcript;


            inputText.value =
                speechText;


            characterCount.textContent =
                speechText.length;


            statusMessage.textContent =
                "🎤 Voice input received.";

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Voice error:",
                event
            );


            statusMessage.textContent =
                "❌ Voice input failed.";

        };

}


// ========================================
// INITIALIZE HISTORY
// ========================================

displayHistory();