// @flow
/* eslint-disable no-unused-vars */
import {
  createStore,
  createEvent,
  createEffect,
  sample,
  Store,
  Event,
} from 'effector'

const typecheck = '{global}'

test('event by event', () => {
  const a = createEvent<number>()
  const b = createEvent<boolean>()
  const c = sample(a, b)

  const sample_ee_check1: Event<number> = c
  const sample_ee_check2: Event<string> = c
  expect(typecheck).toMatchInlineSnapshot(`
    "
    --typescript--
    Type 'Event<number>' is not assignable to type 'Event<string>'.
      Types of property 'watch' are incompatible.
        Type '(watcher: (payload: number) => any) => Subscription' is not assignable to type '(watcher: (payload: string) => any) => Subscription'.
          Types of parameters 'watcher' and 'watcher' are incompatible.
            Types of parameters 'payload' and 'payload' are incompatible.
              Type 'number' is not assignable to type 'string'.

    --flow--
    Cannot assign 'c' to 'sample_ee_check2'
      const sample_ee_check2: Event<string> = c
                                              ^
      number [1] is incompatible with string [2] in type argument 'Payload' [3]
          const a = createEvent<number>()
                            [1] ^^^^^^
          const sample_ee_check2: Event<string> = c
                                    [2] ^^^^^^
          declare export class Event<Payload> implements Unit<Payload> {
                                 [3] ^^^^^^^
    "
  `)
})
test('event by event with handler', () => {
  const a = createEvent<string>()
  const b = createEvent<boolean>()
  const c = sample(a, b, (a, b) => ({a, b}))

  const sample_eeh_check1: Event<{a: string, b: boolean}> = c
  const sample_eeh_check2: Event<string> = c
  expect(typecheck).toMatchInlineSnapshot(`
    "
    --typescript--
    Type 'Event<{ a: string; b: boolean; }>' is not assignable to type 'Event<string>'.
      Types of property 'watch' are incompatible.
        Type '(watcher: (payload: { a: string; b: boolean; }) => any) => Subscription' is not assignable to type '(watcher: (payload: string) => any) => Subscription'.
          Types of parameters 'watcher' and 'watcher' are incompatible.
            Types of parameters 'payload' and 'payload' are incompatible.
              Type '{ a: string; b: boolean; }' is not assignable to type 'string'.

    --flow--
    Cannot assign 'c' to 'sample_eeh_check2'
      const sample_eeh_check2: Event<string> = c
                                               ^
      object type [1] is incompatible with string [2] in type argument 'Payload' [3]
          const sample_eeh_check1: Event<{a: string, b: boolean}> = c
                                     [1] ^^^^^^^^^^^^^^^^^^^^^^^
          const sample_eeh_check2: Event<string> = c
                                     [2] ^^^^^^
          declare export class Event<Payload> implements Unit<Payload> {
                                 [3] ^^^^^^^
    "
  `)
})

test('store by event', () => {
  const d = createStore(0)
  const b = createEvent<boolean>()
  const e = sample(d, b)

  const sample_se_check1: Event<number> = e
  const sample_se_check2: Event<string> = e
  expect(typecheck).toMatchInlineSnapshot(`
    "
    --typescript--
    Type 'Event<number>' is not assignable to type 'Event<string>'.

    --flow--
    Cannot assign 'e' to 'sample_se_check2'
      const sample_se_check2: Event<string> = e
                                              ^
      number [1] is incompatible with string [2] in type argument 'Payload' [3]
          const sample_se_check1: Event<number> = e
                                    [1] ^^^^^^
          const sample_se_check2: Event<string> = e
                                    [2] ^^^^^^
          declare export class Event<Payload> implements Unit<Payload> {
                                 [3] ^^^^^^^
    "
  `)
})
test('store by event with handler', () => {
  const d = createStore('')
  const b = createEvent<boolean>()
  const e = sample(d, b, (a, b) => ({a, b}))

  const sample_seh_check1: Event<{a: string, b: boolean}> = e
  const sample_seh_check2: Event<string> = e
  expect(typecheck).toMatchInlineSnapshot(`
    "
    --typescript--
    Type 'Event<{ a: string; b: boolean; }>' is not assignable to type 'Event<string>'.
      Types of property 'watch' are incompatible.
        Type '(watcher: (payload: { a: string; b: boolean; }) => any) => Subscription' is not assignable to type '(watcher: (payload: string) => any) => Subscription'.
          Types of parameters 'watcher' and 'watcher' are incompatible.
            Types of parameters 'payload' and 'payload' are incompatible.
              Type '{ a: string; b: boolean; }' is not assignable to type 'string'.

    --flow--
    Cannot assign 'e' to 'sample_seh_check2'
      const sample_seh_check2: Event<string> = e
                                               ^
      object type [1] is incompatible with string [2] in type argument 'Payload' [3]
          const sample_seh_check1: Event<{a: string, b: boolean}> = e
                                     [1] ^^^^^^^^^^^^^^^^^^^^^^^
          const sample_seh_check2: Event<string> = e
                                     [2] ^^^^^^
          declare export class Event<Payload> implements Unit<Payload> {
                                 [3] ^^^^^^^
    "
  `)
})

