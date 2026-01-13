import {Result, Txt} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";
import {
  getUserId,
  hasCookieConsent,
  API_URL,
  enableCookies,
  setPendingCheck,
  hasAskedThisSession,
  markAskedThisSession,
} from "@/util/session";

export function doCheck(answer: string, withCookies: boolean, print?: (txt: Txt | Txt[]) => void): Result {
  let userId: string | undefined;

  if (withCookies) {
    enableCookies();
    const session = getUserId();
    userId = session?.userId;
  }

  const output: Txt[] = [];
  output.push({s: `Checking answer...`});

  fetch(`${API_URL}/check`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({answer, userId: userId || null}),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Request failed');
        });
      }
      return response.json();
    })
    .then(data => {
      if (print) {
        if (data.correct) {
          print({s: 'Correct! Challenge completed.', c: 'highlight'});
        } else {
          print({s: 'Incorrect answer. Try again!', c: 'error'});
        }
      }
    })
    .catch(err => {
      if (print) {
        print({s: 'Error: ' + err.message, c: 'error'});
      }
    });

  return {exitCode: 0, output};
}

export const checkCommand: Command = {
  argCount: [0, 2],
  help: "Check your answer for a challenge.\n\nUsage: check <answer>",
  description: "Validate challenge answer",

  run: (args: string[], context: ConsoleContext): Result => {
    if (args.length === 0) {
      return {
        exitCode: 1,
        output: [
          {s: "Usage: check <answer>", c: "highlight"},
          {s: "\n\nValidate your answer for the challenge."}
        ]
      };
    }

    let answer: string;
    let useSession: boolean | null = null;

    const firstArg = args[0].toUpperCase();
    if (firstArg === 'Y' || firstArg === 'YES' || firstArg === 'N' || firstArg === 'NO') {
      if (args.length < 2) {
        return {
          exitCode: 1,
          output: {s: "Usage: check Y <answer> or check N <answer>", c: "error"}
        };
      }
      useSession = firstArg === 'Y' || firstArg === 'YES';
      answer = args[1];
    } else {
      answer = args[0];
    }

    if (useSession === null && !hasCookieConsent() && !hasAskedThisSession()) {
      markAskedThisSession();
      setPendingCheck(answer);
      return {
        exitCode: 0,
        output: [
          {s: "Enable cookies to track your progress? [Y/n]", c: "highlight"},
          {s: "\n\n  Y / yes", c: "highlight"},
          {s: "  - Save your wins to your session"},
          {s: "\n  n / no", c: "highlight"},
          {s: "   - Check anonymously (limited)"}
        ]
      };
    }

    if (useSession === null) {
      useSession = hasCookieConsent();
    }

    return doCheck(answer, useSession, () => {});
  },
  continue: (_command: string, _input:string[], _context:ConsoleContext):Result => {
    return {exitCode: 0, output: []}
  }
};
