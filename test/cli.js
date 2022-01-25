const test = require('ava')
const execa = require('execa-wrap')

test('prints tags', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--tags'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})

test('prints test names', async (t) => {
  t.plan(1)
  const result = await execa('node', ['./bin/find', '--names'], {
    filter: ['code', 'stdout'],
  })
  t.snapshot(result)
})