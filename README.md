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

## Caveats

In the interest of speed, ednative makes no attempt to validate what it
parses, and will happily continue along if it encounters a recoverable error. It
also hasn't been fuzzed, so don't rely on it for security-critical stuff.

## Performance

We're at roughly 35MB/s on node on my very old machine. The code currently
avoids unnecessary copies and mutably builds data structures wherever possible,
but, y'know, it's still Javascript.
