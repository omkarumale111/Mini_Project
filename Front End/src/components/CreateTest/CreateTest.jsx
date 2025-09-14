import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTest.css';
import { RiAddLine, RiDeleteBin6Line, RiArrowLeftLine, RiSave3Line } from 'react-icons/ri';

const CreateTest = () => {
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ id: 1, text: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const addQuestion = () => {
    const newId = Math.max(...questions.map(q => q.id)) + 1;
    setQuestions([...questions, { id: newId, text: '' }]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id, text) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, text } : q
    ));
  };

  const generateTestCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!testName.trim()) {
      alert('Please enter a test name');
      return;
    }

    if (questions.some(q => !q.text.trim())) {
      alert('Please fill in all questions');
      return;
    }

    setIsLoading(true);

    try {
      const testData = {
        testName: testName.trim(),
        description: description.trim(),
        questions: questions.map((q, index) => ({
          text: q.text.trim(),
          order: index + 1
        })),
        teacherId: user.id
      };

      const response = await fetch('http://localhost:5001/api/create-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Test created successfully! Test Code: ${result.testCode}`);
        navigate('/manage-tests');
      } else {
        alert(result.error || 'Failed to create test');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Failed to create test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-test-container">
      <div className="create-test-header">
        <button 
          className="back-button"
          onClick={() => navigate('/teacher-dashboard')}
        >
          <RiArrowLeftLine /> Back to Dashboard
        </button>
        <h1>Create New Test</h1>
      </div>

      <form onSubmit={handleSubmit} className="create-test-form">
        <div className="test-info-section">
          <h2>Test Information</h2>
          
          <div className="form-group">
            <label htmlFor="testName">Test Name *</label>
            <input
              type="text"
              id="testName"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Enter test name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter test description (optional)"
              rows="3"
            />
          </div>
        </div>

        <div className="questions-section">
          <div className="questions-header">
            <h2>Questions</h2>
            <button 
              type="button" 
              className="add-question-btn"
              onClick={addQuestion}
            >
              <RiAddLine /> Add Question
            </button>
          </div>

          <div className="questions-list">
            {questions.map((question, index) => (
              <div key={question.id} className="question-item">
                <div className="question-header">
                  <span className="question-number">Question {index + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="remove-question-btn"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <RiDeleteBin6Line />
                    </button>
                  )}
                </div>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, e.target.value)}
                  placeholder="Enter your question here... (Students will provide 3-4 sentence paragraph answers)"
                  rows="4"
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/teacher-dashboard')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="create-btn"
            disabled={isLoading}
          >
            <RiSave3Line />
            {isLoading ? 'Creating...' : 'Create Test'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTest;
