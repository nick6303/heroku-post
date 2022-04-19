const { headers } = require('./setup')

const errorHelper = (res, message = null, error = null) => {
  res.writeHeader(400, headers)
  const response = {
    status: 'false',
  }
  if (message) {
    response.message = message
  }
  if (error) {
    response.error = error
  }
  res.write(JSON.stringify(response))
  res.end()
}

module.exports = errorHelper
