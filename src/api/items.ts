import type { Item } from '@/types/tree'
import { delay } from '@/utils/delay'

const LOADING_DELAY = 2000

export const fetchItems = async (): Promise<Item[]> => {
  await delay(LOADING_DELAY)

  const response = await fetch('/items.json')
  return response.json()
}
