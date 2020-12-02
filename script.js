const PAGE_CONTENT = ["title", "inGame", "scoreReport"];
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

let timer = 0;

let renewTime = (seconds) => {
    console.log(seconds);
    document.getElementById("timer").textContent = seconds;
}

let advanceTimer = (advancedBy) => {
    return timer = timer > advancedBy-1 ? timer -= advancedBy : 0; 
}

let showPageContent = (name) => {
    PAGE_CONTENT.forEach((content)=> {
        name===content ?
        document.getElementById(content).style="display: block" :
        document.getElementById(content).style="display: none";
    })
}

let giveFeedback = (isRight) => {
    let feedback = document.getElementById("feedback");
    feedback.textContent = isRight ?  "Correct!" : "Wrong!";
    feedback.parentElement.style = "display: block";
    setTimeout(()=> {
        feedback.parentElement.style = "display: none;";
    }, 1000)
}

let toTitle = (renew) => {
    showPageContent("title");
    renew();
}

let toGame = (startQuestion, clrInt) => {
    showPageContent("inGame");
    timer = MAX_TIME;
    renewTime(timer--);
    startQuestion();
    
    return setInterval(() => {
        renewTime(timer);
        if (timer === 0) {
            clrInt();
            toScoreReport();
        }
        else {
            advanceTimer(1);
        }
    }, 1000);
}

let toNextQuestion = (current, timerId) => {
    if (current >= quizQuestions.length){
        clearInterval(timerId);
        renewTime(timer);
        toScoreReport();
        return;
    }
    
    let qa = quizQuestions[current];
    document.getElementById("inGameTitle").textContent = qa.question;
    qa.choices.forEach( (choice, i) => {
        let element = document.getElementById("choice_"+ (i+1));
        element.value = choice;
        element.textContent = (i+1) + ". " + choice;
    })
}

let toScoreReport = () => {
    showPageContent("scoreReport");
    document.getElementById("finalScore").textContent = timer;
}

let toHighScore = () => {
    console.log("to High Score");
}

(()=>{
    renewTime(0);

    let onQuestion = -1;
    let timerId;
    
    document.getElementById("startQuiz").addEventListener("click", ()=>{
        timerId = toGame(() => {
            toNextQuestion(++onQuestion, timerId);
        }, () => {
            clearInterval(timerId);
        });
    });

    let choices = document.getElementsByClassName("choice");
    
    Array.prototype.forEach.call(choices, (choice) => {
        choice.addEventListener("click", (event) => {
            let isCorrect = quizQuestions[onQuestion].answer === event.target.value;
            
            if (!isCorrect)
                advanceTimer(PENALTY);

            giveFeedback(isCorrect);
            toNextQuestion(++onQuestion, timerId);
        })
    });

    document.getElementById("backToTitle").addEventListener("click", () => {
        toTitle(() => {
            timer = 0;
            onQuestion = -1;
        })
    });
})()