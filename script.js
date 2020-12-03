// Refresh timer on HTML page
const refreshTimerDisplay = (seconds) => {
    document.getElementById("timer").textContent = seconds;
}

// Display page with given elment id
const showPageContent = (id) => {
    PAGE_CONTENT.forEach((content) => {
        const pageContent = document.getElementById(content);

        pageContent.style = id === content ? "display: block" : "display: none";
    });
}

// Display feedback after user answers a question
const giveFeedback = (isCorrect) => {
    const feedback = document.getElementById("feedback");
    feedback.textContent = isCorrect ?  "Correct!" : "Wrong!";
    feedback.parentElement.style = "display: block";

    // Hide feedback after 1 second
    setTimeout(() => {
        feedback.parentElement.style = "display: none;";
    }, 1000)
}

// Store user's score to local storage
const renewHighscore = (init, score) => {
    let highScores = JSON.parse(localStorage.getItem("highScores"));
    highScores = highScores ? highScores : {};

    // Use Date.now() as id for score entries
    highScores[Date.now()] = {
        "init": init,
        "score": score
    }
    localStorage.setItem("highScores", JSON.stringify(highScores));
}

// Clear content within the given tag
const clearScores = (location) => {
    while (location.firstChild)
        location.removeChild(location.firstChild);
}

// Display score in the given <ul> or <ol> tag
const displayScoresOn = (location) => {
    const locElemType = location.nodeName.toLowerCase();
    
    if (locElemType !== "ul" && locElemType !== "ol")
        throw new Error("Invalid HTML Element Type. Expects <ul> or <ol>.");

    // Get highscore from local storage. If none exist, initialize with empty object
    let highScores = JSON.parse(localStorage.getItem("highScores"));
    highScores = highScores ? highScores : {};

    // Get sorted highscore keys used for later iteration
    const hsKeys = Object.keys(highScores).sort((key1, key2) => {
        const score1 = highScores[key1].score;
        const score2 = highScores[key2].score;
        
        if (score1 === null || score2 === null)
            throw new Error("Invalid entry saved in highScores.");

        return score1 > score2 ? -1 : (score1 < score2 ? 1 : 0);
    });

    // Iterate highscore keys. Create <li> for each score entry
    hsKeys.forEach((id) => {
        const li = document.createElement("li");
        const init = highScores[id].init;
        const score = highScores[id].score;

        if (init === null)
            throw new Error("Invalid entry saved in highScores.");

        li.textContent = init + " - " + score;
        location.appendChild(li);
    });
}

// Change page to title
const toTitle = (resetVars) => {
    resetVars();
    refreshTimerDisplay(0);
    showPageContent("title");

    // Show header 
    document.getElementById("header").style = "visibility: visible";
}

// Change page to in-game
const toGame = (setTimer, getTimer, startQuestion, clrInt) => {
    refreshTimerDisplay(MAX_TIME);
    setTimer(MAX_TIME-1);
    startQuestion();
    showPageContent("inGame");
    
    // Start timer. Return its id for timer to be stopped outside of the current scope
    return setInterval(() => {
        refreshTimerDisplay(getTimer());

        // Clear interval and change page to score report if timer is 0, else advance the timer
        if (getTimer() === 0) {
            clrInt();
            toScoreReport(getTimer);
        }
        else {
            setTimer(getTimer()-1);
        }
    }, 1000);
}

// Replace question and choices
const toNextQuestion = (current, getTimer, timerId) => {
    // If last question is already reached, change page to score report
    if (current >= quizQuestions.length) {
        clearInterval(timerId);
        refreshTimerDisplay(getTimer());
        toScoreReport(getTimer);
        return;
    }
    
    // Get question and choices
    const qa = quizQuestions[current];

    // Replace text for question
    document.getElementById("question").textContent = qa.question;
    
    // Replace text in each choice
    qa.choices.forEach((choice, i) => {
        const ch = document.getElementById("choice_"+ (i+1));
        ch.value = choice;
        ch.textContent = (i+1) + ". " + choice;
    });
}

// Change page to score report
const toScoreReport = (getTimer) => {
    // Display score, which is the final remaining time
    document.getElementById("finalScore").textContent = getTimer();
    showPageContent("scoreReport");
}

// Change page to highscore
const toHighScore = () => {
    // Get HTML element for score list. Call displayScoresOn() to display scores in this location
    const scoreList = document.getElementById("scoreList");
    clearScores(scoreList);
    displayScoresOn(scoreList);
    showPageContent("highScores");

    // Hide header and footer
    document.getElementById("header").style = "visibility: hidden";
    document.getElementById("footer").style = "display: none";
}

(() => {
    // Keep track of the current question
    let onQuestion = -1;
    // Timer used as time limit and scoring
    let timer = 0;
    // Id for timer. Used in condition to stop a running timer
    let timerId;

    // Setter and Getter for timer
    const setTimer = (time) =>{
        timer = time >= 0 ? time : 0;
    };
    const getTimer = () => timer;

    refreshTimerDisplay(0);

    // Handle click event for "View Highscores" button in header
    document.getElementById("viewScores").addEventListener("click", () => {
        const modalScores = document.getElementById("modalScores");
        clearScores(modalScores);
        displayScoresOn(modalScores);
    });

    // Handle click event for "Start Quiz" button in title page
    document.getElementById("startQuiz").addEventListener("click", () => {
        timerId = toGame(setTimer, getTimer, () => {
            toNextQuestion(++onQuestion, getTimer, timerId);
        }, () => {
            clearInterval(timerId);
        });
    });

    const choices = document.getElementsByClassName("choice");
    
    // Handle click event for each answer choice in game
    Array.prototype.forEach.call(choices, (choice) => {
        choice.addEventListener("click", (event) => {
            const isCorrect = quizQuestions[onQuestion].answer === event.target.value;

            // If choice is wrong, advance timer by variable PENALTY
            if (!isCorrect) {
                setTimer(timer-PENALTY);
                refreshTimerDisplay(timer);
            }

            // Give feedback
            giveFeedback(isCorrect);
            // Call the next question
            toNextQuestion(++onQuestion, getTimer, timerId);
        });
    });

    // Handle input event for "initials" input field in score report page
    document.getElementById("initials").addEventListener("input", (event) => {
        // Disable button if no input
        document.getElementById("submitScore").disabled = event.target.value === "" ? true: false;
    });

    // Handle click event for "Submit" button in score report page
    document.getElementById("submitScore").addEventListener("click", () => {
        // Return if character length does not meet expectation
        const initials = document.getElementById("initials");
        if (initials.value === ""){
            return;
        }
        else if (initials.value.length > 10) {
            initials.value = "";
            alert("Please enter initials with less than 10 characters.");
            return;
        }
        // Save highscore
        renewHighscore(initials.value, timer);
        // clear input field value
        initials.value = "";
        // Change page to highscore page
        toHighScore();
    });

    // Handle click event for "Go Back" button in highscore page
    document.getElementById("backToTitle").addEventListener("click", () => {
        toTitle(() => {
            // Reset timer and onQuestion variables
            timer = 0;
            onQuestion = -1;
        });
    });

    // Handle click event for "Clear Highscores" button in highscore page
    document.getElementById("clearScores").addEventListener("click", () => {
        // Remove "highscores" from local storage if exists. Clear highscores from score list and modal scores
        if (localStorage.getItem("highScores")) {
            localStorage.removeItem("highScores");
            clearScores(document.getElementById("scoreList"));
            clearScores(document.getElementById("modalScores"));
        }
    });
})()