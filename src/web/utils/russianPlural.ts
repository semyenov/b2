/**
 * Returns the correct Russian plural form based on the count
 *
 * Russian has 3 plural forms:
 * - Form 0 (1, 21, 31...): игра, буква
 * - Form 1 (2-4, 22-24...): игры, буквы
 * - Form 2 (5-20, 25-30...): игр, букв
 *
 * @param count - The number to pluralize for
 * @param forms - Array of [singular, few, many] forms
 * @returns The correct plural form for the count
 *
 * @example
 * getRussianPluralForm(1, ['игра', 'игры', 'игр']) // 'игра'
 * getRussianPluralForm(2, ['игра', 'игры', 'игр']) // 'игры'
 * getRussianPluralForm(5, ['игра', 'игры', 'игр']) // 'игр'
 * getRussianPluralForm(21, ['игра', 'игры', 'игр']) // 'игра'
 */
export function getRussianPluralForm(count: number, forms: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2]
  const mod100 = count % 100
  const mod10 = count % 10

  if (mod100 > 4 && mod100 < 20) {
    return forms[2] // 5-20: игр
  }
  if (mod10 > 4 || mod10 === 0) {
    return forms[2] // 0, 5-9: игр
  }
  return forms[cases[mod10]] // 1: игра, 2-4: игры
}
