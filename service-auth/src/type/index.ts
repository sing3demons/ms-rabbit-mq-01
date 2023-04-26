interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
}

class Register {
  name!: string
  email!: string
  password!: string
}

class Login {
  email!: string
  password!: string
}

function ResponseUser(_id: string, name: string, email: string, role: string, createdAt: Date, updatedAt: Date): User {
  return { _id, name, email, role, createdAt, updatedAt }
}

export { User, Register, Login, ResponseUser }
