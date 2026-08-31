const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email) {
  if (typeof email !== 'string') {
    return { error: { message: 'Please provide a valid email' } }
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { error: { message: 'Please provide a valid email' } }
  }

  return { value: normalizedEmail }
}

function validateName(name) {
  if (typeof name !== 'string') {
    return { error: { message: 'Name must be at least 2 characters' } }
  }

  const trimmedName = name.trim()

  if (trimmedName.length < 2) {
    return { error: { message: 'Name must be at least 2 characters' } }
  }

  if (trimmedName.length > 50) {
    return { error: { message: 'Name must be at most 50 characters' } }
  }

  return { value: trimmedName }
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return { error: { message: 'Password must be at least 8 characters' } }
  }

  if (password.length < 8) {
    return { error: { message: 'Password must be at least 8 characters' } }
  }

  return { value: password }
}

export { validateEmail, validateName, validatePassword }
