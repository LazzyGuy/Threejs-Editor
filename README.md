# Requirement of the project
“An internet user should be able to open WebGL Editor (threejs) and using a built in menu/submenu, be able to run a CADQuery through  a CADQUERY engine running in a pre-packaged Docker instance in the backend. The user should be able to interactively run and parametrise such CQs. 

## Setuping up project

1. go to the root dir of the project
2. enter
   $> npm start
3. open your browser at http://localhost:8080/

##Project structure
project is running on a node server which is serving satic site from public dir,

-public
--assets (floder containing all external file)
--img
--src (main file of the project)
--styles
--test (some example of stl and json file to test)
--index.html

##Completions status
Project is completed to the level where it can render stl and json file in the scene and allow simple manipulation

##todo
a object should be able to 
