#!/usr/bin/env node
/**
 * Local realtime probe: connects to Reverb as one or more actors, asks the API to
 * authorize each private channel, and prints what each actor is allowed to join
 * and which events reach it. Tokens come from stdin and are never printed.
 *
 * stdin: {"apiUrl": "http://127.0.0.1:8100/api/v1", "wsUrl": "ws://127.0.0.1:8180/app/<key>",
 *         "seconds": 10, "origin": null,
 *         "actors": [{"name": "branch", "token": "...", "channels": ["private-branch.<id>"]}]}
 *
 * Needs Node 22 or newer (built-in WebSocket and fetch). See docs/waves/runbook.md.
 */
import { text } from 'node:stream/consumers';

const spec = JSON.parse(await text(process.stdin));
const log = (...parts) => console.log(new Date().toISOString().slice(11, 23), ...parts);

async function authorize(actor, socketId, channel) {
  const response = await fetch(`${spec.apiUrl}/broadcasting/auth`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${actor.token}`,
    },
    body: JSON.stringify({ socket_id: socketId, channel_name: channel }),
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, auth: body.auth };
}

function connect(actor) {
  // Native mobile clients send no Origin header; set spec.origin to act like a browser.
  const options = spec.origin ? { headers: { Origin: spec.origin } } : undefined;
  const socket = new WebSocket(spec.wsUrl, options);
  const send = (event, data) => socket.send(JSON.stringify({ event, data }));

  socket.addEventListener('message', async ({ data: raw }) => {
    const message = JSON.parse(raw);
    const data = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;

    if (message.event === 'pusher:connection_established') {
      log(actor.name, 'connected');
      for (const channel of actor.channels) {
        const { status, auth } = await authorize(actor, data.socket_id, channel);
        if (auth) send('pusher:subscribe', { channel, auth });
        else log(actor.name, channel, 'refused', status);
      }
    } else if (message.event === 'pusher:ping') {
      send('pusher:pong', {});
    } else if (message.event === 'pusher:error') {
      log(actor.name, 'error', data?.code, data?.message);
    } else if (message.event === 'pusher_internal:subscription_succeeded') {
      log(actor.name, message.channel, 'subscribed');
    } else {
      log(actor.name, message.channel, 'event', message.event);
    }
  });
  socket.addEventListener('close', ({ code }) => log(actor.name, 'closed', code));
  socket.addEventListener('error', () => log(actor.name, 'socket error'));
  return socket;
}

const sockets = spec.actors.map(connect);
setTimeout(() => {
  log('done');
  for (const socket of sockets) socket.close();
  setTimeout(() => process.exit(0), 300);
}, (spec.seconds ?? 10) * 1000);
