export const validateRegister = (req, res, next) => {
  const { full_name, email, password, role_id } = req.body

  if (!full_name || full_name.trim().length < 3) {
    return res.status(400).json({ message: 'Full name is required (min 3 chars)' })
  }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  if (!role_id) {
    return res.status(400).json({ message: 'Role is required' })
  }

  next()
}

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' })
  }

  next()
}
