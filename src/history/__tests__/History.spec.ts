import { beforeEach, describe, expect, it } from 'vitest'
import { History } from '../History'
import type { Command } from '../History'

const createCommand = (log: string[], name: string): Command => ({
  execute: () => log.push(`execute ${name}`),
  undo: () => log.push(`undo ${name}`),
})

describe('History', () => {
  let history: History
  let log: string[]

  beforeEach(() => {
    history = new History()
    log = []
  })

  it('выполняет команду', () => {
    history.execute(createCommand(log, 'a'))

    expect(log).toEqual(['execute a'])
    expect(history.canUndo).toBe(true)
    expect(history.canRedo).toBe(false)
  })

  it('отменяет команды в обратном порядке', () => {
    history.execute(createCommand(log, 'a'))
    history.execute(createCommand(log, 'b'))
    log.length = 0

    history.undo()
    history.undo()

    expect(log).toEqual(['undo b', 'undo a'])
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(true)
  })

  it('повторяет отменённые команды в исходном порядке', () => {
    history.execute(createCommand(log, 'a'))
    history.execute(createCommand(log, 'b'))
    history.undo()
    history.undo()
    log.length = 0

    history.redo()
    history.redo()

    expect(log).toEqual(['execute a', 'execute b'])
    expect(history.canRedo).toBe(false)
  })

  it('сбрасывает отменённые команды после новой', () => {
    history.execute(createCommand(log, 'a'))
    history.undo()
    history.execute(createCommand(log, 'b'))

    expect(history.canRedo).toBe(false)
  })

  it('ничего не делает, если отменять или повторять нечего', () => {
    history.undo()
    history.redo()

    expect(log).toEqual([])
  })
})
