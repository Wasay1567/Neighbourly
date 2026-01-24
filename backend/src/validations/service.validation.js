export const validateCreateService = (req, res, next) => {
  const { title, category, price_per_hour } = req.body

  if (!title || title.trim().length < 5) {
    return res.status(400).json({ message: 'Service title must be at least 5 characters' })
  }

  if (!category || category.trim().length < 3) {
    return res.status(400).json({ message: 'Category is required' })
  }

  if (price_per_hour === undefined || price_per_hour < 0) {
    return res.status(400).json({ message: 'Valid price_per_hour is required' })
  }

  next()
}

export const validateServiceId = (req, res, next) => {
  const { id } = req.params

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid service ID' })
  }

  next()
}
