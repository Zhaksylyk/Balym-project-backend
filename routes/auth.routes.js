const {Router} = require('express')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()


// /api/auth/register
router.post(
  '/register',
  [
    check('email', 'Қате email').isEmail(),
    check('password', 'Құпия сөздің минималды ұзындығы 6 символдан тұруы керек')
      .isLength({ min: 6 })
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Тіркелу кезіндегі деректер дұрыс емес'
      })
    }

    const {email, password} = req.body

    const candidate = await User.findOne({ email })

    if (candidate) {
      return res.status(400).json({ message: 'Мұндай падаланушы базада бұрын тіркелген' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({ email, password: hashedPassword })

    await user.save()

    res.status(201).json({ message: 'Пайдаланушы тіркелді' })

  } catch (e) {
    res.status(500).json({ message: 'Қате, әрекетті қайталап көріңіз' })
  }
})

// /api/auth/login
router.post(
  '/login',
  [
    check('email', 'Дұрыс email енгізіңіз').normalizeEmail().isEmail(),
    check('password', 'Парольді енгізіңіз').exists()
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Жүйеге кірерде қате деректер енгізілді'
      })
    }

    const {email, password} = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: 'Мұндай пайдаланушы базада жоқ' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Құпия сөзде қателік бар, дұрыс құпия сөз енгізіңіз' })
    }

    const token = jwt.sign(
      { userId: user.id },
      config.get('jwtSecret'),
      { expiresIn: '1h' }
    )

    res.json({ token, userId: user.id })

  } catch (e) {
    res.status(500).json({ message: 'Қате, әрекетті қайталап көріңіз' })
  }
})


module.exports = router
