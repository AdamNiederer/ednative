import { describe, it, expect } from 'vitest'
import { parse } from '../index.js'

const sym = Symbol.for

describe('EDN parser', () => {
  describe('nil', () => {
    it('parses nil', () => expect(parse('nil')).toBeNull())
    it('parses nil with leading whitespace', () => expect(parse('  nil')).toBeNull())
    it('parses nil with trailing whitespace', () => expect(parse('nil  ')).toBeNull())
    it('parses nil surrounded by whitespace', () => expect(parse('  nil  ')).toBeNull())
    it('parses nil with tab', () => expect(parse('\tnil')).toBeNull())
    it('parses nil with newline', () => expect(parse('\nnil')).toBeNull())
  })

  describe('booleans', () => {
    it('parses true', () => expect(parse('true')).toBe(true))
    it('parses false', () => expect(parse('false')).toBe(false))
    it('parses true with whitespace', () => expect(parse('  true  ')).toBe(true))
    it('parses false with whitespace', () => expect(parse('  false  ')).toBe(false))
    it('parses true in list', () => expect(parse('(true)')).toEqual([true]))
    it('parses false in vector', () => expect(parse('[false]')).toEqual([false]))
    it('parses boolean inside map value', () => expect(parse('{:a true}')).toEqual(new Map([[sym(':a'), true]])))
  })

  describe('integers', () => {
    it('parses 0', () => expect(parse('0')).toBe(0))
    it('parses positive integer', () => expect(parse('123')).toBe(123))
    it('parses negative integer', () => expect(parse('-123')).toBe(-123))
    it('parses positive integer with +', () => expect(parse('+42')).toBe(42))
    it('parses large integer', () => expect(parse('1000000')).toBe(1000000))
    it('parses max safe integer', () => expect(parse('9007199254740991')).toBe(9007199254740991))
    it('parses integer -0', () => expect(parse('-0')).toBe(0))
    it('parses integer +0', () => expect(parse('+0')).toBe(0))
    it('parses 1', () => expect(parse('1')).toBe(1))
    it('parses 9', () => expect(parse('9')).toBe(9))
    it('parses 10', () => expect(parse('10')).toBe(10))
    it('parses 99', () => expect(parse('99')).toBe(99))
    it('parses 100', () => expect(parse('100')).toBe(100))
    it('parses 256', () => expect(parse('256')).toBe(256))
    it('parses 1024', () => expect(parse('1024')).toBe(1024))
    it('parses 65535', () => expect(parse('65535')).toBe(65535))
    it('parses 2147483647', () => expect(parse('2147483647')).toBe(2147483647))
    it('parses -1', () => expect(parse('-1')).toBe(-1))
    it('parses -256', () => expect(parse('-256')).toBe(-256))
    it('parses -2147483648', () => expect(parse('-2147483648')).toBe(-2147483648))
  })

  describe('bigint', () => {
    it('parses bigint with N suffix', () => expect(parse('123N')).toBe(123n))
    it('parses negative bigint', () => expect(parse('-123N')).toBe(-123n))
    it('parses large bigint', () => expect(parse('9007199254740991N')).toBe(9007199254740991n))
    it('parses very large bigint', () => expect(parse('99999999999999999N')).toBe(99999999999999999n))
    it('parses zero bigint', () => expect(parse('0N')).toBe(0n))
    it('parses 1N', () => expect(parse('1N')).toBe(1n))
    it('parses -1N', () => expect(parse('-1N')).toBe(-1n))
  })

  describe('floating point numbers', () => {
    it('parses simple float', () => expect(parse('3.14')).toBeCloseTo(3.14))
    it('parses negative float', () => expect(parse('-2.5')).toBeCloseTo(-2.5))
    it('parses float with leading +', () => expect(parse('+1.5')).toBeCloseTo(1.5))
    it('parses float with E exponent', () => expect(parse('1E10')).toBe(10000000000))
    it('parses float with e exponent', () => expect(parse('1e10')).toBe(10000000000))
    it('parses float with E+ exponent', () => expect(parse('1E+2')).toBe(100))
    it('parses float with E- exponent', () => expect(parse('1E-2')).toBeCloseTo(0.01))
    it('parses float with e+ exponent', () => expect(parse('1e+2')).toBe(100))
    it('parses float with e- exponent', () => expect(parse('1e-2')).toBeCloseTo(0.01))
    it('parses negative exponent', () => expect(parse('-1e2')).toBe(-100))
    it('parses float with all parts', () => expect(parse('-3.14e2')).toBeCloseTo(-314))
    it('parses zero float', () => expect(parse('0.0')).toBe(0))
    it('parses .5 style float', () => expect(parse('.5')).toBeCloseTo(0.5))
    it('parses 0.001', () => expect(parse('0.001')).toBeCloseTo(0.001))
    it('parses 1e-10', () => expect(parse('1e-10')).toBeCloseTo(1e-10))
    it('parses 1e10', () => expect(parse('1e10')).toBe(10000000000))
    it('parses 1.23456789', () => expect(parse('1.23456789')).toBeCloseTo(1.23456789))
  })

  describe('precision suffix M', () => {
    it('parses integer with M suffix', () => expect(parse('5M')).toBe(5))
    it('parses float with M suffix', () => expect(parse('3.14M')).toBeCloseTo(3.14))
    it('parses negative with M suffix', () => expect(parse('-2M')).toBe(-2))
    it('parses zero with M', () => expect(parse('0M')).toBe(0))
    it('parses large with M', () => expect(parse('123456M')).toBe(123456))
  })

  describe('ratios', () => {
    it('parses simple ratio', () => expect(parse('1/2')).toBeCloseTo(0.5))
    it('parses ratio with negative numerator', () => expect(parse('-1/2')).toBeCloseTo(-0.5))
    it('parses ratio with larger numbers', () => expect(parse('22/7')).toBeCloseTo(22 / 7))
    it('parses ratio returning integer', () => expect(parse('4/2')).toBeCloseTo(2))
    it('parses ratio zero', () => expect(parse('0/5')).toBe(0))
    it('parses 1/3', () => expect(parse('1/3')).toBeCloseTo(1 / 3))
    it('parses 100/3', () => expect(parse('100/3')).toBeCloseTo(100 / 3))
    it('parses 1/1000', () => expect(parse('1/1000')).toBeCloseTo(0.001))
    it('parses -5/2', () => expect(parse('-5/2')).toBeCloseTo(-2.5))
    it('parses bigint numerator ratio', () => expect(parse('1N/2')).toBeCloseTo(0.5))
    it('parses bigint denominator ratio', () => expect(parse('1/2N')).toBeCloseTo(0.5))
    it('parses bigint both ratio', () => expect(parse('1N/2N')).toBeCloseTo(0.5))
  })

  describe('integers in collections (not at EOF)', () => {
    it('parses single integer in vector', () => expect(parse('[0]')).toEqual([0]))
    it('parses integers in vector', () => expect(parse('[1 2 3]')).toEqual([1, 2, 3]))
    it('parses integers in list', () => expect(parse('(4 5 6)')).toEqual([4, 5, 6]))
    it('parses negative in vector', () => expect(parse('[-1 -2]')).toEqual([-1, -2]))
    it('parses mixed numbers in vector', () => expect(parse('[0 -1 2]')).toEqual([0, -1, 2]))
    it('parses integers inside nested vector', () => expect(parse('[[1] [2]]')).toEqual([[1], [2]]))
    it('parses integers inside nested list', () => expect(parse('((7))')).toEqual([[7]]))
    it('parses float in vector', () => expect(parse('[1.5 2.5]')).toEqual([1.5, 2.5]))
    it('parses bigint in vector', () => expect(parse('[1N 2N]')).toEqual([1n, 2n]))
    it('parses ratio in vector', () => expect(parse('[1/2 3/4]')).toEqual([0.5, 0.75]))
    it('parses float in list', () => expect(parse('(3.14)')).toEqual([3.14]))
    it('parses bigint in list', () => expect(parse('(99N)')).toEqual([99n]))
    it('parses ratio in list', () => expect(parse('(2/3)')).toEqual([2 / 3]))
  })

  describe('strings', () => {
    it('parses simple string', () => expect(parse('"hello"')).toBe('hello'))
    it('parses empty string', () => expect(parse('""')).toBe(''))
    it('parses string with spaces', () => expect(parse('"hello world"')).toBe('hello world'))
    it('parses string with numbers', () => expect(parse('"abc123"')).toBe('abc123'))
    it('parses string with special chars', () => expect(parse('"!@#$%^&*()"')).toBe('!@#$%^&*()'))
    it('parses string with newline escape', () => expect(parse('"hello\\nworld"')).toBe('hello\nworld'))
    it('parses string with tab escape', () => expect(parse('"hello\\tworld"')).toBe('hello\tworld'))
    it('parses string with carriage return escape', () => expect(parse('"hello\\rworld"')).toBe('hello\rworld'))
    it('parses string with escaped quote', () => expect(parse('"hello\\"world"')).toBe('hello"world'))
    it('parses string with escaped backslash', () => expect(parse('"hello\\\\world"')).toBe('hello\\world'))
    it('parses string with multiple escape types', () => expect(parse('"\\n\\t\\r\\\\\\"abc"')).toBe('\n\t\r\\"abc'))
    it('parses string containing uXXXX passthrough', () => expect(parse('"hello\\u0041"')).toBe('hello\\u0041'))
    it('parses string with consecutive escapes', () => expect(parse('"hello\\n\\nworld"')).toBe('hello\n\nworld'))
    it('parses string with only escape sequences', () => expect(parse('"\\n\\t"')).toBe('\n\t'))
    it('parses multiline string', () => expect(parse('"hello\nworld"')).toBe('hello\nworld'))
    it('parses string with multiple quotes inside', () => expect(parse('"\\"a\\" \\"b\\""')).toBe('"a" "b"'))
    it('parses string with escaped backslash followed by n', () => expect(parse('"hello\\\\nworld"')).toBe('hello\\nworld'))
    it('parses string with escaped backslash followed by quote', () => expect(parse('"hello\\\\\\"world"')).toBe('hello\\"world'))
    it('parses string with many backslashes', () => expect(parse('"\\\\\\\\"')).toBe('\\\\'))
    it('parses string with escaped backslash at end', () => expect(parse('"hello\\\\"')).toBe('hello\\'))
    it('parses single char string', () => expect(parse('"a"')).toBe('a'))
    it('parses string with leading whitespace', () => expect(parse('  "hello"')).toBe('hello'))
    it('parses string with trailing whitespace', () => expect(parse('"hello"  ')).toBe('hello'))
    it('parses string with backslash before non-escape', () => expect(parse('"hello\\xworld"')).toBe('hello\\xworld'))
    it('parses empty escaped quote string', () => expect(parse('"\\"\\""')).toBe('""'))
  })

  describe('characters', () => {
    it('parses simple char a', () => expect(parse('\\a')).toBe('a'))
    it('parses char z', () => expect(parse('\\z')).toBe('z'))
    it('parses char Z', () => expect(parse('\\Z')).toBe('Z'))
    it('parses char 0', () => expect(parse('\\0')).toBe('0'))
    it('parses char 9', () => expect(parse('\\9')).toBe('9'))
    it('parses char open paren', () => expect(parse('\\(')).toBe('('))
    it('parses char close paren', () => expect(parse('\\)')).toBe(')'))
    it('parses char open bracket', () => expect(parse('\\[')).toBe('['))
    it('parses char close bracket', () => expect(parse('\\]')).toBe(']'))
    it('parses char open brace', () => expect(parse('\\{')).toBe('{'))
    it('parses char close brace', () => expect(parse('\\}')).toBe('}'))
    it('parses char backslash', () => expect(parse('\\\\')).toBe('\\'))
    it('parses char colon', () => expect(parse('\\:')).toBe(':'))
    it('parses char semicolon', () => expect(parse('\\;')).toBe(';'))
    it('parses char double-quote', () => expect(parse('\\"')).toBe('"'))
    it('parses char hash', () => expect(parse('\\#')).toBe('#'))
    it('parses char space', () => expect(parse('\\ ')).toBe(' '))
    it('parses newline named char', () => expect(parse('\\newline')).toBe('\n'))
    it('parses return named char', () => expect(parse('\\return')).toBe('\r'))
    it('parses space named char', () => expect(parse('\\space')).toBe(' '))
    it('parses tab named char', () => expect(parse('\\tab')).toBe('\t'))
    it('parses char A', () => expect(parse('\\A')).toBe('A'))
    it('parses char in vector', () => expect(parse('[\\a \\b]')).toEqual(['a', 'b']))
    it('parses char with leading whitespace', () => expect(parse('  \\a')).toBe('a'))
    it('parses char with trailing whitespace', () => expect(parse('\\a  ')).toBe('a'))
    it('parses unknown named char as single char', () => expect(parse('\\backspace')).toBe('b'))
  })

  describe('keywords', () => {
    it('parses simple keyword', () => expect(parse(':foo')).toBe(sym(':foo')))
    it('parses keyword with namespace', () => expect(parse(':foo/bar')).toBe(sym(':foo/bar')))
    it('parses keyword with hyphens', () => expect(parse(':my-keyword')).toBe(sym(':my-keyword')))
    it('parses keyword with underscores', () => expect(parse(':my_keyword')).toBe(sym(':my_keyword')))
    it('parses keyword with question mark', () => expect(parse(':is-ok?')).toBe(sym(':is-ok?')))
    it('parses keyword with exclamation', () => expect(parse(':ok!')).toBe(sym(':ok!')))
    it('parses keyword with asterisk', () => expect(parse(':*var*')).toBe(sym(':*var*')))
    it('parses keyword with plus', () => expect(parse(':+')).toBe(sym(':+')))
    it('parses keyword with minus', () => expect(parse(':-')).toBe(sym(':-')))
    it('parses keyword with dot', () => expect(parse(':.')).toBe(sym(':.')))
    it('parses keyword with leading whitespace', () => expect(parse('  :foo')).toBe(sym(':foo')))
    it('parses keyword with trailing whitespace', () => expect(parse(':foo  ')).toBe(sym(':foo')))
    it('parses keyword ending with slash', () => expect(parse(':foo/')).toBe(sym(':foo/')))
    it('parses single colon keyword', () => expect(parse(':')).toBe(sym(':')))
    it('parses keyword with numbers', () => expect(parse(':abc123')).toBe(sym(':abc123')))
  })

  describe('symbols', () => {
    it('parses simple symbol', () => expect(parse('foo')).toBe(sym('foo')))
    it('parses symbol with namespace', () => expect(parse('my-ns/foo')).toBe(sym('my-ns/foo')))
    it('parses slash alone as symbol', () => expect(parse('/')).toBe(sym('/')))
    it('parses symbol with hyphens', () => expect(parse('my-symbol')).toBe(sym('my-symbol')))
    it('parses symbol with underscores', () => expect(parse('my_symbol')).toBe(sym('my_symbol')))
    it('parses symbol with question mark', () => expect(parse('ok?')).toBe(sym('ok?')))
    it('parses symbol with exclamation', () => expect(parse('ok!')).toBe(sym('ok!')))
    it('parses symbol with asterisk', () => expect(parse('*var*')).toBe(sym('*var*')))
    it('parses symbol with plus', () => expect(parse('+')).toBe(sym('+')))
    it('parses symbol with minus', () => expect(parse('-')).toBe(sym('-')))
    it('parses symbol with dot', () => expect(parse('.')).toBe(sym('.')))
    it('parses symbol with <', () => expect(parse('<')).toBe(sym('<')))
    it('parses symbol with >', () => expect(parse('>')).toBe(sym('>')))
    it('parses symbol with =', () => expect(parse('=')).toBe(sym('=')))
    it('parses symbol with percent', () => expect(parse('%foo')).toBe(sym('%foo')))
    it('parses symbol with dollar', () => expect(parse('$foo')).toBe(sym('$foo')))
    it('parses symbol with ampersand', () => expect(parse('&foo')).toBe(sym('&foo')))
    it('parses symbol with leading whitespace', () => expect(parse('  foo')).toBe(sym('foo')))
    it('parses symbol with trailing whitespace', () => expect(parse('foo  ')).toBe(sym('foo')))
    it('parses symbol with numbers', () => expect(parse('foo123')).toBe(sym('foo123')))
    it('parses .foo as symbol', () => expect(parse('.foo')).toBe(sym('.foo')))
    it('parses single letter symbol', () => expect(parse('x')).toBe(sym('x')))
    it('parses symbol starting with uppercase', () => expect(parse('Foo')).toBe(sym('Foo')))
    it('parses symbol with > and <', () => expect(parse('<=foo=>')).toBe(sym('<=foo=>')))
  })

  describe('lists', () => {
    it('parses empty list', () => expect(parse('()')).toEqual([]))
    it('parses list of symbols', () => expect(parse('(a b c)')).toEqual([sym('a'), sym('b'), sym('c')]))
    it('parses list of strings', () => expect(parse('("a" "b")')).toEqual(['a', 'b']))
    it('parses list with mixed types', () => expect(parse('(1 "foo" :bar)')).toEqual([1, 'foo', sym(':bar')]))
    it('parses nested lists', () => expect(parse('((1 2) (3 4))')).toEqual([[1, 2], [3, 4]]))
    it('parses list containing vector', () => expect(parse('([1 2])')).toEqual([[1, 2]]))
    it('parses deep nesting', () => expect(parse('((((5))))')).toEqual([[[[5]]]]))
    it('parses list with leading whitespace', () => expect(parse('  (1 2)')).toEqual([1, 2]))
    it('parses list with trailing whitespace', () => expect(parse('(1 2)  ')).toEqual([1, 2]))
    it('parses list with no inner whitespace', () => expect(parse('(1)')).toEqual([1]))
    it('parses list with extra whitespace', () => expect(parse('(  1  2  )')).toEqual([1, 2]))
    it('parses single element list', () => expect(parse('(:foo)')).toEqual([sym(':foo')]))
    it('parses list of booleans', () => expect(parse('(true false nil)')).toEqual([true, false, null]))
    it('parses list of chars', () => expect(parse('(\\a \\b)')).toEqual(['a', 'b']))
  })

  describe('vectors', () => {
    it('parses empty vector', () => expect(parse('[]')).toEqual([]))
    it('parses vector of numbers', () => expect(parse('[1 2 3]')).toEqual([1, 2, 3]))
    it('parses vector of strings', () => expect(parse('["a" "b"]')).toEqual(['a', 'b']))
    it('parses vector with mixed types', () => expect(parse('[1 "foo" :bar]')).toEqual([1, 'foo', sym(':bar')]))
    it('parses nested vectors', () => expect(parse('[[1 2] [3 4]]')).toEqual([[1, 2], [3, 4]]))
    it('parses vector with trailing whitespace', () => expect(parse('[1 2]  ')).toEqual([1, 2]))
    it('parses vector with no inner whitespace', () => expect(parse('[1]')).toEqual([1]))
    it('parses vector with extra whitespace', () => expect(parse('[  1  2  ]')).toEqual([1, 2]))
    it('parses vector containing list', () => expect(parse('[(1 2) 3]')).toEqual([[1, 2], 3]))
    it('parses vector with booleans', () => expect(parse('[true false]')).toEqual([true, false]))
    it('parses vector with nil', () => expect(parse('[nil]')).toEqual([null]))
    it('parses vector of chars', () => expect(parse('[\\x \\y]')).toEqual(['x', 'y']))
    it('parses single element vector', () => expect(parse('[:foo]')).toEqual([sym(':foo')]))
    it('parses vector of bigints', () => expect(parse('[1N 2N]')).toEqual([1n, 2n]))
    it('parses vector of ratios', () => expect(parse('[1/2 3/4]')).toEqual([0.5, 0.75]))
    it('parses vector of floats', () => expect(parse('[1.5 2.5e1]')).toEqual([1.5, 25]))
  })

  describe('maps with string keys', () => {
    it('parses empty map', () => expect(parse('{}')).toEqual(new Map()))
    it('parses map with string keys', () => expect(parse('{"a" 1 "b" 2}')).toEqual(new Map([['a', 1], ['b', 2]])))
    it('parses map with number keys', () => expect(parse('{1 "one" 2 "two"}')).toEqual(new Map([[1, 'one'], [2, 'two']])))
    it('parses map with float keys', () => expect(parse('{1.5 "half" 2.5 "two-half"}')).toEqual(new Map([[1.5, 'half'], [2.5, 'two-half']])))
    it('parses map with nil key', () => expect(parse('{nil "null"}')).toEqual(new Map([[null, 'null']])))
    it('parses map with boolean keys', () => expect(parse('{true "yes" false "no"}')).toEqual(new Map([[true, 'yes'], [false, 'no']])))
    it('parses map with string values', () => expect(parse('{"k" "v"}')).toEqual(new Map([['k', 'v']])))
    it('parses map with boolean values', () => expect(parse('{"a" true "b" false}')).toEqual(new Map([['a', true], ['b', false]])))
    it('parses map with nil value', () => expect(parse('{"a" nil}')).toEqual(new Map([['a', null]])))
    it('parses map with vector value', () => expect(parse('{"a" [1 2]}')).toEqual(new Map([['a', [1, 2]]])))
    it('parses map with list value', () => expect(parse('{"a" (1 2)}')).toEqual(new Map([['a', [1, 2]]])))
    it('parses map with char key', () => expect(parse('{\\a "aye"}')).toEqual(new Map([['a', 'aye']])))
    it('parses map with bigint key', () => expect(parse('{1N "big"}')).toEqual(new Map([[1n, 'big']])))
  })

  describe('maps with keyword keys', () => {
    it('parses map with keyword keys', () => expect(parse('{:a 1 :b 2}')).toEqual(new Map([[sym(':a'), 1], [sym(':b'), 2]])))
    it('parses map with mixed key types', () => expect(parse('{:a 1 "foo" 2}')).toEqual(new Map([[sym(':a'), 1], ['foo', 2]])))
    it('parses nested maps', () => expect(parse('{:a {:b 1}}')).toEqual(new Map([[sym(':a'), new Map([[sym(':b'), 1]])]])))
    it('parses map with vector value', () => expect(parse('{:a [1 2]}')).toEqual(new Map([[sym(':a'), [1, 2]]])))
    it('parses map with list value', () => expect(parse('{:a (1 2)}')).toEqual(new Map([[sym(':a'), [1, 2]]])))
    it('parses map with set value', () => expect(parse('{:a #{1 2}}')).toEqual(new Map([[sym(':a'), new Set([1, 2])]])))
    it('parses map with trailing whitespace', () => expect(parse('{:a 1}  ')).toEqual(new Map([[sym(':a'), 1]])))
    it('parses map with extra whitespace', () => expect(parse('{  :a  1  :b  2  }')).toEqual(new Map([[sym(':a'), 1], [sym(':b'), 2]])))
    it('parses map with commas', () => expect(parse('{:a 1, :b 2}')).toEqual(new Map([[sym(':a'), 1], [sym(':b'), 2]])))
    it('parses map with boolean values', () => expect(parse('{:a true :b false}')).toEqual(new Map([[sym(':a'), true], [sym(':b'), false]])))
    it('parses map with nil value', () => expect(parse('{:a nil}')).toEqual(new Map([[sym(':a'), null]])))
    it('parses map with bigint value', () => expect(parse('{:a 42N}')).toEqual(new Map([[sym(':a'), 42n]])))
    it('parses map with ratio value', () => expect(parse('{:a 3/4}')).toEqual(new Map([[sym(':a'), 3 / 4]])))
    it('parses map with float value', () => expect(parse('{:a 3.14}')).toEqual(new Map([[sym(':a'), 3.14]])))
    it('parses deeply nested maps', () => expect(parse('{:a {:b {:c 1}}}')).toEqual(new Map([[sym(':a'), new Map([[sym(':b'), new Map([[sym(':c'), 1]])]])]])))
    it('parses map with number values', () => expect(parse('{:a 1 :b 2}')).toEqual(new Map([[sym(':a'), 1], [sym(':b'), 2]])))
    it('parses map with many entries', () => expect(parse('{:a 1 :b 2 :c 3 :d 4 :e 5}')).toEqual(new Map([[sym(':a'), 1], [sym(':b'), 2], [sym(':c'), 3], [sym(':d'), 4], [sym(':e'), 5]])))
  })

  describe('maps with vector keys', () => {
    it('parses map with vector keys', () => expect(parse('{[1 2] "vector-key"}')).toEqual(new Map([[[1, 2], 'vector-key']])))
  })

  describe('sets', () => {
    it('parses empty set', () => expect(parse('#{}')).toEqual(new Set()))
    it('parses set of numbers', () => expect(parse('#{1 2 3}')).toEqual(new Set([1, 2, 3])))
    it('parses single-element set', () => expect(parse('#{42}')).toEqual(new Set([42])))
    it('parses set of strings', () => expect(parse('#{"a" "b"}')).toEqual(new Set(['a', 'b'])))
    it('parses set of bools', () => expect(parse('#{true false}')).toEqual(new Set([true, false])))
    it('parses set with nil', () => expect(parse('#{nil}')).toEqual(new Set([null])))
    it('parses set of floats', () => expect(parse('#{1.5 2.5}')).toEqual(new Set([1.5, 2.5])))
    it('parses set of bigints', () => expect(parse('#{1N 2N}')).toEqual(new Set([1n, 2n])))
    it('parses set with vector element', () => expect(parse('#{[1 2]}')).toEqual(new Set([[1, 2]])))
    it('parses set of symbols', () => expect(parse('#{a b c}')).toEqual(new Set([sym('a'), sym('b'), sym('c')])))
    it('parses set with trailing whitespace', () => expect(parse('#{1}  ')).toEqual(new Set([1])))
    it('parses set of keywords', () => expect(parse('#{:a :b}')).toEqual(new Set([sym(':a'), sym(':b')])))
  })

  describe('comments', () => {
    it('ignores line comment at start', () => expect(parse('; this is a comment\n123')).toBe(123))
    it('ignores line comment mid-line', () => expect(parse('1 ; comment\n2')).toBe(1))
    it('ignores line comment at end (no trailing newline)', () => expect(parse('123 ; comment')).toBe(123))
    it('ignores multiple comments', () => expect(parse('; a\n1 ; b\n2')).toBe(1))
    it('ignores comment between map entries', () => expect(parse('{:a 1 ; comment\n :b 2}')).toEqual(new Map([[sym(':a'), 1], [sym(':b'), 2]])))
    it('ignores comment in vector', () => expect(parse('[1 ; comment\n 2]')).toEqual([1, 2]))
    it('ignores comment with only newline content', () => expect(parse(';\n42')).toBe(42))
    it('ignores consecutive comments', () => expect(parse('; a\n; b\n123')).toBe(123))
    it('ignores comment after keyword', () => expect(parse(':a ;comment\n1')).toBe(sym(':a')))
    it('ignores comment before close bracket', () => expect(parse('[1 ;comment\n]')).toEqual([1]))
  })

  describe('discard (#_)', () => {
    it('discards next element', () => expect(parse('[a #_foo 42]')).toEqual([sym('a'), 42]))
    it('discards next number', () => expect(parse('[1 #_2 3]')).toEqual([1, 3]))
    it('discards next string', () => expect(parse('["keep" #_"discard" "keep2"]')).toEqual(['keep', 'keep2']))
    it('discards nested element', () => expect(parse('[#_[1 2 3] 42]')).toEqual([42]))
    it('discards in map value', () => expect(parse('{:a #_discard 1}')).toEqual(new Map([[sym(':a'), 1]])))
    it('discards with whitespace after #_', () => expect(parse('[1 #_ 2 3]')).toEqual([1, 3]))
    it('chain discards', () => expect(parse('[#_#_ 1 2 3]')).toEqual([3]))
    it('discards set element', () => expect(parse('#{1 #_2 3}')).toEqual(new Set([1, 3])))
    it('discards keyword then throws on odd map keys', () => expect(() => parse('{#_:a 1 :b 2}')).toThrow())
    it('discards vector', () => expect(parse('[1 #_[2 3] 4]')).toEqual([1, 4]))
    it('discards map', () => expect(parse('[1 #_{:a 1} 2]')).toEqual([1, 2]))
    it('discards set', () => expect(parse('[1 #_#{1 2 3} 2]')).toEqual([1, 2]))
    it('discards list', () => expect(parse('[1 #_(1 2 3) 2]')).toEqual([1, 2]))
  })

  describe('tagged literals', () => {
    it('parses #inst with date string', () => expect(parse('#inst "1985-04-12T23:20:50.52Z"')).toBe(Date.parse('1985-04-12T23:20:50.52Z')))
    it('parses #inst with another date', () => expect(parse('#inst "2020-01-01T00:00:00Z"')).toBe(Date.parse('2020-01-01T00:00:00Z')))
    it('parses #inst date without timezone', () => expect(parse('#inst "2020-01-01T00:00:00"')).toBe(Date.parse('2020-01-01T00:00:00')))
    it('parses #uuid', () => expect(parse('#uuid "f81d4fae-7dec-11d0-a765-00a0c91e6bf6"')).toBe('f81d4fae-7dec-11d0-a765-00a0c91e6bf6'))
    it('parses unknown tag as identity', () => expect(parse('#myTag 42')).toBe(42))
    it('parses unknown tag with string', () => expect(parse('#myTag "hello"')).toBe('hello'))
    it('parses unknown tag with vector', () => expect(parse('#myprefix/Person {:first "Fred"}')).toBeInstanceOf(Map))
    it('parses date-like unknown tag', () => expect(parse('#date "2019-01-01"')).toBe('2019-01-01'))
    it('parses unknown tag with list', () => expect(parse('#my/tag (1 2 3)')).toEqual([1, 2, 3]))
    it('parses unknown tag with symbol', () => expect(parse('#mytag foo')).toBe(sym('foo')))
    it('parses unknown tag with keyword', () => expect(parse('#mytag :foo')).toBe(sym(':foo')))
    it('parses unknown tag with set', () => expect(parse('#mytag #{1 2}')).toEqual(new Set([1, 2])))
    it('parses unknown tag with nested tagged element', () => expect(parse('#outer #inner 42')).toBe(42))
  })

  describe('whitespace handling', () => {
    it('handles spaces between elements', () => expect(parse('[1 2 3]')).toEqual([1, 2, 3]))
    it('handles tabs between elements', () => expect(parse('[1\t2\t3]')).toEqual([1, 2, 3]))
    it('handles newlines between elements', () => expect(parse("[1\n2\n3]")).toEqual([1, 2, 3]))
    it('handles carriage returns between elements', () => expect(parse("[1\r2\r3]")).toEqual([1, 2, 3]))
    it('handles commas as whitespace', () => expect(parse('[1,2,3]')).toEqual([1, 2, 3]))
    it('handles mixed whitespace', () => expect(parse("[1,\t\n\r 2]")).toEqual([1, 2]))
    it('handles leading whitespace', () => expect(parse('  [1 2]')).toEqual([1, 2]))
    it('handles trailing whitespace', () => expect(parse('[1 2]  ')).toEqual([1, 2]))
    it('handles multiple commas', () => expect(parse('[1,,,2]')).toEqual([1, 2]))
    it('handles comma at start', () => expect(parse('[,1 2]')).toEqual([1, 2]))
    it('handles comma at end', () => expect(parse('[1 2,]')).toEqual([1, 2]))
    it('handles tabs in maps', () => expect(parse('{\t:a 1\t:b 2}')).toEqual(new Map([[sym(':a'), 1], [sym(':b'), 2]])))
    it('handles newlines in maps', () => expect(parse('{\n:a 1\n:b 2\n}')).toEqual(new Map([[sym(':a'), 1], [sym(':b'), 2]])))
    it('handles commas in maps', () => expect(parse('{:a 1,:b 2}')).toEqual(new Map([[sym(':a'), 1], [sym(':b'), 2]])))
  })

  describe('edge cases', () => {
    it('returns undefined for empty input', () => expect(parse('')).toBeUndefined())
    it('returns undefined for whitespace only', () => expect(parse('   ')).toBeUndefined())
    it('returns undefined for tabs only', () => expect(parse('\t\t')).toBeUndefined())
    it('returns undefined for newlines only', () => expect(parse('\n\n')).toBeUndefined())
    it('returns undefined for commas only', () => expect(parse(',,,')).toBeUndefined())
    it('returns undefined for mixed whitespace', () => expect(parse(' \t\n\r ')).toBeUndefined())
    it('returns undefined for comment only', () => expect(parse('; just a comment')).toBeUndefined())
    it('returns undefined for comment with newline', () => expect(parse('; comment\n')).toBeUndefined())
    it('handles deeply nested vectors', () => expect(parse('[[[[[1]]]]]')).toEqual([[[[[1]]]]]))
    it('handles deeply nested lists', () => expect(parse('(((((1)))))')).toEqual([[[[[1]]]]]))
    it('parses multiple values (returns first)', () => expect(parse('1 2 3')).toBe(1))
    it('parses strings as first of multiple', () => expect(parse('"a" "b" "c"')).toBe('a'))
    it('parses keywords as first of multiple', () => expect(parse(':a :b :c')).toBe(sym(':a')))
    it('parses nil with trailing text', () => expect(parse('nil foo')).toBeNull())
    it('parses zero width vector', () => expect(parse('[]')).toEqual([]))
    it('parses zero width list', () => expect(parse('()')).toEqual([]))
    it('parses zero width map', () => expect(parse('{}')).toEqual(new Map()))
    it('parses zero width set', () => expect(parse('#{}')).toEqual(new Set()))
    it('parses nested mixed types deep', () => expect(parse('{:a [#{1 2} {:b (3 4)}]}')).toEqual(new Map([[sym(':a'), [new Set([1, 2]), new Map([[sym(':b'), [3, 4]]])]]])))
    it('parses all primitives in vector', () => expect(parse('[nil true false 42 3.14 :kw \\x "str" foo]')).toEqual([null, true, false, 42, 3.14, sym(':kw'), 'x', 'str', sym('foo')]))
  })

  describe('nested and complex structures', () => {
    it('parses complex nested structure', () => {
      expect(parse('{:a [1 2 {:b #{3 4}}] :c (5 6)}')).toEqual(new Map([
        [sym(':a'), [1, 2, new Map([[sym(':b'), new Set([3, 4])]])]],
        [sym(':c'), [5, 6]]
      ]))
    })
    it('parses vector of maps', () => expect(parse('[{:a 1} {:b 2}]')).toEqual([new Map([[sym(':a'), 1]]), new Map([[sym(':b'), 2]])]))
    it('parses map with nested set', () => expect(parse('{:key #{1 2 3}}')).toEqual(new Map([[sym(':key'), new Set([1, 2, 3])]])))
    it('parses list containing everything', () => expect(parse('(1 "two" :three [4] #{5} {:a 6})')).toEqual([1, 'two', sym(':three'), [4], new Set([5]), new Map([[sym(':a'), 6]])]))
    it('parses set of maps', () => expect(parse('#{{:a 1} {:b 2}}')).toEqual(new Set([new Map([[sym(':a'), 1]]), new Map([[sym(':b'), 2]])])))
    it('parses map with list keys', () => expect(parse('{(1 2) "list-key"}')).toEqual(new Map([[[1, 2], 'list-key']])))
    it('parses vector of sets', () => expect(parse('[#{1} #{2}]')).toEqual([new Set([1]), new Set([2])]))
    it('parses deeply mixed nesting', () => expect(parse('[[#{1 2} {:a (3 4)}] #{5 6}]')).toEqual([[new Set([1, 2]), new Map([[sym(':a'), [3, 4]]])], new Set([5, 6])]))
  })

  describe('error handling', () => {
    it('throws on odd number of map keys', () => expect(() => parse('{:a 1 :b}')).toThrow())
    it('throws on @ prefix', () => expect(() => parse('@foo')).toThrow())
    it('throws on deref @ in vector', () => expect(() => parse('[1 @foo 2]')).toThrow())
    it('throws on unterminated string', () => expect(() => parse('"hello')).toThrow())
    it('throws on unterminated string in vector', () => expect(() => parse('["hello')).toThrow())
    it('throws on unterminated string in map', () => expect(() => parse('{:a "hello')).toThrow())
    it('throws on unclosed vector', () => expect(() => parse('[1 2')).toThrow())
    it('throws on unclosed list', () => expect(() => parse('(1 2')).toThrow())
    it('throws on unclosed set', () => expect(() => parse('#{1 2')).toThrow())
    it('throws on unclosed nested vector', () => expect(() => parse('[[1 2] [3')).toThrow())
  })

  describe('numbers at end of input (known bugs)', () => {
    it('parses integer at end of input', () => expect(parse('123')).toBe(123))
    it('parses negative integer at end', () => expect(parse('-123')).toBe(-123))
    it('parses float at end of input', () => expect(parse('3.14')).toBeCloseTo(3.14))
    it('parses negative float at end', () => expect(parse('-2.5')).toBeCloseTo(-2.5))
    it('parses number with exponent at end', () => expect(parse('1e5')).toBe(100000))
    it('parses ratio at end of input', () => expect(parse('1/2')).toBeCloseTo(0.5))
    it('parses positive number at end', () => expect(parse('+42')).toBe(42))
    it('parses single digit at end', () => expect(parse('7')).toBe(7))
    it('parses zero at end', () => expect(parse('0')).toBe(0))
    it('parses float with decimal at end', () => expect(parse('42.0')).toBe(42))
    it('parses number with M suffix at end', () => expect(parse('5M')).toBe(5))
    it('parses bigint at end', () => expect(parse('123N')).toBe(123n))
    it('parses integer with leading zeros at end', () => expect(parse('0')).toBe(0))
    it('parses .5 at end', () => expect(parse('.5')).toBeCloseTo(0.5))
  })

  describe('numbers with whitespace', () => {
    it('parses integer with surrounding whitespace', () => expect(parse('  123  ')).toBe(123))
    it('parses float with surrounding whitespace', () => expect(parse('  3.14  ')).toBeCloseTo(3.14))
    it('parses negative number with leading whitespace', () => expect(parse('  -42')).toBe(-42))
  })

  describe('string escape edge cases', () => {
    it('handles escaped backslash followed by n', () => expect(parse('"\\\\n"')).toBe('\\n'))
    it('handles many escaped quotes', () => expect(parse('"\\"\\"\\""')).toBe('"""'))
    it('handles backslash at end of string', () => expect(parse('"hello\\\\"')).toBe('hello\\'))
    it('handles mixed escape sequences in long string', () => expect(parse('"\\t\\n\\r\\\\\\"foo\\"\\\\\\n\\t"')).toBe('\t\n\r\\"foo"\\\n\t'))
    it('handles escaped backslash before escaped quote', () => expect(parse('"\\\\\\""')).toBe('\\"'))
    it('handles string with only escaped backslash', () => expect(parse('"\\\\"')).toBe('\\'))
    it('handles string with escaped quote only', () => expect(parse('"\\""')).toBe('"'))
    it('handles triple escaped backslash', () => expect(parse('"\\\\\\\\\\\\"')).toBe('\\\\\\'))
  })

  describe('multiple top-level values', () => {
    it('returns first int', () => expect(parse('1 2 3')).toBe(1))
    it('returns first string', () => expect(parse('"a" "b" "c"')).toBe('a'))
    it('returns first keyword', () => expect(parse(':a :b :c')).toBe(sym(':a')))
    it('returns first with comment separation', () => expect(parse('1;x\n2')).toBe(1))
    it('returns first with tag', () => expect(parse('#foo 1 2')).toBe(1))
  })

  describe('integration examples', () => {
    it('parses README example', () => expect(parse('[\\0 1/2 {\\1 2 :three 4e0 5.0 six "seven" 8N}]')).toEqual(['0', 0.5, new Map([['1', 2], [sym(':three'), 4], [5, sym('six')], ['seven', 8n]])]))
    it('parses real-world EDN data', () => {
      const edn = `{:name "John"
 :age 30
 :address {:city "NYC" :zip 10001}
 :tags #{:admin :user}
 :scores [95 87 92]}`
      expect(parse(edn)).toEqual(new Map([
        [sym(':name'), 'John'],
        [sym(':age'), 30],
        [sym(':address'), new Map([[sym(':city'), 'NYC'], [sym(':zip'), 10001]])],
        [sym(':tags'), new Set([sym(':admin'), sym(':user')])],
        [sym(':scores'), [95, 87, 92]]
      ]))
    })
    it('parses nested tagged elements', () => expect(parse('{:data #uuid "f81d4fae-7dec-11d0-a765-00a0c91e6bf6" :timestamp #inst "2020-06-01T12:00:00Z"}')).toEqual(new Map([[sym(':data'), 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6'], [sym(':timestamp'), Date.parse('2020-06-01T12:00:00Z')]])))
    it('parses complex data structure', () => {
      const edn = `[{:id 1
  :name "Alice"
  :roles #{:admin :user}
  :metadata {:last-login #inst "2024-01-15T10:30:00Z"
             :scores [100 95 87]}}
 {:id 2
  :name "Bob"
  :roles #{:user}
  :metadata {:last-login #inst "2024-01-14T08:15:00Z"
             :scores [75 82 90]}}]`
      expect(parse(edn)).toEqual([
        new Map([
          [sym(':id'), 1],
          [sym(':name'), 'Alice'],
          [sym(':roles'), new Set([sym(':admin'), sym(':user')])],
          [sym(':metadata'), new Map([
            [sym(':last-login'), Date.parse('2024-01-15T10:30:00Z')],
            [sym(':scores'), [100, 95, 87]]
          ])]
        ]),
        new Map([
          [sym(':id'), 2],
          [sym(':name'), 'Bob'],
          [sym(':roles'), new Set([sym(':user')])],
          [sym(':metadata'), new Map([
            [sym(':last-login'), Date.parse('2024-01-14T08:15:00Z')],
            [sym(':scores'), [75, 82, 90]]
          ])]
        ])
      ])
    })
    it('parses edn spec examples', () => {
      expect(parse(':fred')).toBe(sym(':fred'))
      expect(parse(':my/fred')).toBe(sym(':my/fred'))
      expect(() => parse(':')).not.toThrow()
      expect(parse('(/ a b)')).toHaveLength(3)
    })
  })
})
