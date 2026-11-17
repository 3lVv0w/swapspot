export function acceptsWakeCommand(text: string, expectingResponse: boolean): boolean {
  if (/\bhey[\s,-]+swap\s*spot\b/i.test(text)) return true;
  return expectingResponse && /\b(yes|yeah|yep|yup|sure|okay|ok|no|nope|not now|maybe later|cancel|stop)\b|ใช่|ไม่/i.test(text);
}
