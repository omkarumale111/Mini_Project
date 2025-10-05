import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDetails.css';

const StudentDetails = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    schoolCollege: '',
    gradeYear: '',
    classTeacherName: '',
    interests: '',
    goals: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setError('User session not found. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:5001/api/save-student-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user in localStorage to indicate profile is complete
        const updatedUser = { ...user, profileComplete: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Navigate to student dashboard
        navigate('/dashboard');
      } else {
        setError(data.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow user to skip profile setup and go to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="student-details-container">
      <div className="student-details-card">
        <div className="header-section">
          <h1>Complete Your Profile</h1>
          <p>Help us personalize your learning experience</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="student-details-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Enter your first name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="schoolCollege">School/College</label>
              <input
                type="text"
                id="schoolCollege"
                name="schoolCollege"
                value={formData.schoolCollege}
                onChange={handleInputChange}
                placeholder="Enter your school or college name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gradeYear">Grade/Year</label>
              <input
                type="text"
                id="gradeYear"
                name="gradeYear"
                value={formData.gradeYear}
                onChange={handleInputChange}
                placeholder="e.g., Grade 10, 2nd Year"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="classTeacherName">Class Teacher Name</label>
            <input
              type="text"
              id="classTeacherName"
              name="classTeacherName"
              value={formData.classTeacherName}
              onChange={handleInputChange}
              placeholder="Enter your class teacher's full name (e.g., John Smith)"
            />
            <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
              Enter the full name exactly as it appears in your teacher's profile
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="interests">Interests & Hobbies</label>
            <textarea
              id="interests"
              name="interests"
              value={formData.interests}
              onChange={handleInputChange}
              placeholder="Tell us about your interests and hobbies"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="goals">Learning Goals</label>
            <textarea
              id="goals"
              name="goals"
              value={formData.goals}
              onChange={handleInputChange}
              placeholder="What do you hope to achieve with WriteEdge?"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleSkip}
              className="skip-button"
              disabled={loading}
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentDetails;
