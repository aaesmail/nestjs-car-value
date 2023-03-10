import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
  Session,
  UseGuards,
} from '@nestjs/common'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UsersService } from './users.service'
import { Serialize } from '../interceptors/serialize.interceptor'
import { UserDto } from './dtos/user.dto'
import { AuthService } from './auth.service'
import { LoginUserDto } from './dtos/login-user.dto'
import { CurrentUser } from './decorators/current-user.decorator'
import { User } from './user.entity'
import { AuthGuard } from '../guards/auth.guard'

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) { }

  // @Get('whoami')
  // whoAmI(@Session() session: any) {
  //   return this.usersService.findOne(session.userId)
  // }

  @Get('whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user
  }

  @Post('signout')
  signout(@Session() session: any) {
    session.userId = null
  }

  @Post('signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password)

    session.userId = user.id

    return user
  }

  @Post('signin')
  async signin(@Body() body: LoginUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password)

    session.userId = user.id

    return user
  }

  @Get(':id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id))

    if (!user) throw new NotFoundException(`User with ID(${id}) not found!`)

    return user
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email)
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body)
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id))
  }
}
