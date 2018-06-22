const { test } = require('ava');
const httpClient = require('supertest');
const randomatic = require('randomatic');
const appFactory = require('../example/express/app');

test('Component test', async (t) => {
  const app = await appFactory();
  const request = httpClient(app);
  const id = randomatic('Aa0', 6);

  try {
    await request
      .post('/banking/card/limit')
      .send({
        uuid: id,
        amount: 1000,
      })
      .set('Content-Type', 'application/json')
      .expect(204);

    await request
      .post('/banking/card/withdrawal')
      .send({
        uuid: id,
        amount: 200,
      })
      .set('Content-Type', 'application/json')
      .expect(204);

    await request
      .post('/banking/card/repayment')
      .send({
        uuid: id,
        amount: 100,
      })
      .set('Content-Type', 'application/json')
      .expect(204);

    await request
      .get(`/banking/card/${id}`)
      .expect(200, { uuid: id, limit: 900 });

    await request
      .post('/banking/card/withdrawal')
      .send({
        uuid: id,
        amount: 901,
      })
      .set('Content-Type', 'application/json')
      .expect(400, { error: 'Not enough money' });
  } catch (e) {
    t.fail(e);
  } finally {
    t.pass();
    await app.close();
  }
});
