# convert-lambda-to-express-dev

Development server package for [convert-lambda-to-express](https://www.npmjs.com/package/convert-lambda-to-express).

This package provides a local development server with hot-reload capabilities for testing Lambda functions locally during development.

## Installation

```bash
npm install --save-dev convert-lambda-to-express-dev
```

**Note:** This package should be installed as a dev dependency since it's only used during local development, not in production.

## Features

- 🔥 **Hot Reload** - Automatically restarts when code changes
- 🔒 **Security Headers** - Built-in Helmet middleware
- 🌐 **CORS Support** - Configurable CORS settings
- 📝 **Request Logging** - Morgan HTTP logger
- ⚡ **Fast Development** - Quick iteration without deploying

## Usage

See the [main package documentation](https://github.com/matthewkeil/convert-lambda-to-express#readme) for detailed usage instructions.

## Dependencies

This package depends on `convert-lambda-to-express` for core Lambda-to-Express conversion functionality.

The dev server uses the `Logger` interface from the core package, which is compatible with:
- **console** (default)
- **winston** (install separately if desired: `npm install winston`)
- Any custom logger with `info()` and `error()` methods

## License

MIT
