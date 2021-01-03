import { Rcon } from './rcon.ts';
import { terminal } from './terminal.ts';

export default Rcon;

if (import.meta.main) {
  const { RCON_HOST, RCON_PORT, RCON_PASSWORD } = Deno.env.toObject();

  const rcon = new Rcon(RCON_HOST, +RCON_PORT || undefined, RCON_PASSWORD);

  for await (const command of terminal()) {
    if (command.toLowerCase() === 'quit' || command.toLowerCase() === 'exit')
      break;
    if (!command) continue;
    try {
      const response = await rcon.sendCmd(command);
      console.log(response);
    } catch (e) {
      console.error(e.message);
    }
  }
  rcon.disconnect();
}
