const express = require("express");
const bodyParser = require('body-parser');
const morgan = require('morgan')
const app = express();
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('build'));

morgan.token('body', function (req, res) { return JSON.stringify(req.body) });
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  },
  {
    name: "Manuel Basanta",
    number: "4324234",
    id: 5
  }
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
    const person = persons.find(person => person.id === Number(req.params.id));
    if(!person) {
        res.status(404).end()
    } else {
        res.json(person)
    }
});

app.get("/info", (req, res) => {
    const people = `<h3>Phonebook has info for ${persons.length} people</h3>`;
    const date = `<h3>${new Date()}</h3>`;
    res.send(`
        <div>
            ${people}
            ${date}
        </div>
    `);
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    persons = persons.filter(person => person.id !== id);
    res.status(204).end();
})

const generateId = max => {
    return Math.floor(Math.random() * Math.floor(max));
}

app.post('/api/persons', (req, res) => {
    const body = req.body;

    if(!body.name || !body.number) res.status(404).json({error: "The name or number is missing"});

    const newPhone = {
        name: body.name,
        number: body.number,
        id: generateId(100000)
    }

    const nameNotInList = persons.every(person => person.name.toUpperCase() !== newPhone.name.toUpperCase());

    if(nameNotInList) {
        persons = persons.concat(newPhone);
        res.json(newPhone);
    } else {
        res.status(403).json({error: "name must be unique"})
    }

})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});