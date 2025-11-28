const fs = require('fs');
const path = require('path');

// Lesson data for Module L1
const L1Lessons = [
  {
    id: 2,
    title: "Singular-Plural Mismatch",
    incorrect: "The meeting are scheduled for tomorrow.",
    correct: "The meeting is scheduled for tomorrow.",
    explanation: '"The meeting" is singular, so it requires the singular verb "is" instead of the plural "are."'
  },
  {
    id: 3,
    title: "Comparative Adjective Error",
    incorrect: "She is more smarter than her brother.",
    correct: "She is smarter than her brother.",
    explanation: '"Smarter" is already the comparative form of "smart." Using "more" with "smarter" is redundant and incorrect.'
  },
  {
    id: 4,
    title: "Incorrect Verb Usage",
    incorrect: "I am agree with your opinion.",
    correct: "I agree with your opinion.",
    explanation: '"Agree" is a verb, not an adjective. It should not be used with "am" (to be). Simply use "I agree."'
  },
  {
    id: 5,
    title: "Past Tense Error",
    incorrect: "He did not told me about the problem.",
    correct: "He did not tell me about the problem.",
    explanation: 'After "did not," use the base form of the verb "tell," not the past tense "told."'
  },
  {
    id: 6,
    title: "There Is/Are Agreement",
    incorrect: "There is five members in my team.",
    correct: "There are five members in my team.",
    explanation: '"Five members" is plural, so use "there are" instead of "there is."'
  },
  {
    id: 7,
    title: "Tense Consistency Error",
    incorrect: "My friend have completed the project yesterday.",
    correct: "My friend completed the project yesterday.",
    explanation: '"Yesterday" indicates past tense. Use simple past "completed" instead of present perfect "have completed."'
  },
  {
    id: 8,
    title: "Plural Subject Agreement",
    incorrect: "They was very tired after the journey.",
    correct: "They were very tired after the journey.",
    explanation: '"They" is plural, so use "were" instead of "was."'
  },
  {
    id: 9,
    title: "Each/Every Agreement",
    incorrect: "Each of the students have submitted their reports.",
    correct: "Each of the students has submitted their reports.",
    explanation: '"Each" is singular, so use "has" instead of "have."'
  },
  {
    id: 10,
    title: "Preposition Usage Error",
    incorrect: "The manager discussed about the issue in detail.",
    correct: "The manager discussed the issue in detail.",
    explanation: 'The verb "discuss" is transitive and doesn\'t need the preposition "about."'
  }
];

// Lesson data for Module L2
const L2Lessons = [
  {
    id: 2,
    title: "Client Meeting Update",
    scenario: "Inform your client that the meeting will be held online, as per their request.",
    tips: ["Be professional", "Acknowledge their request", "Provide clear details", "Confirm understanding"],
    example: "Dear [Client Name], Thank you for your email. As per your request, I'm pleased to confirm that our meeting will be held online via Zoom on [date] at [time]. I'll send you the meeting link shortly. Please let me know if you need any technical assistance."
  },
  {
    id: 3,
    title: "Leave Request",
    scenario: "Politely ask your manager for a short leave due to a personal reason.",
    tips: ["Be respectful", "Provide dates", "Offer to complete pending work", "Show appreciation"],
    example: "Good morning [Manager Name], I would like to request a short leave from [date] to [date] due to a personal matter. I will ensure all my pending tasks are completed before I leave, and I'm happy to brief a colleague if needed. Thank you for your understanding."
  },
  {
    id: 4,
    title: "Team Congratulations",
    scenario: "Congratulate your team on completing a major project successfully.",
    tips: ["Express genuine appreciation", "Acknowledge effort", "Celebrate achievement", "Motivate for future"],
    example: "Team, I want to take a moment to congratulate all of you on the successful completion of the [Project Name]. Your hard work, dedication, and collaboration made this possible. This achievement reflects our team's commitment to excellence. Let's keep this momentum going!"
  },
  {
    id: 5,
    title: "Delay Notification",
    scenario: "Explain to a client that their project delivery might be delayed and apologize professionally.",
    tips: ["Apologize sincerely", "Explain reason briefly", "Provide new timeline", "Offer solutions"],
    example: "Dear [Client Name], I sincerely apologize for informing you that we may experience a slight delay in delivering your project. Due to [brief reason], we need an additional [time period]. We're working diligently to minimize this delay and will keep you updated on our progress."
  },
  {
    id: 6,
    title: "New Intern Welcome",
    scenario: "Welcome a new intern joining your team for the first time.",
    tips: ["Be warm and welcoming", "Introduce yourself", "Offer support", "Set positive tone"],
    example: "Welcome to the team! We're so glad to have you here. I'm [Your Name], and I'll be working closely with you during your internship. Please don't hesitate to ask any questions – we're all here to support you. Looking forward to working together!"
  },
  {
    id: 7,
    title: "Supervisor Appreciation",
    scenario: "Thank your supervisor for guiding you during a difficult task.",
    tips: ["Be sincere", "Be specific about help received", "Express impact", "Show professionalism"],
    example: "I wanted to take a moment to thank you for your guidance on the [task name]. Your insights and support were invaluable, especially when I was facing challenges with [specific issue]. Your mentorship has helped me grow professionally, and I truly appreciate it."
  },
  {
    id: 8,
    title: "Customer Complaint Response",
    scenario: "Respond to a customer complaint politely and assure them of a quick resolution.",
    tips: ["Acknowledge issue", "Apologize", "Show empathy", "Provide solution", "Follow up"],
    example: "Dear [Customer Name], Thank you for bringing this to our attention. I sincerely apologize for the inconvenience you've experienced. I understand how frustrating this must be. I'm personally looking into this matter and will ensure it's resolved within [timeframe]. I'll keep you updated on the progress."
  },
  {
    id: 9,
    title: "Meeting Announcement",
    scenario: "Inform your team about an important meeting scheduled tomorrow morning.",
    tips: ["Be clear about time and location", "State purpose", "Request confirmation", "Be concise"],
    example: "Hi team, I wanted to inform you that we have an important meeting scheduled for tomorrow morning at 10 AM in Conference Room B. We'll be discussing [topic]. Please confirm your attendance and come prepared with any questions or updates. See you there!"
  },
  {
    id: 10,
    title: "Farewell Message",
    scenario: "Give a short farewell message to a colleague who is leaving the company.",
    tips: ["Express appreciation", "Share positive memories", "Wish them well", "Keep it heartfelt"],
    example: "I wanted to take a moment to say goodbye and wish you all the best in your new role. It's been a pleasure working with you, and I'll always remember [specific memory]. You've been a great colleague and friend. Stay in touch, and I wish you every success in your future endeavors!"
  }
];

