import {readdir, readFile} from 'fs/promises'
import {join, dirname} from 'path'
import {performance as perf} from 'perf_hooks'
import {parse} from '../index.js'

// console.log("foo", dirname(), "bar")
const valid = join(dirname("."), 'edn-tests/valid-edn/');
const invalid = join(dirname("."), 'edn-tests/invalid-edn/')
const performance = join(dirname("."), 'edn-tests/performance/')

async function run(foo) {
  for(const file of await readdir(valid)) {
    const contents = await readFile(join(valid, file), {encoding: 'utf-8'})
    join(valid, file), contents.substring(0, contents.length - 1)
    parse(contents)
  }

  for(const file of await readdir(invalid)) {
    // Just make sure we can't get DoSed -- we're a bit less pedantic for
    // speed's sake, and because we're almost always reading something encoded
    // by Clojure itself
    const contents = await readFile(join(invalid, file), {encoding: 'utf-8'})
    try {
      parse(contents)
    } catch(e) { }
  }

  for(const file of await readdir(performance)) {
    const contents = await readFile(join(performance, file), {encoding: 'utf-8'})
    const start = perf.now()
    parse(contents)
    const end = perf.now()
    console.log(file, end - start)
  }
}

run()
