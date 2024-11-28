const API_URL = "https://opentdb.com/api.php";

const startGameSection = document.getElementById("startGame");
const gameBoardSection = document.getElementById("gameBoard");
const messageElement = document.querySelector(".message");
const goBackElement = document.getElementById("goBack");

let questionsInfo = {
    wrong: 0,
    correct: 0,
    nextindex: 0,
    questions: []
};

window.onload = async () => {
    if (window.location.search.includes("game=true")) {
        startGameSection.style.display = "none";
        gameBoardSection.style.display = "flex";
        goBackElement.style.display = "flex";
    } else {
        startGameSection.style.display = "flex";
        gameBoardSection.style.display = "none";
        goBackElement.style.display = "none";
    }

    let searchQrs = "";
    window.location.search.split("&").forEach(sr => {
        if (!sr.includes("any")) searchQrs += sr.startsWith("?") ? sr : "&" + sr;
    });

    if (!searchQrs.startsWith("?")) {
        messageElement.textContent = "Something wrong!";
        messageElement.style.color = "red";

        return;
    }

    const API_FULL_URL = API_URL + searchQrs;

    const questionsRes = await fetch(API_FULL_URL);
    const questions = await questionsRes.json();
    questionsInfo.questions = questions.results;

    if (questions?.response_code === 1) {
        messageElement.textContent = "No Results Could not return results. The API doesn't have enough questions for your query. (Ex. Asking for 50 Questions in a Category that only has 20.)"
        messageElement.style.color = "red";
        return;
    }

    if (questionsRes?.status == 429) {
        messageElement.textContent = "Too many requests, Try again later!";
        messageElement.style.color = "red";
    } else if (questionsRes.ok && questions.response_code === 0) {
        showQuestion();
    } else {
        messageElement.textContent = "Something wrong, Try again later!";
        messageElement.style.color = "red";
    }
}

function showQuestion() {
    const selectedQuestion = questionsInfo.questions[questionsInfo.nextindex];
    const questionsInfoElement = document.getElementById("questionsInfo");
    questionsInfoElement.style.display = "flex";
    questionsInfoElement.querySelector("span:nth-child(1)").textContent = selectedQuestion.category;
    questionsInfoElement.querySelector("span:nth-child(2)").textContent = `${questionsInfo.correct}/${questionsInfo.questions.length}`;
    questionsInfoElement.querySelector("span:nth-child(3)").textContent = selectedQuestion.difficulty.charAt(0).toUpperCase() + selectedQuestion.difficulty.slice(1);
    questionsInfoElement.querySelector("span:nth-child(3)").style.color = `var(--${selectedQuestion.difficulty})`;


    const questionElement = document.getElementById("question");
    questionElement.style.display = "block";
    messageElement.textContent = `${questionsInfo.nextindex + 1}. Question`;
    questionElement.innerHTML = selectedQuestion.question;

    const ansTFElement = document.getElementById("ansTF");
    const ans4AElement = document.getElementById("ans4A");
    if (selectedQuestion.type === "multiple") {
        ansTFElement.style.display = "none";
        ans4AElement.style.display = "grid";

        shuffleArray([...selectedQuestion.incorrect_answers, selectedQuestion.correct_answer]).forEach((qu, i) => {
            ans4AElement.querySelector(`button:nth-child(${i + 1})`).innerHTML = qu;
            // ans4AElement.querySelector(`button:nth-child(${i + 1})`).onclick = () => answerQu(qu);
        });
    } else if (selectedQuestion.type === "boolean") {
        ansTFElement.style.display = "grid";
        ans4AElement.style.display = "none";


    }
}

function answerQu(ans) {
    const selectedQuestion = questionsInfo.questions[questionsInfo.nextindex];
    if (ans === selectedQuestion.correct_answer) {
        questionsInfo.correct++;
    } else {
        questionsInfo.wrong++;
    }
    questionsInfo.nextindex++;


    const ansButtons = [...document.querySelectorAll("#ans4A button"), ...document.querySelectorAll("#ansTF button")];
    ansButtons.forEach(btn => {
        btn.disabled = true;
        btn.className = "wrongans";
        if (btn.textContent === selectedQuestion.correct_answer) {
            btn.className = "correctans";
        }
        if (btn.textContent === ans) {
            btn.classList.add("selectedans")
        }
    });

    setTimeout(() => {
        ansButtons.forEach(btn => {
            btn.disabled = false;
            btn.className = "";
        });

        if (!questionsInfo.questions[questionsInfo.nextindex]) return endGame();

        showQuestion();
    }, 3000);
}

function endGame() {
    document.getElementById("gameBoard").style.height = "0";
    document.getElementById("gameBoard").style.overflow = "hidden";

    const endGameSection = document.getElementById("endGame");
    endGameSection.style.display = "flex";

    console.log(questionsInfo);

    endGameSection.querySelector("#questionCount").textContent = questionsInfo.questions.length;
    endGameSection.querySelector("#correctCount").textContent = questionsInfo.correct;
    endGameSection.querySelector("#wrongCount").textContent = questionsInfo.wrong;
}

/**
 * IT's: FY SHUFFLE
 * @param {Array} array 
 * @returns {Array}
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}