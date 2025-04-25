import React, { useState } from "react";
import "./Dashboard.css";
import { ImHome3 } from "react-icons/im";
import { IoPersonCircleOutline } from "react-icons/io5";
import { GrNotes } from "react-icons/gr";
import { TiMessageTyping } from "react-icons/ti";
import { IoMdSettings, IoIosHelpCircleOutline } from "react-icons/io";
import { MdLogout, MdMenu } from "react-icons/md";
import logo from '../../assets/Logo.png';

/**
 * Dashboard component provides the main layout for authenticated users.
 * It features a collapsible sidebar for navigation, a progress chart, leaderboard,
 * and quick access to writing modules.
 */
const Dashboard = () => {
  // State to track sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Toggles the sidebar open/closed
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar navigation for main sections and user actions */}
      <div className={`sidebar ${sidebarVisible ? "" : "hidden"}`}>
        <div className="top-bar">
          <button className="sidebar-toggle1" onClick={toggleSidebar}>
            <MdMenu />
          </button>
        </div>
        <nav className="nav-menu">
          <ul>
            <li className="active">
              <ImHome3 className="menu-icon" />
              {sidebarVisible && "DASHBOARD"}
            </li>
            <li>
              <GrNotes className="menu-icon" />
              {sidebarVisible && "MODULES"}
            </li>
            <li>
              <TiMessageTyping className="menu-icon" />
              {sidebarVisible && "FEEDBACK"}
            </li>
          </ul>
        </nav>
        <div className="bottom-menu">
          <ul>
            <li>
              <IoMdSettings className="menu-icon" />
              {sidebarVisible && "SETTINGS"}
            </li>
            <li>
              <MdLogout className="menu-icon" />
              {sidebarVisible && "LOG OUT"}
            </li>
            <li>
              <IoIosHelpCircleOutline className="menu-icon" />
              {sidebarVisible && "HELP"}
            </li>
          </ul>
        </div>
      </div>

      {/* Backdrop overlays content when sidebar is open; clicking closes sidebar */}
      {sidebarVisible && <div className="backdrop" onClick={toggleSidebar}></div>}

      {/* Main content area with progress, leaderboard, and modules */}
      <div className="main-content">
        <div className="top-bar">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <MdMenu />
          </button>
          <div className="logo-group">
            <img src={logo} alt="WriteEdge Logo" className="dashboard-logo" />
            <span className="logo">WriteEdge</span>
          </div>
        </div>

        {/* Progress donut chart */}
        <div className="top-section">
          <div className="progress-section">
            <div className="content-header">
              <h1>MY PROGRESS</h1>
            </div>
            <div className="donut-chart-container">
              <div className="donut-chart" style={{ '--percentage': 70 }}>
                <div className="donut-chart-center">
                  <span>70%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard table for top users */}
          <div className="leaderboard-section">
            <h2>LEADER BOARD</h2>
            <table>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Grace Johnston</td>
                  <td>105k</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Albert Maldonado</td>
                  <td>74k</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Sallie Hunter</td>
                  <td>50k</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Dustin Terry</td>
                  <td>32k</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>Julia Mendoza</td>
                  <td>28k</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Module cards for quick access to different writing modules */}
        <div className="modules-section">
          <div className="module-card">
            <h3>Writing Essentials</h3>
            <button onClick={() => window.location.href = '/writing-essentials'}>PRACTICE</button>
          </div>
          <div className="module-card">
            <h3>Reports & Briefs</h3>
            <button>PRACTICE</button>
          </div>
          <div className="module-card">
            <h3>Email & Memos</h3>
            <button>PRACTICE</button>
          </div>
          <div className="module-card">
            <h3>Letters & Applications</h3>
            <button>PRACTICE</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
