import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('Authentication System', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('handles a signup request', async () => {
    const { body: { id, email, password } } = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(201)

    expect(id).toBeDefined()
    expect(email).toEqual('test@test.com')
    expect(password).toBeUndefined()
  })

  it('signup as a new user then get the currently logged in user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'testing@test.com', password: 'password' })
      .expect(201)

    const cookie = response.get('Set-Cookie')

    const { body: { id, email } } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200)

    expect(email).toEqual('testing@test.com')
  })
})
