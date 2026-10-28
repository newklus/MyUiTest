type Obj = Record<string, unknown>;

export const isObj = (v: unknown): v is Obj =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

/** 깊은 병합. 객체는 합치고, 배열과 원시값은 b가 a를 대체합니다. undefined는 무시합니다. */
export function merge<T>(a: T, b: unknown): T {
  if (!isObj(b)) return a;
  const out: Obj = { ...(a as Obj) };
  for (const [k, v] of Object.entries(b)) {
    if (v === undefined) continue;
    out[k] = isObj(v) ? merge(isObj(out[k]) ? out[k] : {}, v) : v;
  }
  return out as T;
}

export function getPath(o: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((v, k) => (isObj(v) ? v[k] : undefined), o);
}

export function setPath(o: Obj, path: string, value: unknown): void {
  const keys = path.split('.');
  let cur = o;
  for (const k of keys.slice(0, -1)) {
    if (!isObj(cur[k])) cur[k] = {};
    cur = cur[k] as Obj;
  }
  cur[keys[keys.length - 1]] = value;
}

/** 값을 지우고, 그 때문에 비게 된 상위 객체도 정리합니다. */
export function unsetPath(o: Obj, path: string): void {
  const keys = path.split('.');
  const stack: Obj[] = [o];
  let cur = o;
  for (const k of keys.slice(0, -1)) {
    if (!isObj(cur[k])) return;
    cur = cur[k] as Obj;
    stack.push(cur);
  }
  delete cur[keys[keys.length - 1]];
  for (let i = keys.length - 2; i >= 0; i--) {
    const child = stack[i][keys[i]];
    if (isObj(child) && Object.keys(child).length === 0) delete stack[i][keys[i]];
  }
}

export const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
