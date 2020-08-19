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

  test('returns all task for the user when hitting GET /api/todo', async(done) => {
    const expected = [
      {
        id: 4,
        task: 'walk finn',
        completed: false,
        owner_id: 2,
      },
      
    ];
    const data = await fakeRequest(app)
      .get('/api/todo')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expected);
    done();
  });

  test('returns a single task for the user when hitting GET /api/todo/:id', async(done) => {
    const expected = {
      id: 4,
      task: 'walk finn',
      completed: false,
      owner_id: 2,
    };
    const data = await fakeRequest(app)
      .get('/api/todo/4')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expected);
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

  test('returns empty when get task is id that isn\'t attached to the user', async(done) => {
    const expected = '';
    
    const data = await fakeRequest(app)
      .get('/api/todo/1')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expected);
    done();
  });

  test('returns error when authorization token isn\'t present', async(done) => {
    const expected = { 'error': 'no authorization found' };
    
    const getData = await fakeRequest(app)
      .get('/api/todo')
      .expect('Content-Type', /json/)
      .expect(401);
    const postData = await fakeRequest(app)
      .post('/api/todo')
      .send(newTask)
      .expect('Content-Type', /json/)
      .expect(401);
    expect(getData.body).toEqual(expected);
    expect(postData.body).toEqual(expected);
    done();
  });
});
