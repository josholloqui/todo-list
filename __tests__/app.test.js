require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('routes', () => {
  let token;

  const newTask = {
    id: 4,
    task: 'walk finn',
    completed: false,
    owner_id: 2,
  };

  beforeAll(async done => {
    execSync('npm run setup-db');
    client.connect();

    const signInData = await fakeRequest(app)
      .post('/auth/signup')
      .send({
        email: 'jon@user.com',
        password: '1234'
      });

    token = signInData.body.token;
    return done();
  });

  afterAll(done => {
    return client.end(done);
  });

  test('returns a new task in todo when creating a new todo', async(done) => {
    const data = await fakeRequest(app)
      .post('/api/todo')
      .send(newTask)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(newTask);
    done();
  });

  test('updates a single task completed from false to true', async(done) => {
    const expectation = {
      id: 4,
      task: 'walk finn',
      completed: true,
      owner_id: 2,
    };
    const updatedTask = {
      id: 4,
      task: 'walk finn',
      completed: true,
      owner_id: 2,
    };
    const data = await fakeRequest(app)
      .put('/api/todo/4')
      .send(updatedTask)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(data.body).toEqual(expectation);
    done();
  });

  test('delete a single task and return nothing', async(done) => {
    await fakeRequest(app)
      .delete('/api/todo/4')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    const data = await fakeRequest(app)
      .get('/api/todo')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual([]);
    done();
  });
  
  // test('returns all guitars for the user when hitting GET /guitars', async(done) => {
  //   const expected = [
  //     {
  //       brand_name: 'Taylor',
  //       color: 'red',
  //       id: 4,
  //       owner_id: 2,
  //       strings: 4,
  //     },
  //   ];
  //   const data = await fakeRequest(app)
  //     .get('/api/guitars')
  //     .set('Authorization', token)
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   expect(data.body).toEqual(expected);
  //   done();
  // });

  // test('returns a single guitar for the user when hitting GET /guitars/:id', async(done) => {
  //   const expected = {
  //     brand_name: 'Taylor',
  //     color: 'red',
  //     id: 4,
  //     owner_id: 2,
  //     strings: 4,
  //   };
  //   const data = await fakeRequest(app)
  //     .get('/api/guitars/4')
  //     .set('Authorization', token)
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   expect(data.body).toEqual(expected);
  //   done();
  // });
});
