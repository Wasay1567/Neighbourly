const ALLOWED_STATUSES = ['requested', 'confirmed', 'completed', 'cancelled']

export const validateCreateBooking = (req, res, next) => {
  const { service_id, availability_id } = req.body

  if (!service_id || isNaN(service_id)) {
    return res.status(400).json({ message: 'Valid service_id is required' })
  }

  if (!availability_id || isNaN(availability_id)) {
    return res.status(400).json({ message: 'Valid availability_id is required' })
  }

  next()
}

export const validateBookingStatusUpdate = (req, res, next) => {
  const { status } = req.body

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`
    })
  }

  next()
}

export const validateBookingId = (req, res, next) => {
  const { id } = req.params

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid booking ID' })
  }

  next()
}
