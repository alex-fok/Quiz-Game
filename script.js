const refreshTimerDisplay = (seconds) => {
    document.getElementById("timer").textContent = seconds;
}

const showPageContent = (name) => {
    PAGE_CONTENT.forEach((content) => {
        const pageContent = document.getElementById(content);

        name === content ?
        pageContent.style="display: block" :
        pageContent.style="display: none";
    });
}

const hideElement = (elem) => {
    document.getElementById(elem).style = "visibility: hidden";
}

const showElement = (elem) => {
    document.getElementById(elem).style = "visibility: visible";
}

const giveFeedback = (isCorrect) => {
    const feedback = document.getElementById("feedback");
    feedback.textContent = isCorrect ?  "Correct!" : "Wrong!";
    feedback.parentElement.style = "display: block";
    setTimeout(() => {
        feedback.parentElement.style = "display: none;";
    }, 1000)
}

const renewHighscore = (init, score) => {
    let highScores = JSON.parse(localStorage.getItem("highScores"));
    highScores = highScores ? highScores : {};
    highScores[Date.now()] = {
        "init": init,
        "score": score
    }
    localStorage.setItem("highScores", JSON.stringify(highScores));
}

const clearScores = (location) => {
    while (location.firstChild)
        location.removeChild(location.firstChild);
}

const displayScoresOn = (location) => {
    const locElemType = location.nodeName.toLowerCase();
    
    if (locElemType !== "ul" && locElemType !== "ol")
        throw new Error("Invalid HTML Element Type. Expects <ul> or <ol>.");

    let highScores = JSON.parse(localStorage.getItem("highScores"));
    highScores = highScores ? highScores : {};

    const hsKeys = Object.keys(highScores).sort((key1, key2) => {
        const score1 = highScores[key1].score;
        const score2 = highScores[key2].score;
        
        if (score1 === null || score2 === null)
            throw new Error("Invalid entry saved in highScores.");

        return score1 > score2 ? -1 : (score1 < score2 ? 1 : 0);
    });

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

const toTitle = (resetVars) => {
    resetVars();
    refreshTimerDisplay(0);
    showPageContent("title");
    showElement("header");
}

const toGame = (setTimer, getTimer, startQuestion, clrInt) => {
    refreshTimerDisplay(MAX_TIME);
    setTimer(MAX_TIME-1);
    startQuestion();
    showPageContent("inGame");
    showElement("footer");
    
    return setInterval(() => {
        refreshTimerDisplay(getTimer());
        if (getTimer() === 0) {
            clrInt();
            toScoreReport(getTimer);
        }
        else {
            setTimer(getTimer()-1);
        }
    }, 1000);
}

const toNextQuestion = (current, getTimer, timerId) => {
    if (current >= quizQuestions.length) {
        clearInterval(timerId);
        refreshTimerDisplay(getTimer());
        toScoreReport(getTimer);
        return;
    }
    
    const qa = quizQuestions[current];
    document.getElementById("question").textContent = qa.question;
    qa.choices.forEach((choice, i) => {
        const ch = document.getElementById("choice_"+ (i+1));
        ch.value = choice;
        ch.textContent = (i+1) + ". " + choice;
    });
}

const toScoreReport = (getTimer) => {
    document.getElementById("finalScore").textContent = getTimer();
    showPageContent("scoreReport");
}

const toHighScore = () => {
    const scoreList = document.getElementById("scoreList");
    clearScores(scoreList);
    displayScoresOn(scoreList);
    showPageContent("highScores");
    hideElement("header");
    hideElement("footer");
}

(() => {
    let onQuestion = -1;
    let timer = 0;
    let timerId;

    const setTimer = (time) =>{
        timer = time >= 0 ? time : 0;
    };
    const getTimer = () => timer;

    refreshTimerDisplay(0);

    document.getElementById("viewScores").addEventListener("click", () => {
        const modalScores = document.getElementById("modalScores");
        clearScores(modalScores);
        displayScoresOn(modalScores);
    });
    
    document.getElementById("startQuiz").addEventListener("click", () => {
        timerId = toGame(setTimer, getTimer, () => {
            toNextQuestion(++onQuestion, getTimer, timerId);
        }, () => {
            clearInterval(timerId);
        });
    });

    const choices = document.getElementsByClassName("choice");
    
    Array.prototype.forEach.call(choices, (choice) => {
        choice.addEventListener("click", (event) => {
            const isCorrect = quizQuestions[onQuestion].answer === event.target.value; 
            if (!isCorrect) {
                setTimer(timer-PENALTY);
                refreshTimerDisplay(timer);
            }
            giveFeedback(isCorrect);
            toNextQuestion(++onQuestion, getTimer, timerId);
        });
    });

    document.getElementById("initials").addEventListener("input", (event) => {
        document.getElementById("submitScore").disabled = event.target.value === "" ? true: false;
    });

    document.getElementById("submitScore").addEventListener("click", () => {
        const initials = document.getElementById("initials");
        if (initials.value === "")
            return;
        else if (initials.value.length > 10)
            return alert("Please enter initials with less than 10 characters.");
        
        renewHighscore(initials.value, timer);
        initials.value = "";
        toHighScore();
    });

    document.getElementById("backToTitle").addEventListener("click", () => {
        toTitle(() => {
            timer = 0;
            onQuestion = -1;
        });
    });

    document.getElementById("clearScores").addEventListener("click", () => {
        if (localStorage.getItem("highScores")) {
            localStorage.removeItem("highScores");
            clearScores(document.getElementById("scoreList"));
        }
    });
})()