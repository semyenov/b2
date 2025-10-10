import { Dictionary } from "./engine/balda";
import { consola } from "consola";

export interface SizedDictionary extends Dictionary {
  size(): number;
  hasPrefix(prefix: string): boolean;
}

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isWord = false;
}

export class TrieDictionary implements SizedDictionary {
  private readonly root = new TrieNode();
  private wordCount = 0;

  insert(word: string): void {
    const normalized = word.trim().toUpperCase();
    if (!normalized) return;
    let node = this.root;
    for (const ch of normalized) {
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