// Template for L1 lessons (Error Identification)
const generateL1Template = (lesson) => `import React, { useState, useEffect } from 'react';
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

/**
 * Listening Module L1 Lesson ${lesson.id}: ${lesson.title}
 */
const ListeningL1Lesson${lesson.id} = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const navigate = useNavigate();

  const incorrectSentence = "${lesson.incorrect}";
  const correctAnswer = "${lesson.correct}";

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
            lesson_id: 'L1l${lesson.id}'
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(\`Server error: \${result.message}\`);
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

      <div className={\`sidebar \${sidebarCollapsed ? 'collapsed' : ''} \${sidebarVisible ? 'visible' : ''}\`}>
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
            <h2>Lesson ${lesson.id}: ${lesson.title}</h2>
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
                <strong>Explanation:</strong> ${lesson.explanation}
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

export default ListeningL1Lesson${lesson.id};
`;

// Template for L2 lessons (Situational Communication)
const generateL2Template = (lesson) => `import React, { useState, useEffect } from 'react';
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

/**
 * Listening Module L2 Lesson ${lesson.id}: ${lesson.title}
 */
const ListeningL2Lesson${lesson.id} = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const navigate = useNavigate();

  const scenario = "${lesson.scenario}";

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
            lesson_id: 'L2l${lesson.id}'
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(\`Server error: \${result.message}\`);
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

      <div className={\`sidebar \${sidebarCollapsed ? 'collapsed' : ''} \${sidebarVisible ? 'visible' : ''}\`}>
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
            <h2>Lesson ${lesson.id}: ${lesson.title}</h2>
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
            </div>

            <div className="tips-section">
              <h3>💡 Tips for Success:</h3>
              <ul>
                ${lesson.tips.map(tip => `<li>${tip}</li>`).join('\n                ')}
              </ul>
            </div>

            <div className="example-section">
              <h3>📝 Example Response:</h3>
              <p className="example-text">
                "${lesson.example}"
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

export default ListeningL2Lesson${lesson.id};
`;

// Generate all L1 lesson files
L1Lessons.forEach(lesson => {
  const content = generateL1Template(lesson);
  const filename = path.join(__dirname, 'src', 'pages', 'listening', `ListeningL1Lesson${lesson.id}.jsx`);
  fs.writeFileSync(filename, content);
  console.log(`✅ Created: ListeningL1Lesson${lesson.id}.jsx`);
});

// Generate all L2 lesson files
L2Lessons.forEach(lesson => {
  const content = generateL2Template(lesson);
  const filename = path.join(__dirname, 'src', 'pages', 'listening', `ListeningL2Lesson${lesson.id}.jsx`);
  fs.writeFileSync(filename, content);
  console.log(`✅ Created: ListeningL2Lesson${lesson.id}.jsx`);
});

console.log('\n🎉 All listening lesson files generated successfully!');
console.log('📁 Location: src/pages/listening/');
console.log('📝 Total files: 18 (9 for L1 + 9 for L2)');
