let questions = {}; // Vai armazenar as perguntas carregadas do JSON
let currentQuestion = 0, score = 0, timer;
let selectedQuestions = [];  // Aqui vamos armazenar as perguntas selecionadas aleatoriamente
let incorrectAnswers = [];  // Armazena as perguntas erradas

// Carrega as perguntas do arquivo questions.json
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');  // Ajuste o caminho conforme necessário
        questions = await response.json();
        selectRandomQuestions();  // Seleciona aleatoriamente 10 perguntas
    } catch (error) {
        console.error("Erro ao carregar as perguntas:", error);
    }
    nextQuestion();
}

// Função para embaralhar as perguntas e selecionar 10 aleatórias
function selectRandomQuestions() {
    // Obter a categoria selecionada
    const category = document.getElementById('category').value;

    // Verifica se a categoria selecionada é válida
    if (!questions[category]) {
        console.error("Categoria inválida.");
        return;
    }

    let questionsToUse = questions[category];

    // Função para embaralhar um array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];  // Troca os elementos
        }
    }

    // Embaralha as perguntas
    shuffle(questionsToUse);

    // Seleciona aleatoriamente 10 perguntas
    selectedQuestions = questionsToUse.slice(0, 10);
}

function startQuiz() {
    document.querySelector('#category').disabled = true;
    document.querySelector('button').disabled = true;
    document.getElementById("quiz").style.display = "block";
    loadQuestions();
}

function nextQuestion() {
    if (currentQuestion < selectedQuestions.length) {
        const question = selectedQuestions[currentQuestion]; // Acessa a pergunta atual

        document.getElementById("question").innerText = question.q;

        let optionsDiv = document.getElementById("options");
        optionsDiv.innerHTML = "";
        question.options.forEach(option => {
            let li = document.createElement("li");
            li.classList.add("list-group-item", "text-start"); // Alinha os itens à esquerda

            let input = document.createElement("input");
            input.type = "radio";
            input.name = "answer";
            input.value = option;
            input.classList.add("form-check-input", "me-2");
            input.onclick = () => selectAnswer(option);

            let label = document.createElement("label");
            label.appendChild(document.createTextNode(option));

            li.appendChild(input);
            li.appendChild(label);
            optionsDiv.appendChild(li);
        });

        startTimer();
    } else {
        endQuiz();
    }
}

let selectedAnswer = "";

function selectAnswer(option) {
    selectedAnswer = option;
}

function startTimer() {
    let timeLeft = 30;
    document.getElementById("timer").innerText = `Tempo restante: ${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = `Tempo restante: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            currentQuestion++;
            nextQuestion();
        }
    }, 1000);
}

function submitAnswer() {
    clearInterval(timer);

    const question = selectedQuestions[currentQuestion]; // Acessa a pergunta atual

    if (!selectedAnswer) {
        // Se a resposta não for selecionada, armazena como não respondida
        incorrectAnswers.push({
            question: question.q,
            selectedAnswer: "Nenhuma resposta",
            correctAnswer: question.a
        });
    } else if (selectedAnswer === question.a) {
        score++;
    } else {
        // Armazena como errada
        incorrectAnswers.push({
            question: question.q,
            selectedAnswer: selectedAnswer,
            correctAnswer: question.a
        });
    }

    currentQuestion++;
    selectedAnswer = "";
    nextQuestion();
}

function endQuiz() {
    displayCorrections();
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "block";
    document.getElementById("score").innerText = `Sua nota: ${(score / selectedQuestions.length) * 10}/10`;
    document.getElementById("incorrect-answers").style.display = "block";
}

// Função para exibir as correções
function displayCorrections() {
    let correctionsDiv = document.getElementById("incorrect-answers");
    correctionsDiv.innerHTML = "<h3>Correções das Respostas Erradas:</h3>";

    incorrectAnswers.forEach((item) => {
        let correctionCard = document.createElement("div");
        correctionCard.classList.add("card", "mb-3");
        correctionCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Pergunta: ${item.question}</h5>
                    <p class="text-start">
                        Sua resposta: <span class="text-danger">${item.selectedAnswer === "Nenhuma resposta" ? "Você não respondeu a esta pergunta" : item.selectedAnswer}</span>
                    </p>
                    <p class="text-start">Resposta correta: <span class="text-success">${item.correctAnswer}</span></p>
                </div>
            `;
        correctionsDiv.appendChild(correctionCard);
    });
}
