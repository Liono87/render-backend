const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(morgan('tiny'));

// Use morgan middleware with custom token format
app.use(
  morgan((tokens, req, res) => {
    const requestBody = req.method === 'POST' ? JSON.stringify(req.body) : '';
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      requestBody, // Log request body for POST requests
    ].join(' ');
  }),
);

// Custom Middleware
/* const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method);
  console.log('Path: ', request.path);
  console.log('Body: ', request.body);
  console.log('---');
  next();
}; */

// Middleware to parse JSON in requests
/* const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method);
  console.log('Path: ', request.path);

  if (request.method !== 'GET') {
    console.log('Body: ', request.body);
  }

  console.log('---');
  next();
}; */
//app.use(requestLogger);

app.use(express.json());

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
  {
    id: 5,
    name: 'Matt Daemon',
    number: '123-456789',
  },
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/info', (request, response) => {
  const numberOfEntries = persons.length;

  const currentTime = new Date().toString();

  const infoText = `Phonebook has info for ${numberOfEntries} people <br /> ${currentTime}`;
  response.send(infoText);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const foundPerson = persons.find((person) => person.id === id);

  if (foundPerson) {
    response.json(foundPerson);
  } else {
    //response.status(404).send('Entry not found');
    response.status(404).end();
  }
});

// DELETE endpoint
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const initialLength = persons.length;

  persons = persons.filter((person) => person.id !== id);

  if (initialLength === persons.length) {
    response.status(404).send('Entry not found');
  } else {
    response.status(204).end();
  }
});

// POST endpoint
app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body || !body.name || !body.number) {
    return response.status(400).json({ error: 'Name or Number missing' });
  }

  const duplicateName = persons.find((person) => person.name === body.name);
  if (duplicateName) {
    return response.status(400).json({ error: 'name must be unique' });
  }

  const newPerson = {
    id: generateId(), // Generate a new id for the entry
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(newPerson);

  response.json(newPerson);
});

const generateId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((person) => person.id)) : 0;
  return Math.floor(Math.random() * (10000 - maxId) + maxId + 1); // Generate a random ID
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
