# SOEN-341-agile-project-group-back-row: Careeer Connect
Members: Mahmoud Abdalla, Zohair Ameeri, Gene Feng, Luca Mancini, Gabriel Oliviera da Silva, Bryce Orchard 
General Responsibilities:  
  - Bryce   (Scrum lead):&emspGitHub Setup, Project Board, Labels, Team Process (Branching, PRs, DoR/DoD), Sprint Planning,  Appendix A.  
  - Gene    (Documentation):&emspREADME, Cover Page, Submission Document, Meeting Minutes Template, Upkeep, Distributed Aid other's. bugs problems.  
  - Zohair  (Requirements):&emspAI-generated 10 user stories (logged), Team brainstorm section, "Team-Generated User Stories and Features", 15+ issues with tasks  
  - Mahmoud (Backend):&emspDB schema, Auth API (signup/login), backend of profile/resume.   
  - Gabriel (Frontend):&emspRegistration/Login UI, Profile/Resume Upload UI  
  - Lucas   (Integration and QA):&enspCI setup, Tests for Both Features, Demo Prep, AI_Log structure and Contribution Log  
## Table Of Contents
1. [Project Overview] (#project-overview)  
2. [Technologies Used] (#technologies-used)  
3. [Setup Instructions] (#setup-instructions)  
4. [Proposed Features] (#proposed-features)

## Project Overview
# Problem
Job Seeking is often a very variable process split across many different mediums, whether it be online applications through multiple intermediaries, through a companies website, an in-person paper submission. Same can be said for recruitement, when trying to find a suitable candidate when many are qualified but not all are suitable. It can take many attempts with many different people/groups to properly find a job/employee suited to what one is looking for. 

# Solution: Project Description  
CareerConnect is a web-based platform designed for the ease of use of job seekers and recruiters.   By creating a profile, CareerConnect allows job-seekers to upload and manage their resumes while simultaneously managing any job application submissions and their current status. They can also search and filter for jobs.  Simultaneously recruiters can post and manage their  The ultimate goal of the platform is to simplify organization and management of users as they progress and transition through their careers and/or move through job recruitment. 

## Technologies Used
Frontend: Angular, TypeScript  
Backend: Express5(Node), SQLite (SQL)  
Authentication: Json Web Tokens (Session Management & Tokens), Bcrypt (Hashing)   
CI/CD: Github Actions  
## Setup Instruction
Prerequisites:
    git and Node Version Manager (nvm)
To set it up the following steps need to be done.   
In a Command terminal needed to set up:
1. git clone https://github.com/bryceorchard/SOEN-341-agile-project-group-back-row.git  
2. cd SOEN-341-agile-project-group-back-row/backend  
3. nvm install  
4. nvm use  
5. npm install  
6. npm test  
7. npm start  
The previous commands downloads a copy of the repository (command #1), goes into hte backend file (command #2), then installs/uses the most up to date for Node (commands #3 & #4) and Javascript (command #5). Finally commands #6 & #7 are used for the platform to test then start up the platform. 

## Proposed Features
Login Features  

