import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { randomBytes, scrypt as _scrypt } from 'crypto'
import { promisify } from 'util'
import { UsersService } from './users.service'

const scrypt = promisify(_scrypt)

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

  async signup(email: string, password: string) {
    const existingUsers = await this.usersService.find(email)
    if (existingUsers.length) throw new BadRequestException('Email already in use!')

    const salt = randomBytes(8).toString('hex')
    const hash = (await scrypt(password, salt, 32)) as Buffer

    const result = `${salt}.${hash.toString('hex')}`

    const user = await this.usersService.create(email, result)

    return user
  }

  async signin(email: string, password: string) {
    const [existingUser] = await this.usersService.find(email)
    if (!existingUser) throw new NotFoundException('User not found!')

    const [salt, storedHash] = existingUser.password.split('.')

    const calculatedHash = (await scrypt(password, salt, 32)) as Buffer

    if (storedHash !== calculatedHash.toString('hex')) throw new BadRequestException('Incorrect Password')

    return existingUser
  }
}
