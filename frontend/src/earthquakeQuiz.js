import axiosInstance from "./api"

const quizData = [
            {
                question: "As soon as you feel the shaking of an earthquake, what is the most important safety action you should take immediately?",
                options: [
                    "Stand in a doorway to brace yourself.",
                    "Run outside of the building as fast as you can.",
                    "Call emergency services immediately.",
                    "Drop to the ground, take cover under something sturdy, and hold on."
                ],
                correctAnswerIndex: 3,
                rationale: "This action protects you from being knocked over and shields your head and body from falling debris, which is the greatest danger during an earthquake."
            },
            {
                question: "If you are outdoors in a city when an earthquake starts, what is the safest thing to do?",
                options: [
                    "Run inside the nearest large building for cover.",
                    "Stand right next to a tall building for support.",
                    "Move to an open area away from buildings, streetlights, and utility wires.",
                    "Lie down flat in the middle of a busy street."
                ],
                correctAnswerIndex: 2,
                rationale: "An open space is the safest location as it minimizes the risk of being hit by falling objects from surrounding structures."
            },
            {
                question: "Which set of items is most essential for your family's earthquake emergency kit?",
                options: [
                    "Water, non-perishable food, a flashlight, and a first-aid kit.",
                    "Video games, snacks, and a comfortable pillow.",
                    "School books, extra clothes, and family photos.",
                    "A map of the city, a compass, and a tent."
                ],
                correctAnswerIndex: 0,
                rationale: "These items address the most critical needs after a disaster: hydration, nutrition, light, and medical care."
            },
            {
                question: "Once the shaking has stopped, what is one of the first things you should do?",
                options: [
                    "Start cleaning up broken glass and objects immediately.",
                    "Turn on the gas stove to see if it's working.",
                    "Cautiously check yourself and others for injuries and provide first aid if needed.",
                    "Go to sleep to recover from the stress."
                ],
                correctAnswerIndex: 2,
                rationale: "Assessing the health and safety of yourself and those around you is the most immediate priority before taking any other action."
            },
            {
                question: "Why is it a critical part of a family emergency plan to have a designated meeting place outside your neighbourhood?",
                options: [
                    "To have a place to store your emergency kits.",
                    "In case your neighbourhood is evacuated and you get separated.",
                    "Because it's likely to have better mobile phone service.",
                    "So you have a familiar place to go if your house is undamaged."
                ],
                correctAnswerIndex: 1,
                rationale: "If an entire area is cordoned off, having a pre-arranged spot further away ensures your family can reunite."
            },
            {
                question: "If you are in a moving car during an earthquake, the driver should:",
                options: [
                    "Stop the car immediately under the nearest bridge or overpass.",
                    "Speed up to get out of the area as quickly as possible.",
                    "Pull over to a clear location, stop the car, and stay inside until the shaking stops.",
                    "Get out of the car and lie down on the road."
                ],
                correctAnswerIndex: 2,
                rationale: "This action moves you away from potential falling debris, and the car itself provides some protection."
            },
            {
                question: "Smaller tremors that occur in the days and weeks after a major earthquake are called:",
                options: [
                    "Foreshocks",
                    "Aftershocks",
                    "Surface waves",
                    "Epicenters"
                ],
                correctAnswerIndex: 1,
                rationale: "These are adjustments in the earth's crust following a major quake and can cause further damage."
            },
            {
                question: "What is the best way to make a multi-story home safer *before* an earthquake?",
                options: [
                    "Secure heavy furniture, like bookcases and cabinets, to the walls.",
                    "Keep heavy items on the top shelves for easy access.",
                    "Make sure all the doors are locked.",
                    "Board up the windows before the earthquake season."
                ],
                correctAnswerIndex: 0,
                rationale: "Preventing heavy objects from toppling over is a key step in reducing injuries and damage inside a home."
            },
            {
                question: "If you are in a crowded place like a shopping mall when the shaking begins, you should:",
                options: [
                    "Immediately run for the main exit with everyone else.",
                    "Stand in the middle of the open area and wait.",
                    "Drop, cover your head with your arms, and hold on to something if possible.",
                    "Shout for help as loudly as possible."
                ],
                correctAnswerIndex: 2,
                rationale: "Even without a table, this basic action protects your vital organs and makes you a smaller target for falling debris."
            },
            {
                question: "After a strong earthquake, what is the recommended way to contact family?",
                options: [
                    "Keep calling their mobile phones until they answer.",
                    "Post on social media asking if anyone has seen them.",
                    "Send a short text message (SMS).",
                    "Drive to their house immediately to check on them."
                ],
                correctAnswerIndex: 2,
                rationale: "Text messages use less network bandwidth, so they are more likely to get through when voice networks are congested."
            }, 
        ];

        const quizContainer = document.getElementById('quiz-container');
        const progressBar = document.getElementById('progress-bar');
        const questionCounter = document.getElementById('question-counter');
        const questionText = document.getElementById('question-text');
        const answerOptionsContainer = document.getElementById('answer-options');
        const nextButton = document.getElementById('next-button');
        const quizBody = document.getElementById('quiz-body');
        const quizFooter = document.getElementById('quiz-footer');
        
        let currentQuestionIndex = 0;
        let score = 0;

        function startQuiz() {
            currentQuestionIndex = 0;
            score = 0;
            quizBody.style.display = 'block';
            quizFooter.style.display = 'flex';
            const resultsContainer = document.getElementById('results-container');
            if (resultsContainer) {
                resultsContainer.remove();
            }
            loadQuestion();
        }

        function loadQuestion() {
            // Reset state
            nextButton.style.visibility = 'hidden';
            answerOptionsContainer.innerHTML = '';
            
            const currentQuestion = quizData[currentQuestionIndex];
            
            // Update UI elements
            questionText.textContent = currentQuestion.question;
            questionCounter.textContent = `${currentQuestionIndex + 1}/${quizData.length}`;
            progressBar.style.width = `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;
            
            // Create answer option buttons
            currentQuestion.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'option';
                button.textContent = option;
                button.addEventListener('click', () => selectAnswer(index, button));
                
                // Add rationale div (hidden initially)
                const rationaleDiv = document.createElement('div');
                rationaleDiv.className = 'rationale';
                rationaleDiv.innerHTML = `
                    <svg class="check-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
                    <div>
                        <strong>That's right!</strong>
                        <div class="rationale-text">${currentQuestion.rationale}</div>
                    </div>
                `;
                button.appendChild(rationaleDiv);
                
                answerOptionsContainer.appendChild(button);
            });
        }
        
        function selectAnswer(selectedIndex, selectedButton) {
            const currentQuestion = quizData[currentQuestionIndex];
            const isCorrect = selectedIndex === currentQuestion.correctAnswerIndex;
            
            if (isCorrect) {
                score++;
                selectedButton.classList.add('correct');
            } else {
                selectedButton.classList.add('incorrect');
                // Also show the correct answer
                const correctButton = answerOptionsContainer.children[currentQuestion.correctAnswerIndex];
                correctButton.classList.add('correct');
            }
            
            // Disable all buttons
            Array.from(answerOptionsContainer.children).forEach(btn => {
                btn.classList.add('disabled');
            });
            
            // Show the next button
            nextButton.style.visibility = 'visible';
        }
        
        const showResults =  async () => {
            quizBody.style.display = 'none';
            quizFooter.style.display = 'none';

            try{
                let res = await axiosInstance.post("/student/quiz", {
                    type: "earthquake",
                    score,
                    module: true
                })

                if(res.data.success){
                    alert("You have Successfully Attempted the Quiz");
                }
                else{
                    startQuiz();
                }
            } catch(err){
                console.error(err.response?.data || err.message);
                alert("Something went wrong while submitting your quiz.");
            }
            
            const resultsHTML = `
                <div id="results-container">
                    <h2>Quiz Complete!</h2>
                    <p>You scored ${score} out of ${quizData.length}</p>
                    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><button id="restart-button">Restart Quiz</button><button id="home-button" style="background:#3a5a78;color:#fff;border:none;border-radius:4px;padding:12px 24px;font-size:1rem;font-weight:500;cursor:pointer;">Back to Modules</button></div>
                </div>
            `;
            quizContainer.insertAdjacentHTML('beforeend', resultsHTML);

            document.getElementById('restart-button').addEventListener('click', startQuiz);
            document.getElementById('home-button').addEventListener('click', () => { window.location.href = './student.html'; });
        }

        nextButton.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizData.length) {
                loadQuestion();
            } else {
                showResults();
            }
        });

        // Initial load
        startQuiz();