import mongoose from 'mongoose'

function errorHandler(error, req, res, next) {
  console.error(error)

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.fromEntries(Object.entries(error.errors).map(([field, fieldError]) => [field, fieldError.message]))
    })
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: 'Invalid request data'
    })
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: 'A record with this value already exists'
    })
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      message: error.message
    })
  }

  res.status(500).json({
    message: 'Internal server error'
  })
}

export default errorHandler
