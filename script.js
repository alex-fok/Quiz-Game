const PAGE_CONTENT = ["info", "inGame"];
const MAX_TIME = 60;

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

let onQuestion = -1;
let timer = 0;
let timerId;

let showPageContent = (name) => {
    PAGE_CONTENT.forEach((content)=> {
        name===content ?
        document.getElementById(content).style="display: block" :
        document.getElementById(content).style="display: none";
    })
}

let toTitle = () => {
    showPageContent("info");
    onQuestion = -1;
    timer = 0;
}

let toNextQuestion = () => {
    if (++onQuestion >= quizQuestions.length){
        clearInterval(timerId);
        toHighScore();
    }
    else {
        let qa = quizQuestions[onQuestion];
        document.getElementById("inGameTitle").textContent = qa.question;
        qa.choices.forEach( (choice, i) => {
            let element =  document.getElementById("choice_"+ (i+1));
            element.value = choice;
            element.textContent = (i+1) + ". " + choice;
        })
    }
}

let toScore = () => {
}

let toHighScore = () => {
    console.log("to High Score");
}

let resetTimer = () => {
    timer = MAX_TIME;
}

let giveFeedback = (isRight) => {
    let feedback = document.getElementById("feedback");
    feedback.textContent = isRight ?  "Correct!" : "Wrong!";
    feedback.style = "display: block";
    setTimeout(()=> {
        feedback.style = "display: none;";
    }, 1000)
}

(()=>{
    document.getElementById("timer").textContent = timer;

    document.getElementById("startQuiz").addEventListener('click', ()=>{
        showPageContent("inGame");
        resetTimer();
        toNextQuestion();
        timerId = setInterval(()=>{
            document.getElementById("timer").textContent = timer;
            if (--timer < 0)
                clearInterval(timerId);
        }, 1000);
    })

    let choices = document.getElementsByClassName("choice");
    
    Array.prototype.forEach.call(choices, (choice)=>{
        choice.addEventListener('click', (event)=>{
            let isCorrect = quizQuestions[onQuestion].answer === event.target.value;
            
            if (!isCorrect)
                timer = timer > 9 ? timer -= 10 : 0;

            giveFeedback(isCorrect);
            
            if (onQuestion < quizQuestions.length)
                toNextQuestion();
        })
    });
})()