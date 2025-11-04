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
 * Listening Module L2 Lesson 10: Farewell Message
 */
const ListeningL2Lesson10 = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const scenario = "Give a short farewell message to a colleague who is leaving the company.";

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

  const stopRecording = async () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      alert('Please record audio first.');
      return;
    }

    setIsTranscribing(true);
    setTranscript('');
    setFeedback(null);
    setShowFeedback(false);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('student_id', user?.id || '');
      formData.append('lesson_id', 'L2l10');
      formData.append('input_field', 'voiceRecording');

      const response = await fetch('http://localhost:5001/api/transcribe-audio', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const result = await response.json();
      setTranscript(result.transcript);
      console.log('Transcription:', result.transcript);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Error transcribing audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!transcript) {
      alert('Please transcribe your recording first.');
      return;
    }

    setIsLoadingFeedback(true);
    setShowFeedback(false);

    try {
      const response = await fetch('http://localhost:5001/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcript }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const result = await response.json();
      setFeedback(result);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Error analyzing your response. Please try again.');
    } finally {
      setIsLoadingFeedback(false);
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
            lesson_id: 'L2l10'
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
    setTranscript('');
    setFeedback(null);
    setShowFeedback(false);
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
            <h1>💼 Situational Communication</h1>
            <h2>Lesson 10: Farewell Message</h2>
          </div>

          <div className="instruction-box">
            <h3>Instructions:</h3>
            <p>Record your spoken response for the situation below. Use clear, polite, and confident language.</p>
          </div>

          <div className="exercise-section">
            <div className="scenario-box">
              <h3>📋 Scenario:</h3>
              <p className="scenario-text">{scenario}</p>
            </div>

            <div className="recording-section">
              <h3>🎤 Record Your Response:</h3>
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

              {audioBlob && !transcript && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button 
                    className="submit-button" 
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                    style={{ minWidth: '200px' }}
                  >
                    {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
                  </button>
                </div>
              )}

              {transcript && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ 
                    background: 'rgba(59, 130, 246, 0.05)', 
                    padding: '16px', 
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <h4 style={{ color: '#1e40af', marginBottom: '8px', fontSize: '16px' }}>📝 Your Transcription:</h4>
                    <p style={{ color: '#333', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>"{transcript}"</p>
                  </div>
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <button 
                      className="submit-button" 
                      onClick={handleGetFeedback}
                      disabled={isLoadingFeedback}
                      style={{ minWidth: '200px' }}
                    >
                      {isLoadingFeedback ? 'Analyzing...' : 'Get AI Feedback'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {showFeedback && feedback && (
              <div className="feedback-section" style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(226, 232, 240, 0.6)'
              }}>
                <h3 style={{ color: '#0a2440', marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                  🤖 AI Feedback
                </h3>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#ef4444', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                    Spelling & Grammar:
                  </h4>
                  <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {feedback.spellAndGrammar}
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#3b82f6', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                    Content Feedback:
                  </h4>
                  <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {feedback.contentFeedback}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: '#10b981', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                    Suggestions:
                  </h4>
                  <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {feedback.suggestions}
                  </p>
                </div>
              </div>
            )}

            <div className="tips-section">
              <h3>💡 Tips for Success:</h3>
              <ul>
                <li>Express appreciation</li>
                <li>Share positive memories</li>
                <li>Wish them well</li>
                <li>Keep it heartfelt</li>
              </ul>
            </div>

            <div className="example-section">
              <h3>📝 Example Response:</h3>
              <p className="example-text">
                "I wanted to take a moment to say goodbye and wish you all the best in your new role. It's been a pleasure working with you, and I'll always remember [specific memory]. You've been a great colleague and friend. Stay in touch, and I wish you every success in your future endeavors!"
              </p>
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

export default ListeningL2Lesson10;
