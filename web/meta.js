module.exports = [
  {
    name: 'platform',
    message: 'Please choose the platform of your project:',
    type: 'list',
    choices: [
      {
        name: 'github',
        value: 'github',
        source: ['.github', '.travis.yml'],
      },
      {
        name: 'gitlab',
        value: 'gitlab',
      },
    ],
  },
]
