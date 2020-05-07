function parseNumber(edn, cursor) {
  for(let i = cursor; i < edn.length; i += 1) {
    const chr = edn.charCodeAt(i)
    const valid =
          48 <= chr && chr < 58 // 0-9
          || chr === 69 || chr === 101 || chr === 77 // E, e, M
          || chr === 46 || chr === 43 || chr === 45 // ., +, -
    if(!valid) {
      if(chr === 78) { // N
        return [i + 1, BigInt(edn.substring(cursor, i))]
      }
      return [i, parseFloat(edn.substring(cursor, i))]
    }
  }
}

function parseSymbolOrNumberOrRatio(edn, cursor) {
  const next = edn.charCodeAt(cursor + 1)

  if(48 <= next && next < 58 /* 0-9 */) {
    return parseNumberOrRatio(edn, cursor)
  } else {
    return parseSymbolOrBuiltin(edn, cursor)
  }
}

function parseNumberOrRatio(edn, cursor) {
  const [cur, num] = parseNumber(edn, cursor)
  if(edn.charAt(cur) === "/") {
    const [cur2, denom] = parseNumber(edn, cur + 1)
    return [cur2, num / denom]
  } else {
    return [cur, num]
  }
}

function parseString(edn, cursor) {
  let escaped = false;
  for(let i = cursor + 1; i < edn.length; i += 1) {
    switch(edn.charAt(i)) {
      case "\\": { escaped = !escaped; break }
      case "n":
      case "t":
      case "r": {
        if(escaped) {
          escaped = false
        }
        break
      }
      case "\"": {
        if(escaped) {
          escaped = false
          break
        } else {
          return [
            i + 1,
            edn.substring(cursor + 1, i)
              .replace("\\n", "\n")
              .replace("\\t", "\t")
              .replace("\\r", "\r")
              .replace("\\", "\\")
              .replace("\"", "\"")
          ]
        }
      }
    }
  }
}

function parseSymbolOrBuiltin(edn, cursor) {
  const [cur, val] = parseSymbol(edn, cursor)
  switch(val) {
    case "true": return [cur, true]
    case "false": return [cur, false]
    case "nil": return [cur, null]
    default: return [cur, Symbol(val)]
  }
}

function parseSymbol(edn, cursor) {
  for(let i = cursor + 1; i < edn.length; i += 1) {
    const chr = edn.charCodeAt(i)
    const valid = chr === 33
          || (35 <= chr && chr < 40)
          || (42 <= chr && chr < 44)
          || (45 <= chr && chr < 59)
          || (60 <= chr && chr < 64)
          || (65 <= chr && chr < 91)
          || chr === 95
          || (97 <= chr && chr < 123) // TODO: | (code 124)?
    if(!valid) {
      return [i, edn.substring(cursor, i)]
    }
  }
  return [edn.length, edn.substring(cursor, edn.length)]
}

function parseCharacter(edn, cursor) {
  const chr = edn.charAt(cursor + 1)
  const next = edn.charAt(cursor + 2)

  if(next === "e" || next === "p" || next === "a") {
    switch(chr) {
      case 'n': return [cursor + 8, "\n"]
      case 'r': return [cursor + 7, "\r"]
      case 's': return [cursor + 6, " "]
      default: return [cursor + 4, "\t"] // What error handling?
    }
  }

  return [cursor + 2, edn.substring(cursor + 1, cursor + 2)]
}

function parseSet(edn, cursor) {
  let ret = new Set()
  for(let i = cursor + 1; i < edn.length;) {
    if(edn.charAt(i) === "}") {
      return [i + 1, ret]
   }
    const [cur, val] = parseAny(edn, i)
    i = cur
    ret.add(val)
  }
}

function parseVec(edn, cursor, end = "]") {
  let ret = []
  for(let i = cursor + 1; i < edn.length;) {
    if(edn.charAt(i) === end) {
      return [i + 1, ret]
    }

    const [cur, val] = parseAny(edn, i)
    i = cur
    if(val !== undefined) {
      ret.push(val)
    }
  }
}

function parseMap(edn, cursor) {
  let ret = new Map()
  for(let i = cursor + 1; i < edn.length;) {
    if(edn.charAt(i) === "}") {
      return [i + 1, ret]
    }

    let first = i, key = undefined;
    while(key === undefined) {
      [first, key] = parseAny(edn, first)
      if(edn.charAt(first) === "}") {
        return [first + 1, ret]
      }
    }

    let second = first, val = undefined;
    while(val === undefined && edn.charAt(second) !== "}") {
      [second, val] = parseAny(edn, second)
    }

    if(val === undefined) {
      throw "odd number of map keys at " + second
    }

    i = second
    ret.set(key, val)
  }
  throw "end of file while parsing map"
}

function parseHash(edn, cursor) {
  const chr = edn.charAt(cursor + 1)
  if(chr === "_") {
    const [cur, _] = parseAny(edn, cursor + 2)
    // TODO when tags are supported: "A reader should not call user-supplied tag handlers during the processing of the element to be discarded."
    return parseAny(edn, cur)
  } else if (chr === "{") {
    return parseSet(edn, cursor + 1)
  } else {
    const [cur, fn] = parseSymbol(edn, cursor + 1)
    if(fn === "inst" && edn.charAt(cur + 1) === "\"") {
      const [cur2, date] = parseString(edn, cur + 1)
      return [cur2, Date.parseAny(date)]
    } else if(fn === "uuid" && edn.charAt(cur + 1) === "\"") {
      return parseString(edn, cur + 1)
    } else {
      return parseAny(edn, cur + 1)
    }
    throw "bad hash: " + edn.substring(cursor, cursor + 6)
  }
}

function parseComment(edn, cursor) {
  for(let i = cursor + 1; i < edn.length; i += 1) {
    if(edn.charAt(i) === "\n" || edn.charAt(i) === "\r") {
      return parseAny(edn, cursor + 1)
    }
  }
}

function parseAny(edn, cursor = 0) {
  const current = edn.charAt(cursor)

  if(cursor >= edn.length) {
    return [-1, undefined]
  }

  switch(current) {
    case ";": return parseComment(edn, cursor)
    case "#": return parseHash(edn, cursor)

    case "}": case "]": case ")":
      return [cursor, undefined]

    case "{": return parseMap(edn, cursor)
    case "[": return parseVec(edn, cursor)
    case "(": return parseVec(edn, cursor, ")")
    case "\"": return parseString(edn, cursor)
    case "\\": return parseCharacter(edn, cursor)

    case ":": return parseSymbolOrBuiltin(edn, cursor)

    case " ": case "\n": case "\t": case "\r": case ",":
      return parseAny(edn, cursor + 1)
  }

  if(["-", "+", "."].includes(current)) {
    return parseSymbolOrNumberOrRatio(edn, cursor)
  }

  if(!isNaN(current)) {
    return parseNumberOrRatio(edn, cursor)
  }

  if(current === "@") {
    throw `Unexpected "@" at ${cursor}`
  }
  return parseSymbolOrBuiltin(edn, cursor)
}

export function parse(edn) {
  return parseAny(edn)[1]
}
