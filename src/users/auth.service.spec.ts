import { Test } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { User } from './user.entity'
import { UsersService } from './users.service'

describe('AuthService', () => {
  let service: AuthService
  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    const users: User[] = []

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email)
        return Promise.resolve(filteredUsers)
      },
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 999999), email, password } as User
        users.push(user)
        return Promise.resolve(user)
      }
    }

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        }
      ]
    }).compile()

    service = module.get(AuthService)
  })

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined()
  })

  it('created a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf')

    expect(user.password).not.toEqual('asdf')
    const [salt, hash] = user.password.split('.')
    expect(salt).toBeDefined()
    expect(hash).toBeDefined()
  })

  it('throws an error if user signs up with email that is already in use', async () => {
    await service.signup('asdf@asdf.com', 'asdasd')

    await expect(service.signup('asdf@asdf.com', 'asdasd')).rejects.toThrow(BadRequestException)
  })

  it('throws an error if signin is called with unused email', async () => {
    await expect(service.signin('a@a.com', 'asd')).rejects.toThrow(NotFoundException)
  })

  it('throws if an invalid password is provided', async () => {
    await service.signup('b@b.com', 'password1')

    await expect(service.signin('b@b.com', 'password2')).rejects.toThrow(BadRequestException)
  })

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword')

    const user = await service.signin('asdf@asdf.com', 'mypassword')

    expect(user).toBeDefined()
  })
})
