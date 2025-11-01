import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiPencilLine, 
  RiFileTextLine,
  RiQuestionLine, 
  RiLogoutCircleRLine, 
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiArrowLeftLine,
  RiMicLine,
  RiStopCircleLine,
  RiPlayCircleLine
} from "react-icons/ri";
import logo from '../../assets/Logo.png';
import '../lessons/Lesson.css';
import './Listening.css';

/**
 * Listening Module L1 Lesson 4: Incorrect Verb Usage
 */
const ListeningL1Lesson4 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const navigate = useNavigate();

  const incorrectSentence = "I am agree with your opinion.";
  const correctAnswer = "I agree with your opinion.";

  useEffect(() => {
    const userData = storage.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const navigateToModule = (path) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    storage.removeUser();
    navigate('/login');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      alert('Please record your answer before submitting.');
      return;
    }

    try {
      if (user && user.id) {
        const response = await fetch('http://localhost:5001/api/lesson-complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: user.id,
            lesson_id: 'L1l4'
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(`Server error: ${result.message}`);
        }
      }
      
      alert('Lesson completed successfully! Next lesson is now unlocked.');
      navigate('/modules');
    } catch (error) {
      console.error('Error completing lesson:', error);
      alert('Recording submitted, but there was an error updating progress: ' + error.message);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setIsRecording(false);
  };

  return (
    <div className="lesson-container">
      {isMobile && sidebarVisible && (
        <div className="backdrop visible" onClick={toggleSidebar} />
      )}

      <button 
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        style={{ display: isMobile ? 'block' : 'none' }}
      >
        <RiMenuFoldLine />
      </button>

      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarVisible ? 'visible' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </button>
          <div className="logo-section">
            <img src={logo} alt="WriteEdge Logo" className="sidebar-logo" />
            {!sidebarCollapsed && <span className="logo-text">WriteEdge</span>}
          </div>
        </div>

        <nav className="nav-menu">
          <ul>
            <li className="nav-item" onClick={() => navigateToModule('/dashboard')}>
              <RiDashboardLine className="nav-icon" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </li>
            <li className="nav-item" onClick={() => navigateToModule('/profile')}>
              <RiUserLine className="nav-icon" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </li>
            <li className="nav-item active" onClick={() => navigateToModule('/modules')}>
              <RiPencilLine className="nav-icon" />
              {!sidebarCollapsed && <span>Practice</span>}
            </li>
            <li className="nav-item" onClick={() => navigateToModule('/take-test')}>
              <RiFileTextLine className="nav-icon" />
              {!sidebarCollapsed && <span>Take Test</span>}
            </li>
          </ul>
        </nav>

        <div className="bottom-menu">
          <ul>
            <li className="nav-item" onClick={() => navigateToModule('/dashboard/about')}>
              <RiQuestionLine className="nav-icon" />
              {!sidebarCollapsed && <span>About</span>}
            </li>
            <li className="nav-item" onClick={handleLogout}>
              <RiLogoutCircleRLine className="nav-icon" />
              {!sidebarCollapsed && <span>Log Out</span>}
            </li>
          </ul>
        </div>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <button className="back-button" onClick={() => navigate('/modules')}>
            <RiArrowLeftLine /> Back to Modules
          </button>
        </div>

        <div className="lesson-content">
          <div className="lesson-header">
            <h1>🎙️ Error Identification and Correction</h1>
            <h2>Lesson 4: Incorrect Verb Usage</h2>
          </div>

          <div className="instruction-box">
            <h3>Instructions:</h3>
            <p>Listen to the incorrect sentence below, identify the error, and record the correct version in your own voice.</p>
          </div>

          <div className="exercise-section">
            <div className="incorrect-sentence">
              <h3>❌ Incorrect Sentence:</h3>
              <p className="sentence-text">"{incorrectSentence}"</p>
            </div>

            <div className="recording-section">
              <h3>🎤 Record Your Correction:</h3>
              <div className="recording-controls">
                {!isRecording && !audioBlob && (
                  <button className="record-button" onClick={startRecording}>
                    <RiMicLine /> Start Recording
                  </button>
                )}
                
                {isRecording && (
                  <button className="stop-button" onClick={stopRecording}>
                    <RiStopCircleLine /> Stop Recording
                  </button>
                )}
                
                {audioBlob && !isRecording && (
                  <div className="playback-controls">
                    <button className="play-button" onClick={playRecording}>
                      <RiPlayCircleLine /> Play Recording
                    </button>
                    <button className="reset-button" onClick={handleReset}>
                      Record Again
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="correct-answer-section">
              <h3>✅ Correct Answer:</h3>
              <p className="sentence-text">"{correctAnswer}"</p>
              <div className="explanation">
                <strong>Explanation:</strong> "Agree" is a verb, not an adjective. It should not be used with "am" (to be). Simply use "I agree."
              </div>
            </div>
          </div>

          <div className="lesson-actions">
            <button 
              className="submit-button"
              onClick={handleSubmit}
              disabled={!audioBlob}
            >
              Complete Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeningL1Lesson4;
