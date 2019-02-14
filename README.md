# IronClass
Owner: André Sebastion & Malte Felmy

## TODO
- Create a better README file
  - Present the project with the link and some screenshots and explanations
  - Instructions to execute the project: `git clone ...; npm install; npm run dev` and an example of a `.env` file
- On the page `GET /classes/edit/:id`, change "Add a student" by "Add a person"
- Create a file `config/hbs-helpers` to save all or most HBS helpers
- You can rename `router.post("/createclass", ...` into `router.post("/create", ...`
- Create static methods for Models, for example: `Class.checkIfAlreadyTaken` (promises)