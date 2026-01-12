import {Result, Txt} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";
import {
  getUserId,
  hasCookieConsent,
  API_URL,
  enableCookies,
  setPendingEmail,
  getPendingEmail,
  hasPendingEmail,
  getPendingCheck,
  hasPendingCheck,
} from "@/util/session";
import {doCheck} from "@/components/Program/Console/Commands/check";

export function doSubscribe(email: string, withCookies: boolean, print?: (txt: Txt | Txt[]) => void): Result {
  let userId: string | undefined;

  if (withCookies) {
    enableCookies();
    const session = getUserId();
    userId = session?.userId;
  }

  const output: Txt[] = [];
  output.push({s: `Subscribing ${email}...`});
  if (userId) {
    output.push({s: ` (session: ${userId.slice(0, 8)}...)`});
  } else {
    output.push({s: " (anonymous)"});
  }

  fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, userId: userId || null}),
  })
    .then(response => response.json())
    .then(data => {
      if (print) {
        if (data.success) {
          print({s: 'Subscribed! Check your email for the challenge code.', c: 'highlight'});
        } else {
          print({s: 'Subscription failed: ' + (data.error || 'Unknown error'), c: 'error'});
        }
      }
    })
    .catch(err => {
      if (print) {
        print({s: 'Network error: ' + err.message, c: 'error'});
      }
    });

  return {exitCode: 0, output};
}

export const emailCommand: Command = {
  argCount: [0, 2],
  help: "Subscribe to updates with your email.\n\nUsage:\n  email <your@email.com>     Subscribe (asks about cookies)\n  email Y <your@email.com>   Subscribe with session tracking\n  email N <your@email.com>   Subscribe anonymously",
  description: "Subscribe to updates",

  run: (args: string[], context: ConsoleContext): Result => {
    if (args.length === 0) {
      return {
        exitCode: 1,
        output: [
          {s: "Usage: email <your@email.com>", c: "highlight"},
          {s: "\n\nSubscribe to receive updates."}
        ]
      };
    }

    let email: string;
    let useSession: boolean | null = null;

    const firstArg = args[0].toUpperCase();
    if (firstArg === 'Y' || firstArg === 'YES' || firstArg === 'N' || firstArg === 'NO') {
      if (args.length < 2) {
        return {
          exitCode: 1,
          output: {s: "Usage: email Y <your@email.com> or email N <your@email.com>", c: "error"}
        };
      }
      useSession = firstArg === 'Y' || firstArg === 'YES';
      email = args[1];
    } else {
      email = args[0];
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        exitCode: 1,
        output: [
          {s: "Invalid email format.", c: "error"},
          {s: "\nUsage: email your@email.com"}
        ]
      };
    }

    if (useSession === null && !hasCookieConsent()) {
      setPendingEmail(email);
      return {
        exitCode: 0,
        output: [
          {s: "Enable cookies for session tracking? [Y/n]", c: "highlight"},
          {s: "\n\n  Y / yes", c: "highlight"},
          {s: "  - Accept cookies, link session"},
          {s: "\n  n / no", c: "highlight"},
          {s: "   - Subscribe anonymously"}
        ]
      };
    }

    if (useSession === null && hasCookieConsent()) {
      useSession = true;
    }

    return doSubscribe(email, useSession ?? false, context.print);
  }
};

export const yCommand: Command = {
  argCount: [0, 0],
  help: "Confirm with yes",
  description: "Confirm yes",
  unlisted: true,

  run: (_args: string[], context: ConsoleContext): Result => {
    if (hasPendingEmail()) {
      const email = getPendingEmail();
      if (email) return doSubscribe(email, true, context.print);
    }
    if (hasPendingCheck()) {
      const answer = getPendingCheck();
      if (answer) return doCheck(answer, true, context.print);
    }
    return {exitCode: 1, output: {s: "Nothing to confirm.", c: "error"}};
  }
};

export const nCommand: Command = {
  argCount: [0, 0],
  help: "Confirm with no",
  description: "Confirm no",
  unlisted: true,

  run: (_args: string[], context: ConsoleContext): Result => {
    if (hasPendingEmail()) {
      const email = getPendingEmail();
      if (email) return doSubscribe(email, false, context.print);
    }
    if (hasPendingCheck()) {
      const answer = getPendingCheck();
      if (answer) return doCheck(answer, false, context.print);
    }
    return {exitCode: 1, output: {s: "Nothing to confirm.", c: "error"}};
  }
};
