import React from "react";
import { DashboardIcon } from "../components/DashboardCommon";

export function ActivityView({ joinedDate, sprintReadiness }) {
  return (
    <section className="db-activity-card" id="activity">
      <div className="db-panel-header">
        <div>
          <span className="db-panel-kicker">Activity</span>
          <h3>Recent Workspace Events</h3>
        </div>
        <span className="db-panel-badge">Live audit</span>
      </div>
      <ul className="db-activity-list">
        <li className="db-activity-item">
          <span className="db-activity-icon db-activity-green"><DashboardIcon name="shield" /></span>
          <div>
            <p className="db-activity-text">Account created and verified in MongoDB</p>
            <p className="db-activity-time">{joinedDate}</p>
          </div>
        </li>
        <li className="db-activity-item">
          <span className="db-activity-icon db-activity-blue"><DashboardIcon name="profile" /></span>
          <div>
            <p className="db-activity-text">Signed in to the student operations dashboard</p>
            <p className="db-activity-time">Current session</p>
          </div>
        </li>
        <li className="db-activity-item">
          <span className="db-activity-icon db-activity-amber"><DashboardIcon name="target" /></span>
          <div>
            <p className="db-activity-text">Sprint workspace is ready for planning</p>
            <p className="db-activity-time">{sprintReadiness}% readiness score</p>
          </div>
        </li>
        <li className="db-activity-item">
          <span className="db-activity-icon db-activity-indigo"><DashboardIcon name="database" /></span>
          <div>
            <p className="db-activity-text">MongoDB collection connected</p>
            <p className="db-activity-time">student_db.students - live</p>
          </div>
        </li>
      </ul>
    </section>
  );
}

export default ActivityView;