test('effect by event', () => {
  const f = createEffect<string, any, any>()
  const b = createEvent<boolean>()
  const g = sample(f, b)

  const sample_efe_check1: Event<string> = g
  const sample_efe_check2: Event<number> = g
  expect(typecheck).toMatchInlineSnapshot(`
    "
    --typescript--
    Type 'Event<string>' is not assignable to type 'Event<number>'.
      Types of property 'watch' are incompatible.
        Type '(watcher: (payload: string) => any) => Subscription' is not assignable to type '(watcher: (payload: number) => any) => Subscription'.
          Types of parameters 'watcher' and 'watcher' are incompatible.
            Types of parameters 'payload' and 'payload' are incompatible.
              Type 'string' is not assignable to type 'number'.

    --flow--
    Cannot assign 'g' to 'sample_efe_check2'
      const sample_efe_check2: Event<number> = g
                                               ^
      string [1] is incompatible with number [2] in type argument 'Payload' [3]
          const f = createEffect<string, any, any>()
                             [1] ^^^^^^
          const sample_efe_check2: Event<number> = g
                                     [2] ^^^^^^
          declare export class Event<Payload> implements Unit<Payload> {
                                 [3] ^^^^^^^
    "
  `)
})
test('effect by event with handler', () => {
  const f = createEffect<string, any, any>()
  const b = createEvent<boolean>()
  const g = sample(f, b, (a, b) => ({a, b}))

  const sample_efeh_check1: Event<{a: string, b: boolean}> = g
  const sample_efeh_check2: Event<number> = g
  expect(typecheck).toMatchInlineSnapshot(`
    "
    --typescript--
    Type 'Event<{ a: string; b: boolean; }>' is not assignable to type 'Event<number>'.
      Types of property 'watch' are incompatible.
        Type '(watcher: (payload: { a: string; b: boolean; }) => any) => Subscription' is not assignable to type '(watcher: (payload: number) => any) => Subscription'.
          Types of parameters 'watcher' and 'watcher' are incompatible.
            Types of parameters 'payload' and 'payload' are incompatible.
              Type '{ a: string; b: boolean; }' is not assignable to type 'number'.

    --flow--
    Cannot assign 'g' to 'sample_efeh_check2'
      const sample_efeh_check2: Event<number> = g
                                                ^
      object type [1] is incompatible with number [2] in type argument 'Payload' [3]
          const sample_efeh_check1: Event<{a: string, b: boolean}> = g
                                      [1] ^^^^^^^^^^^^^^^^^^^^^^^
          const sample_efeh_check2: Event<number> = g
                                      [2] ^^^^^^
          declare export class Event<Payload> implements Unit<Payload> {
                                 [3] ^^^^^^^
    "
  `)
})

