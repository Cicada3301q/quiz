class Quiz {
    constructor(amount = 5) {
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.answerButtons = document.getElementById('answer-buttons');
        this.questionContainer = document.getElementById('question-container');
        this.nextButton = document.getElementById('next-button');
        this.scoreDisplay = document.getElementById('score');
        this.amount = amount;
        this.questions = [];
        this.user = new User();
        this.difficulty = 'medium'; // Default difficulty
        this.difficultyDisplay = document.getElementById('current-difficulty');
        this.displayHighScore();
        this.nextButton.addEventListener('click', () => this.nextQuestion());
        this.continueButton = document.getElementById('continue-button');
        this.continueButton.classList.add('hide'); // Explicitly hide the button on init
        this.continueButton.addEventListener('click', () => this.continueQuiz());
    }

    *questionsGenerator() {
        for (let question of this.questions) {
            yield question;
        }
    }

    async startQuiz() {
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.updateScoreDisplay();
        this.setDifficultyDisplay();
        this.nextButton.innerText = 'Next';
        this.nextButton.classList.remove('hide');
        this.continueButton.classList.add('hide'); // Hide the continue button when starting
        await this.fetchTriviaQuestions();
        this.questionIterator = this.questionsGenerator();
        this.nextQuestion(); // Now starts the quiz with generator
    }
    
    setDifficultyDisplay() {
        this.difficultyDisplay.textContent = `Difficulty: ${this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1)}`;
    }

    async fetchTriviaQuestions() {
        const apiUrl = `https://opentdb.com/api.php?amount=${this.amount}&difficulty=${this.difficulty}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch questions from the API');
            }
            const data = await response.json();
            this.questions = data.results.map(q => new Question(q));
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }

    nextQuestion() {
        const next = this.questionIterator.next();
        if (!next.done) {
            this.showQuestion(next.value);
        } else {
            this.endQuiz();
        }
    }


    showQuestion(question) {
        this.questionContainer.innerHTML = question.text;
        this.answerButtons.innerHTML = '';
        question.choices.forEach(choice => {
            const button = document.createElement('button');
            button.innerHTML = choice;
            button.classList.add('btn');
            //use bind
            button.addEventListener('click', this.checkAnswer.bind(this, choice, question.correctAnswer, button));
            this.answerButtons.appendChild(button);
        });
    
        // Initially hide the next button until an answer is chosen
        this.nextButton.classList.add('hide');
    }


    checkAnswer(chosenAnswer, correctAnswer, selectedButton) {
        const buttons = Array.from(this.answerButtons.children);
        buttons.forEach(button => {
            button.disabled = true; // Disable all buttons
            if (button.textContent === correctAnswer) {
                button.classList.add('correct'); // Highlight the correct answer
            }
        });
    
        // Check if the selected answer is correct
        if (chosenAnswer === correctAnswer) {
            this.score++;
            selectedButton.classList.add('correct'); // This might be redundant if correct answer is always marked above
        } else {
            selectedButton.classList.add('incorrect'); // Mark the selected wrong answer
        }
    
        // Show the next button only after an answer is selected
        this.nextButton.classList.remove('hide');
    
        this.updateScoreDisplay(); // Update score display
    }

    updateScoreDisplay() {
        this.scoreDisplay.textContent = `Score: ${this.score}`;
    }

    adjustDifficultyBasedOnScore() {
        if (this.score <= this.amount * 0.3) {
            this.difficulty = 'easy';
        } else if (this.score <= this.amount * 0.6) {
            this.difficulty = 'medium';
        } else {
            this.difficulty = 'hard';
        }
        this.setDifficultyDisplay();
    }

    continueQuiz() {
        this.adjustDifficultyBasedOnScore();
        this.startQuiz();
        this.continueButton.classList.add('hide'); // Hide the continue button once clicked
    }

    endQuiz() {
        alert(`Quiz Over! Your score is: ${this.score}`);
        this.nextButton.classList.add('hide'); // Ensure "Next" button is hidden at the end
        this.continueButton.classList.remove('hide'); // Correctly show "Continue" button
        this.updateHighScore();
    }

    updateHighScore() {
        // Retrieve the current high score from localStorage
        const highScore = localStorage.getItem('highScore') || 0;
    
        // Check if the current score is higher than the stored high score
        if (this.score > highScore) {
            // Update the high score in localStorage
            localStorage.setItem('highScore', this.score);
            alert(`New high score! Your score is: ${this.score}`);
        } else {
            alert(`Quiz Over! Your score is: ${this.score}. High score: ${highScore}`);
        }
    
        // Update the high score display
        this.displayHighScore();
    }

    displayHighScore() {
        const highScore = localStorage.getItem('highScore') || 0;
        // Assuming you have an element to display the high score
        document.getElementById('high-score').textContent = `High Score: ${highScore}`;
    }
}

class Question {
    constructor(data) {
        this.text = data.question;
        this.correctAnswer = data.correct_answer;
        this.choices = data.incorrect_answers.concat(this.correctAnswer);
    }
}

class User {
    constructor(username = 'Guest') {
        this.username = username;
        this.scoreHistory = [];
    }

    addToScoreHistory(score) {
        this.scoreHistory.push(score);
    }
}

// Create an instance of the Quiz class and start the quiz
const quiz = new Quiz();
quiz.startQuiz();