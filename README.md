# ednative

Quickly parse EDN into native JS data structures.

## Usage

```javascript
import {parse} from 'ednative';

parse(`[\\0 1/2 {\\1 2 :three 4e0 5.0 six "seven" 8N}]`)
=> ['0', 0.5, Map {'1' => 2, Symbol(:three) => 4, 5 => Symbol(six), 'seven' => 8n}]

parse(`[{#{[-0] #date "2019-01-01T00:00:00Z"} "hello\nworld"}]`)
=> [Map {Set {[-0], '2019-01-01T00:00:00Z'} => 'hello\nworld'}]
```

## Mappings

| EDN          | Javascript    |
|:-------------|:--------------|
| `true`       | `true`        |
| `nil`        | `null`        |
| `5`          | `5`           |
| `5.0`        | `5`           |
| `5e0`        | `5`           |
| `5E0`        | `5`           |
| `5/2`        | `2.5`         |
| `5N`         | `5n`          |
| `5M`         | `5`           |
| `'s'`        | `'s'`         |
| `\s`         | `'s'`         |
| `sym`        | `Symbol(sym)` |
| `:kw`        | `Symbol(:kw)` |
| `'()`        | `[]`          |
| `[]`         | `[]`          |
| `{}`         | `Map {}`      |
| `#{}`        | `Set {}`      |
| `#date "5"`  | `'5'`         |
| `#anyhash 5` | `5`           |

`#date`, `#uuid`, and all custom tags are currently treated like
`identity`. Comments and anything prefixed with `#_` are ignored, as in the
[specification](https://github.com/edn-format/edn#discard)

## Differences from strict EDN

Ednative is intentionally liberal in what it accepts. The following inputs would
be rejected by a strict EDN parser but are accepted here:

| Input | What you get | Why it's different |
|-------|-------------|-------------------|
| `007` | `7` | Leading zeros in integers are not rejected |
| `#{1 1}` | `Set {1}` | Duplicate set elements are silently deduplicated |
| `{:a 1 :a 2}` | `Map {a => 2}` | Duplicate map keys: last value wins |
| `1/0` | `Infinity` | Ratio division by zero returns Infinity |
| `0/0` | `NaN` | Ratio zero-divided returns NaN |
| `1N/2` | `0.5` | BigInt in a ratio is converted to Number |
| `1.5/2` | `0.75` | Non-integer numerator/denominator in ratios |
| `#_` with no following value | `undefined` | Top-level discard with no remaining value |
| `#inst "not-a-date"` | `NaN` | Invalid inst date returns NaN |
| `#uuid "bad"` | `"bad"` | Invalid uuid returns the string as-is |
| `\backspace` | `"b"` | Unknown named char treated as its first letter |
| `#? :a`, `#= :a` | `:a` | Unsupported reader macros silently pass through |
| `^:kw`, `'sym` | symbol | Reader metadata `^` and quote `'` become symbol prefixes |
| `.5` | `0.5` | Float may start with a decimal point |

## Caveats

This parser has not been fuzzed, so don't rely on it for security-critical
stuff. The recursive structure means deeply nested input (e.g.
`[[[[...]]]]`) will cause a stack overflow.

## Performance

We're at roughly 35MB/s on node on my very old machine. The code currently
avoids unnecessary copies and mutably builds data structures wherever possible,
but, y'know, it's still Javascript.
