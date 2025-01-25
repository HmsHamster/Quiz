import React, { useState, useEffect } from "react";
import './App.css';

const QuizApp = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); 
  const [userAnswers, setUserAnswers] = useState([]); 
  const [quizData, setQuizData] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [clickedAnswer, setClickedAnswer] = useState(null); 

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch('/questions.json');
        const data = await response.json();
        setQuizData(data.quiz); 
        setLoading(false); 
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setLoading(false); 
      }
    };

    fetchQuizData();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && isQuizStarted && !showScore) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer); 
    } else if (timeLeft === 0 && isQuizStarted && !showScore) {
      handleTimeout(); 
    }
  }, [timeLeft, isQuizStarted, showScore]);

  const handleTimeout = () => {
    const currentQuestion = quizData[currentQuestionIndex];
    const feedback = {
      question: currentQuestion.question,
      userAnswer: "None",
      correctAnswer: currentQuestion.answer,
      isCorrect: false,
    };

    setUserAnswers([...userAnswers, feedback]); 
    const nextQuestion = currentQuestionIndex + 1;

    if (nextQuestion < quizData.length) {
      setTimeout(() => {
        setCurrentQuestionIndex(nextQuestion);
        setTimeLeft(10); 
        setClickedAnswer(null); 
      }, 500); 
    } else {
      setShowScore(true); 
    }
  };

  const handleAnswerOptionClick = (isCorrect, option) => {
    setClickedAnswer({ isCorrect, option }); 
    const feedback = {
      question: quizData[currentQuestionIndex].question,
      userAnswer: option,
      correctAnswer: quizData[currentQuestionIndex].answer,
      isCorrect: isCorrect,
    };

    setUserAnswers([...userAnswers, feedback]); 
    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < quizData.length) {
      setTimeout(() => {
        setCurrentQuestionIndex(nextQuestion);
        setTimeLeft(10); 
        setClickedAnswer(null); 
      }, 500); 
    } else {
      setShowScore(true);
    }
  };

  const resetQuiz = () => {
    setIsQuizStarted(false); 
    setScore(0); 
    setUserAnswers([]); 
    setCurrentQuestionIndex(0); 
    setShowScore(false); 
    setClickedAnswer(null); 
    setTimeLeft(10); 
  };

  const handleStartQuiz = () => {
    setIsQuizStarted(true); 
    setTimeLeft(10); 
    setScore(0); 
    setUserAnswers([]); 
    setCurrentQuestionIndex(0); 
    setShowScore(false); 
    setClickedAnswer(null); 
  };

  const getResponseMessage = () => {
    if (score < 4) return "Play more games, noob😞";
    if (score >= 4 && score <= 7) return "You are a gamer!🎮";
    if (score >= 8) return "Touch some grass🌿";
    return ""; 
  };

  if (loading) {
    return <div className="loading">Loading quiz data...</div>;
  }

  return (
    <div className="app">
      {!isQuizStarted ? (
        <div className="home-page">
          <h1>Are you a true gamer?</h1>
          <button onClick={handleStartQuiz}>Start Quiz</button>
        </div>
      ) : showScore ? (
        <div className="score-section">
          <h2>You scored {score} out of {quizData.length}</h2>
          <p className="response-message">{getResponseMessage()}</p>
          <div className="answers-summary">
            <h3>Your Answers:</h3>
            <ul>
              {userAnswers.map((answer, index) => (
                <li key={index} className={answer.isCorrect ? "correct" : "incorrect"}>
                  <p>
                    <strong>Q: </strong>{answer.question}
                  </p>
                  <p>
                    <strong>Your Answer: </strong>{answer.userAnswer}
                  </p>
                  <p>
                    <strong>Correct Answer: </strong>{answer.correctAnswer}
                  </p>
                  <p className="feedback">
                    {answer.isCorrect ? "Correct!" : "Incorrect!"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={resetQuiz}>Go to Start Page</button>
        </div>
      ) : (
        <>
          <div className="question-section">
            <div className="question-count">
              <span>Question {currentQuestionIndex + 1}</span>/{quizData.length}
            </div>
            <div className="question-text">
              {quizData[currentQuestionIndex].question}
            </div>
            {}
            {quizData[currentQuestionIndex].image && (
              <div className="question-image">
                <img
                  src={quizData[currentQuestionIndex].image}
                  alt="Quiz Question"
                  className="quiz-image"
                />
              </div>
            )}
          </div>
          <div className="answer-section">
            {quizData[currentQuestionIndex].options.map((option, index) => {
              let buttonClass = "";
              if (clickedAnswer) {
                if (option === clickedAnswer.option) {
                  buttonClass = clickedAnswer.isCorrect ? "correct-answer" : "incorrect-answer";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() =>
                    handleAnswerOptionClick(
                      option === quizData[currentQuestionIndex].answer,
                      option
                    )
                  }
                  className={buttonClass}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <div className="timer">
            <p>Time Left: {timeLeft} seconds</p>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizApp;