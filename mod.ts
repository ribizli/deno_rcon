import { Rcon } from './rcon.ts';

export default Rcon;

if (import.meta.main) {
  const { RCON_HOST, RCON_PORT, RCON_PASSWORD } = Deno.env.toObject();

  const rcon = new Rcon(RCON_HOST, +RCON_PORT || undefined, RCON_PASSWORD);

  let command = 'status';

  while (true) {
    if (command.toLowerCase() === 'quit') break;
    if (command !== '') {
      try {
        const response = await rcon.sendCmd(command);
        console.log(response);
      } catch (e) {
        console.error(e);
        break;
      }
    }

    command = window.prompt('#>') || '';
  }

  rcon.disconnect();
}
