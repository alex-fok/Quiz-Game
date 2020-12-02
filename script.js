const PAGE_CONTENT = ["title", "inGame", "scoreReport", "highScores"];
const MAX_TIME = 45;
const PENALTY = 10;

const quizQuestions = {
    "0": {
        question:"Commonly used data types DO NOT include: ",
        choices:["strings","booleans","alerts","numbers"],
        answer:"alerts"
    },
    "1": {
        question:"The condition in if/else statement is enclosed within ________.",
        choices:["quotes","curly brackets","parentheses","square brackets"],
        answer:"parentheses"
    },
    "2": {
        question:"Arrarys in Javascript can be used to store ________.",
        choices:["numbers and strings","other arrays","booleans","all of the above"],
        answer:"all of the above"
    },
    "3": {
        question:"String value can be enclosed within ________ when being assigned to variables",
        choices:["commas","curly brackets","quotes","parentheses"],
        answer:"quotes"
    },
    "4": {
        question:"A very useful tool used during development and debugging for printing content to debugger is: ",
        choices:["JavaScript","terminal / bash","for loop","console log"],
        answer:"console log"
    },
    "length" : 5
}

const refreshTimerDisplay = (seconds) => {
    document.getElementById("timer").textContent = seconds;
}

const showPageContent = (name) => {
    PAGE_CONTENT.forEach((content)=> {
        name===content ?
        document.getElementById(content).style="display: block" :
        document.getElementById(content).style="display: none";
    })
}

const giveFeedback = (isRight) => {
    const feedback = document.getElementById("feedback");
    feedback.textContent = isRight ?  "Correct!" : "Wrong!";
    feedback.parentElement.style = "display: block";
    setTimeout(()=> {
        feedback.parentElement.style = "display: none;";
    }, 1000)
}

const renewHighScore = (init, score) => {
    let highScores = JSON.parse(localStorage.getItem("highScores"));
    highScores = highScores ? highScores : {};
    highScores[Date.now()] = {
        "init": init,
        "score": score
    }
    localStorage.setItem("highScores", JSON.stringify(highScores));
}

const clearScoreList = () => {
    const parent = document.getElementById("scoreList");
    while (parent.firstChild)
        parent.removeChild(parent.firstChild);
}

const toTitle = (resetVars) => {
    resetVars();
    refreshTimerDisplay(0);
    showPageContent("title");
}

const toGame = (setTimer, getTimer, startQuestion, clrInt) => {
    refreshTimerDisplay(MAX_TIME);
    setTimer(MAX_TIME-1);
    startQuestion();
    showPageContent("inGame");
    
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
    if (current >= quizQuestions.length){
        clearInterval(timerId);
        refreshTimerDisplay(getTimer());
        toScoreReport(getTimer);
        return;
    }
    
    const qa = quizQuestions[current];
    document.getElementById("inGameTitle").textContent = qa.question;
    qa.choices.forEach( (choice, i) => {
        const element = document.getElementById("choice_"+ (i+1));
        element.value = choice;
        element.textContent = (i+1) + ". " + choice;
    })
}

const toScoreReport = (getTimer) => {
    document.getElementById("finalScore").textContent = getTimer();
    showPageContent("scoreReport");
}

const toHighScore = () => {
    clearScoreList();

    const highScores = JSON.parse(localStorage.getItem("highScores"));
    const hsKeys = Object.keys(highScores).sort((k1, k2)=>{
        const s1 = highScores[k1].score;
        const s2 = highScores[k2].score;
        return s1 > s2 ? -1 : (s1 < s2 ? 1 : 0);
    });

    const scoreList = document.getElementById("scoreList");
    
    hsKeys.forEach((id) => {
        const li = document.createElement("li");
        li.textContent = highScores[id].init + " - " + highScores[id].score;
        scoreList.appendChild(li);
    })

    showPageContent("highScores");
}

(()=>{
    refreshTimerDisplay(0);

    let onQuestion = -1;
    let timer = 0;
    let timerId;

    const setTimer = (time) =>{
        timer = time >= 0 ? time : 0;
    }

    const getTimer = () => timer;
    
    document.getElementById("startQuiz").addEventListener("click", ()=>{
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
            
            if (!isCorrect)
                setTimer(timer-PENALTY);

            giveFeedback(isCorrect);
            toNextQuestion(++onQuestion, getTimer, timerId);
        })
    });

    document.getElementById("submitScore").addEventListener("click", () => {
        renewHighScore(document.getElementById("initials").value, timer);
        toHighScore();
    });

    document.getElementById("backToTitle").addEventListener("click", () => {
        toTitle(() => {
            timer = 0;
            onQuestion = -1;
        })
    });

    document.getElementById("clearScores").addEventListener("click", () => {
        if (localStorage.getItem("highScores")) {
            localStorage.removeItem("highScores");
            clearScoreList();
        }
    })
})()