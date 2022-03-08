module.exports = [
  {
    name: 'cli',
    message: 'Does the project provide a command line?',
    type: 'list',
    default: true,
    choices: [
      {
        name: 'Yes, with one command',
        value: 'single',
        source: ['./bin/<%= name %>'],
      },
      {
        name: 'Yes, with multiple command',
        value: 'multiple',
        source: ['./bin/<%= name %>'],
      },
      {
        name: 'No',
        value: 'no',
      },
    ],
  },
  {
    name: 'platform',
    message: 'Please choose the platform of your project:',
    type: 'list',
    choices: [
      {
        name: 'github',
        value: 'github',
        source: ['./.github', '.travis.yml'],
      },
      {
        name: 'gitlab',
        value: 'gitlab',
      },
    ],
  },
]
