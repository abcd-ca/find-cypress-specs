#!/usr/bin/env node

const arg = require('arg')
const { getSpecs } = require('../src')
const fs = require('fs')
const pluralize = require('pluralize')
const { getTestNames, formatTestList, countTags } = require('find-test-names')
const consoleTable = require('console.table')

const args = arg({
  '--names': Boolean,
  '--tags': Boolean,
  '--json': Boolean,

  // aliases
  '-n': '--names',
  '--name': '--names',
  '-t': '--tags',
  '--tag': '--tags',
  '-j': '--json',
})

const specs = getSpecs()
if (args['--names'] || args['--tags']) {
  if (!specs.length) {
    console.log('no specs found')
  } else {
    console.log('')
    let testsN = 0
    let pendingTestsN = 0

    // counts the number of tests for each tag across all specs
    const tagTestCounts = {}

    const jsonResults = {}

    specs.forEach((filename) => {
      jsonResults[filename] = []
      const source = fs.readFileSync(filename, 'utf8')
      const result = getTestNames(source, true)
      // enable if need to debug the parsed test
      // console.dir(result.structure, { depth: null })

      testsN += result.testCount
      const testCount = pluralize('test', result.testNames.length, true)
      pendingTestsN += result.pendingTestCount

      if (args['--names']) {
        if (args['--json']) {
          result.structure.forEach((t) => {
            if (t.type === 'test') {
              jsonResults[filename].push(t.name)
            } else if (t.type === 'suite') {
              jsonResults[filename].push(t.name)
            }
          })
        } else {
          if (result.pendingTestCount) {
            console.log(
              '%s (%s, %d pending)',
              filename,
              testCount,
              result.pendingTestCount,
            )
          } else {
            console.log('%s (%s)', filename, testCount)
          }
          console.log(formatTestList(result.structure))
          console.log('')
        }
      }

      if (args['--tags']) {
        const specTagCounts = countTags(result.structure)
        Object.keys(specTagCounts).forEach((tag) => {
          if (!(tag in tagTestCounts)) {
            tagTestCounts[tag] = specTagCounts[tag]
          } else {
            tagTestCounts[tag] += specTagCounts[tag]
          }
        })
      }
    })

    if (args['--names']) {
      if (args['--json']) {
        console.log(JSON.stringify(jsonResults, null, 2))
      } else {
        if (pendingTestsN) {
          console.log(
            'found %s (%s, %d pending)',
            pluralize('spec', specs.length, true),
            pluralize('test', testsN, true),
            pendingTestsN,
          )
        } else {
          console.log(
            'found %s (%s)',
            pluralize('spec', specs.length, true),
            pluralize('test', testsN, true),
          )
        }
      }
      console.log('')
    }

    if (args['--tags']) {
      const tagEntries = Object.entries(tagTestCounts)
      const sortedTagEntries = tagEntries.sort((a, b) => {
        // every entry is [tag, count], so compare the tags
        return a[0].localeCompare(b[0])
      })
      const table = consoleTable.getTable(['Tag', 'Tests'], sortedTagEntries)
      console.log(table)
    }
  }
} else {
  console.log(specs.join(','))
}