test('store by store', () => {
  const a = createStore(false)
  const b = createStore(0)
  const c = sample(a, b)

  const sample_ss_check1: Store<boolean> = c
  const sample_ss_check2: Store<string> = c
  expect(typecheck).toMatchInlineSnapshot(`
    "
    --typescript--
    Type 'Store<boolean>' is not assignable to type 'Store<string>'.
      The types returned by 'getState()' are incompatible between these types.
        Type 'boolean' is not assignable to type 'string'.

    --flow--
    Cannot assign 'c' to 'sample_ss_check2'
      const sample_ss_check2: Store<string> = c
                                              ^
      boolean [1] is incompatible with string [2] in type argument 'State' [3]
          const sample_ss_check1: Store<boolean> = c
                                    [1] ^^^^^^^
          const sample_ss_check2: Store<string> = c
                                    [2] ^^^^^^
          declare export class Store<State> implements Unit<State> {
                                 [3] ^^^^^
    "
  `)
})
test('store by store with handler', () => {
  const a = createStore('')
  const b = createStore(true)
  const c = sample(a, b, (a, b) => ({a, b}))

  const sample_ssh_check1: Store<{a: string, b: boolean}> = c
  const sample_ssh_check2: Store<string> = c
  expect(typecheck).toMatchInlineSnapshot(`
    "
    --typescript--
    Type 'Store<{ a: string; b: boolean; }>' is not assignable to type 'Store<string>'.
      The types returned by 'getState()' are incompatible between these types.
        Type '{ a: string; b: boolean; }' is not assignable to type 'string'.

    --flow--
    Cannot assign 'c' to 'sample_ssh_check2'
      const sample_ssh_check2: Store<string> = c
                                               ^
      object type [1] is incompatible with string [2] in type argument 'State' [3]
          const sample_ssh_check1: Store<{a: string, b: boolean}> = c
                                     [1] ^^^^^^^^^^^^^^^^^^^^^^^
          const sample_ssh_check2: Store<string> = c
                                     [2] ^^^^^^
          declare export class Store<State> implements Unit<State> {
                                 [3] ^^^^^
    "
  `)
})
describe('sample(Store<T>):Store<T>', () => {
  test('correct case', () => {
    const a = createStore('')
    const sample_s_correct: Store<string> = sample(a)
    expect(typecheck).toMatchInlineSnapshot(`
      "
      --typescript--
      no errors

      --flow--
      no errors
      "
    `)
  })
  test('incorrect case', () => {
    const a = createStore('')
    const sample_s_incorrect: Store<number> = sample(a)
    expect(typecheck).toMatchInlineSnapshot(`
      "
      --typescript--
      Type 'Store<string>' is not assignable to type 'Store<number>'.
        The types returned by 'getState()' are incompatible between these types.
          Type 'string' is not assignable to type 'number'.

      --flow--
      Cannot assign 'sample(...)' to 'sample_s_incorrect'
        const sample_s_incorrect: Store<number> = sample(a)
                                                  ^^^^^^^^^
        string [1] is incompatible with number [2] in type argument 'State' [3]
            const a = createStore('')
                              [1] ^^
            const sample_s_incorrect: Store<number> = sample(a)
                                        [2] ^^^^^^
            declare export class Store<State> implements Unit<State> {
                                   [3] ^^^^^
      "
    `)
  })
  describe('edge case', () => {
    test('correct case', () => {
      const a = createStore('')
      const clock = createEvent()
      const sample_s_edge_correct: Event<string> = sample(a, clock)
      expect(typecheck).toMatchInlineSnapshot(`
        "
        --typescript--
        no errors

        --flow--
        no errors
        "
      `)
    })
    test('incorrect case', () => {
      const a = createStore('')
      const clock = createEvent()
      const sample_s_edge_incorrect: Event<number> = sample(a, clock)
      expect(typecheck).toMatchInlineSnapshot(`
        "
        --typescript--
        Type 'Event<string>' is not assignable to type 'Event<number>'.


        --flow--
        Cannot assign 'sample(...)' to 'sample_s_edge_incorrect'
          const sample_s_edge_incorrect: Event<number> = sample(a, clock)
                                                         ^^^^^^^^^^^^^^^^
          string [1] is incompatible with number [2] in type argument 'Payload' [3]
              const a = createStore('')
                                [1] ^^
              const sample_s_edge_incorrect: Event<number> = sample(a, clock)
                                               [2] ^^^^^^
              declare export class Event<Payload> implements Unit<Payload> {
                                     [3] ^^^^^^^
        "
      `)
    })
  })
})

test('edge case (should fail)', () => {
  const event1 = createEvent()
  const event2 = createEvent<{prop: string}>()

  const store = createStore('value')

  sample({
    source: store,
    clock: event1,
    fn: () => ({}),
    target: event2,
  })
  expect(typecheck).toMatchInlineSnapshot(`
    "
    --typescript--
    no errors

    --flow--
    no errors
    "
  `)
})
