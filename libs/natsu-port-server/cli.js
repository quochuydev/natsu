#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const args = require('arg')({
  '--config': String,
  '--nats-uri': String,
  '--nats-auth-subjects': String,
  '--nats-non-auth-subjects': String,
  '--port': Number,
  '--path': String,
  '--help': Boolean,
});

if (args['--help']) {
  const Table = require('cli-table3');
  const guideTable = new Table({
    head: ['Argument', 'Required', 'Default', 'Description'],
    colWidths: [30, 20, 20],
  });
  guideTable.push(
    [
      '--nats-uri',
      false,
      'localhost:4222',
      `It's nats address which will be connected`,
    ],
    [
      '--nats-auth-subjects',
      false,
      'undefined',
      `It can be a string with many urls which delimited by ','.\nServer will send request to them for authentication.`,
    ],
    [
      '--nats-non-auth-subjects',
      false,
      'undefined',
      `It can be a string with many urls which delimited by ','.\nServer won't authenticate them even authentication enabled.`,
    ],
    ['--port', false, 8080, `It's port which server run at.`],
    [
      '--path',
      false,
      '/',
      `It's an endpoint which server will listen to convert http request to nats request then send back http response to client`,
    ],
    [
      '--config',
      false,
      'undefined',
      `It's used to load configuration from a js file.\nThe file should export an object has fields:\nNATS_URI?: String\nNATS_AUTH_SUBJECTS?: String\nNATS_NON_AUTHORIZED_SUBJECTS?: String\nSERVER_PORT?: Number\nSERVER_PATH?: String`,
    ]
  );
  console.log(guideTable.toString());
  return;
}

if (args['--config']) {
  const configPath = path.join(process.cwd(), args['--config']);
  const config = require(configPath);
  if (!config) {
    throw new Error(`Not found config file at ${configPath}`);
  }
  Object.entries(config || {}).forEach(([key, value]) => {
    process.env[key] = value;
  });
} else {
  process.env['NATS_URI'] = args['--nats-uri'];
  process.env['NATS_AUTH_SUBJECTS'] = args['--nats-auth-subjects'];
  process.env['NATS_NON_AUTHORIZED_SUBJECTS'] =
    args['--nats-non-auth-subjects'];
  process.env['SERVER_PORT'] = args['--port'];
  process.env['SERVER_PATH'] = args['--path'];
}

const serverPath = path.join(
  process.cwd(),
  'node_modules/@silenteer/natsu-port-server/dist/index.js'
);
if (!serverPath) {
  throw new Error(`Not found entry file at ${serverPath}`);
}
const server = require(serverPath).default;
server.start();
