import { Dictionary } from "./engine/balda";
import { consola } from "consola";

export interface SizedDictionary extends Dictionary {
  size(): number;
  hasPrefix(prefix: string): boolean;
  getAlphabet(): string[];
  getLetterFrequency(): Record<string, number>;
}

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isWord = false;
}

export class TrieDictionary implements SizedDictionary {
  private readonly root = new TrieNode();
  private wordCount = 0;
  private readonly alphabetSet = new Set<string>();
  private readonly frequency = new Map<string, number>();

  insert(word: string): void {
    const normalized = word.trim().toUpperCase();
    if (!normalized) return;
    let node = this.root;
    for (const ch of normalized) {
      this.alphabetSet.add(ch);
      this.frequency.set(ch, (this.frequency.get(ch) ?? 0) + 1);
      let next = node.children.get(ch);
      if (!next) {
        next = new TrieNode();
        node.children.set(ch, next);
      }
      node = next;
    }
    if (!node.isWord) {
      node.isWord = true;
      this.wordCount += 1;
    }
  }

  has(word: string): boolean {
    const node = this.traverse(word);
    return node?.isWord === true;
  }

  hasPrefix(prefix: string): boolean {
    return this.traverse(prefix) != null;
  }

  size(): number {
    return this.wordCount;
  }

  getAlphabet(): string[] {
    return Array.from(this.alphabetSet.values());
  }

  getLetterFrequency(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [k, v] of this.frequency) out[k] = v;
    return out;
  }

  private traverse(sequence: string): TrieNode | null {
    const normalized = sequence.trim().toUpperCase();
    if (!normalized) return null;
    let node: TrieNode | undefined = this.root;
    for (const ch of normalized) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node ?? null;
  }
}

export async function loadDictionaryFromFile(path: string): Promise<SizedDictionary> {
  const text = await Bun.file(path).text();
  const dict = new TrieDictionary();
  let lines = 0;
  for (const rawLine of text.split(/\r?\n/g)) {
    lines++;
    const word = rawLine.trim().toUpperCase();
    if (!word) continue;
    // Skip words with spaces or digits
    if (!/^[A-ZА-ЯЁ]+$/.test(word)) continue;
    dict.insert(word);
  }
  consola.success(`Dictionary loaded from ${path}: ${dict.size()} words (processed ${lines} lines)`);
  return dict;
}

export class AllowAllSizedDictionary implements SizedDictionary {
  private readonly alphabet: string[];
  constructor(alphabet: string[] = []) {
    this.alphabet = alphabet.length ? alphabet : Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ");
  }
  has(word: string): boolean {
    return !!word?.trim();
  }
  hasPrefix(prefix: string): boolean {
    return !!prefix?.trim();
  }
  size(): number {
    return 0;
  }
  getAlphabet(): string[] {
    return this.alphabet;
  }
  getLetterFrequency(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const ch of this.alphabet) out[ch] = 1;
    return out;
  }
}
