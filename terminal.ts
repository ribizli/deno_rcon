// https://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html

import { equal } from "https://deno.land/std/bytes/mod.ts";

const ENTER = new Uint8Array([13]);
const CTRL_C = new Uint8Array([3]);
const ARROW_UP = new Uint8Array([27, 91, 65]);
const ARROW_DOWN = new Uint8Array([27, 91, 66]);
const ARROW_RIGHT = new Uint8Array([27, 91, 67]);
const ARROW_LEFT = new Uint8Array([27, 91, 68]);
const BACKSPACE = new Uint8Array([127]);
const DEL = new Uint8Array([27, 91, 51, 126]);

if (import.meta.main) {
  for await (const command of terminal()) {
    command && console.log(`command: \u001b[31m\u001b[1m${command}\u001b[0m`);
  }
}

export async function* terminal(prompt = "> ") {
  try {
    Deno.setRaw(Deno.stdin.rid, true);
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const history = new Set<string>();
    let historyPointer = 0;
    let command = "";
    let pos = 0;

    await Deno.stdout.write(encoder.encode(prompt));

    while (true) {
      for await (const chunk of Deno.iter(Deno.stdin)) {
        const key = {
          enter: equal(chunk, ENTER),
          up: equal(chunk, ARROW_UP),
          down: equal(chunk, ARROW_DOWN),
          left: equal(chunk, ARROW_LEFT),
          right: equal(chunk, ARROW_RIGHT),
          backspace: equal(chunk, BACKSPACE),
          del: equal(chunk, DEL),
          ctrlC: equal(chunk, CTRL_C),
        };
        if (key.enter) {
          console.log("");
          const finalCommand = command.trim();
          history.delete(command);
          history.add(command);
          historyPointer = history.size;
          command = "";
          pos = 0;
          yield finalCommand;
        } else if (
          (pos > 0 && key.backspace) ||
          (pos < command.length && key.del)
        ) {
          pos += key.backspace ? -1 : 0;
          command = command.substr(0, pos) + command.substr(pos + 1);
        } else if (key.ctrlC) {
          return;
        } else if (
          (historyPointer > 0 && key.up) ||
          (historyPointer < history.size && key.down)
        ) {
          historyPointer += key.up ? -1 : 1;
          command = [...history][historyPointer] ?? "";
          pos = command.length;
        } else if (
          (pos > 0 && key.left) ||
          (pos < command.length && key.right)
        ) {
          pos += key.left ? -1 : 1;
        } else if (chunk[0] > 27 && chunk[0] !== 127) {
          const char = decoder.decode(chunk);
          command = command.substr(0, pos) + char + command.substr(pos);
          pos++;
        } else {
          continue;
        }

        await Deno.stdout.write(
          encoder.encode(
            `\u001b[1000D\u001b[2K${prompt}${command}\u001b[1000D\u001b[${
              pos + prompt.length
            }C`
          )
        );
      }
    }
  } finally {
    Deno.setRaw(Deno.stdin.rid, false);
  }
}
