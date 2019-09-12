const mongoose = require('mongoose')

if ( process.argv.length < 3 ) {
	console.log('give password as argument')
	process.exit(1)
} else if (process.argv.length !== 3 && process.argv.length !== 5) {
	console.log('correct use: <password> <name> <phone>')
	process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://manuelba:${password}@cluster0-bz8sq.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

const Person = mongoose.model('Person', personSchema)

const createNewPerson = () => {
	const person = new Person({
		name: process.argv[3],
		number: process.argv[4],
	})

	person.save().then(response => {
		console.log(`added ${response.name} number ${response.number} to phonebook`)
		mongoose.connection.close()
	})
}

const listPersons = () => {
	Person.find({}).then(result => {
		console.log('phonebook:')
		result.forEach(person => {
			console.log(`${person.name} ${person.number}`)
		})
		mongoose.connection.close()
	})
}

if (process.argv.length === 5) {
	createNewPerson()
} else {
	listPersons()
}