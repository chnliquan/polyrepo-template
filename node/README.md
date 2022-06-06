# <%= locals.name %>

<%= locals.description %>

# Getting Started

1. Installation

```bash
$ npm i <%= locals.name %> <% if (locals.cli) { %>-D<% } else { %>-S<% } %>
// or
$ yarn i <%= locals.name %>
```

2. Usage
<% if (locals.cli) { %>
```bash
Usage: <%= locals.shortName %> <command> [options]

Options:
  -v, --version                  output the current version
  -h, --help                     display help for command

Commands:

```

<% } else { %>

```ts
import <%= locals.camelize(locals.shortName) %> from '<%= locals.name %>'
```

<% } %>

<% if (locals.cli) { %>

# Commands

# Options

<% } else { %>

# API

<% } %>

# Development

1. Download

```bash
$ git clone <%= locals.gitUrl %>
```

2. Install dependencies

```bash
$ npm i
// or
$ yarn i
```

3. Watch Change

```bash
$ npm run dev
```

4. Commit semantically

https://www.conventionalcommits.org/en/v1.0.0/#summary

5. Publish

```bash
$ npm run release
```

# LICENSE

[MIT](<%= locals.gitHref %>/blob/master/LICENSE)
