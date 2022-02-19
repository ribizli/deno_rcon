# deno_rcon

An RCON client for Source RCON Protocol (e.g. for CS:GO server) (https://developer.valvesoftware.com/wiki/Source_RCON_Protocol)

## cli usage

```
export RCON_HOST=localhost RCON_PASSWORD=mypw RCON_PORT=27015
deno run --allow-net --allow-env --unstable https://deno.land/x/deno_rcon/mod.ts
```

## usage in code

```typescript
import { Rcon } from 'https://deno.land/x/deno_rcon/mod.ts';

const rcon = new Rcon('localhost', 27015, 'mypw');

const response = await rcon.sendCmd(command);

console.log(response);

```
