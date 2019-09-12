require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
	Person.find({}).then(persons => {
		res.json(persons.map(person => person.toJSON()))
	})
})

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then(person => {
			res.json(person.toJSON())
		})
		.catch(error => next(error))
})

app.get('/info', (req, res) => {
	Person.countDocuments({}).then( response => {
		const people = `<h3>Phonebook has info for ${response} people</h3>`
		const date = `<h3>${new Date()}</h3>`
		res.send(`
			<div>
				${people}
				${date}
			</div>
		`)
	})
})

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then( response => {
			res.status(204).end()
		})
		.catch( error => next(error))
})

app.put('/api/persons/:id', (req,res, next) => {

	const body = req.body

	const person = {
		name: body.name,
		number: body.number
	}

	Person.findByIdAndUpdate(req.params.id, person, { new:true })
		.then(updatedPerson => {
			res.json(updatedPerson.toJSON())
		})
		.catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
	const body = req.body
	console.log(body)

	const newPhone = new Person ({
		name: body.name,
		number: body.number
	})

	newPhone.save()
		.then(person => person.toJSON())
		.then( person => res.json(person))
		.catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError' && error.kind === 'ObjectId') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})