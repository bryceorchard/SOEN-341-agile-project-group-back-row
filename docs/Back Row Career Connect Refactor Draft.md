Refactor Proposal Draft  
Summary  
Currently the form of the Career Connect project contains many directories, and besides having sufficiently descriptive names, is still relatively unclear on functional vs non-functional/documentation directories. This need for a more readable file structure holds even if the project is eventually uploaded as a website, as this is for us, the developers to be able to easier navigate, set up and test the project.

1. Requirements

\- Product needs to maintain functionality   
\- Functions and core source files should be grouped together within an src directory   
\- Package managers, dependencies should be merged, so that startup on developper side does not require going into different directories (currently about 5-7 commands split across frontend/CareerConnect/ and backend/)  
\- reduce amount of internal README’s, attempting to simplify into 1 frontfacing primary readme & 1 internal dev README for relevant information/commands/workspace information  
\- Documentation/ should hold AI logs (move AI- Logs to documentation)  
\- Frontend/CareerConnect/ is a redundant and frontend code should be held within Frontend  
\- README file structure and setup commands to be updated according to proposed and implemented solution

2. Suggested solution: 

\-.toolversions is potentially redundant due to .nvmrc from when devs while working on 2 separate miniprojects. Test and see if it can be deleted / overtaken by nvmrc.

```
SOEN-341-agile-project-group-back-row/
├── .github/
├── docs/
│   ├── AILogs/
│   ├── ContributionLogs/
│   ├── minutes/
│   ├── Sprints/				# Still 1 Directory per Sprint
│   ├── userstories/
│   └── README.md				#Merged all internal dev READMEs
├── src/
│   ├── frontend/
│   │   ├── public/ 
│   │   ├── src/ 
│   │   ├── angular.json 
│   │   ├── package.json 
│   │   ├── tsconfig.spec.json 
│   │   ├── tsconfig.app.json 
│   │   └── tsconfig.json 
│   ├── backend/
│       ├── db/ 
│       ├── scripts/ 
│       ├── src/ 				#REQUIRES A RENAME
│ 	  ├── test/ 
│ 	  └── package.json 
├── package.json 				# new: npm workspaces root 
├── package-lock.json 			# single merged lockfile 
├── .nvmrc 					# moved from backend, now repo-wide 
├── .gitignore 				# merged version of spread gitignores 
├── LICENSE					
└── README.md				
```

