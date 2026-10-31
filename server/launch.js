#!/usr/bin/env node
/*
 * Start the HEPH-3D bridge for Claude Desktop, Claude Code or Codex.
 *
 * The bridge is Python and ships inside the HEPH-3D app, so this only has to
 * find the app and hand over: stdin and stdout pass straight through. HEPH-3D
 * writes where it is installed to ~/.heph-3d/bridge.json every time it
 * starts; failing that, the usual install folders are tried. With no app at
 * all, a tiny stand-in answers instead, so the assistant can tell the person
 * where to get it rather than showing a broken connection.
 *
 * Plain Node with no dependencies, so it runs on the Node that Claude
 * Desktop ships and on any Node a terminal user has.
 */
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DOWNLOAD = 'https://heph3d.com';
const STUDIO = 'http://127.0.0.1:8810';

function readPointer() {
  const f = process.env.HEPH_BRIDGE_POINTER || path.join(os.homedir(), '.heph-3d', 'bridge.json');
  try {
    const p = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (p && typeof p.command === 'string' && fs.existsSync(p.command)) {
      return { command: p.command, args: Array.isArray(p.args) ? p.args : [], env: p.env || {} };
    }
  } catch (_) { /* no pointer yet: HEPH-3D has not been opened */ }
  return null;
}

function firstPython(dir) {
  try {
    const names = fs.readdirSync(dir).filter((n) => /^python3(\.\d+)?$/.test(n)).sort().reverse();
    return names.length ? path.join(dir, names[0]) : null;
  } catch (_) { return null; }
}

function fromInstall(appDir, python) {
  if (!python || !fs.existsSync(python)) return null;
  const code = path.join(appDir, 'app');
  if (!fs.existsSync(code)) return null;
  return { command: python, args: ['-m', 'heph.mcp_server'], env: { PYTHONPATH: code } };
}

function guessInstall() {
  const home = os.homedir();
  if (process.platform === 'darwin') {
    for (const app of ['/Applications/HEPH-3D.app', path.join(home, 'Applications', 'HEPH-3D.app')]) {
      const res = path.join(app, 'Contents', 'Resources');
      const found = fromInstall(res, firstPython(path.join(res, 'runtime', 'bin')));
      if (found) return found;
    }
  } else if (process.platform === 'win32') {
    const roots = [process.env.ProgramFiles, process.env.ProgramW6432,
      process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs')];
    for (const r of roots.filter(Boolean)) {
      const dir = path.join(r, 'HEPH-3D');
      const found = fromInstall(dir, path.join(dir, 'runtime', 'python.exe'));
      if (found) return found;
    }
  } else {
    for (const dir of [path.join(home, 'HEPH-3D'), path.join(home, '.local', 'share', 'HEPH-3D'), '/opt/HEPH-3D']) {
      const found = fromInstall(dir, firstPython(path.join(dir, 'runtime', 'bin')));
      if (found) return found;
    }
  }
  return null;
}

function run(b) {
  const env = { ...process.env, HEPH_STUDIO: STUDIO, ...b.env };
  const child = spawn(b.command, b.args, { stdio: 'inherit', env, windowsHide: true });
  child.on('error', () => standIn(`HEPH-3D is installed but its bridge would not start (${b.command}).`));
  child.on('exit', (code, sig) => process.exit(sig ? 1 : (code || 0)));
  for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => child.kill(s));
}

/* No HEPH-3D on this computer: answer in MCP so Claude can say so plainly. */
function standIn(why) {
  const text = `${why} HEPH-3D is a free desktop app that runs on this computer. ` +
    `Download it from ${DOWNLOAD}, open it once, then start a new conversation.`;
  const tool = {
    name: 'heph_setup', title: 'Set up HEPH-3D',
    description: 'Explains how to install HEPH-3D, which this computer does not have yet. ' +
      'Call this whenever the user asks for HEPH-3D or to design a machine.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { title: 'Set up HEPH-3D', readOnlyHint: true, destructiveHint: false,
      idempotentHint: true, openWorldHint: false },
  };
  const reply = (id, result) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      let m;
      try { m = JSON.parse(line); } catch (_) { continue; }
      if (m.id === undefined || m.id === null) continue;          // a notification
      if (m.method === 'initialize') {
        reply(m.id, { protocolVersion: (m.params && m.params.protocolVersion) || '2024-11-05',
          capabilities: { tools: {} }, serverInfo: { name: 'heph', title: 'HEPH-3D', version: '0' },
          instructions: text });
      } else if (m.method === 'tools/list') {
        reply(m.id, { tools: [tool] });
      } else if (m.method === 'tools/call') {
        reply(m.id, { content: [{ type: 'text', text }] });
      } else if (m.method === 'ping') {
        reply(m.id, {});
      } else {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: m.id,
          error: { code: -32601, message: `HEPH-3D is not installed: ${m.method} is unavailable` } }) + '\n');
      }
    }
  });
  process.stdin.on('end', () => process.exit(0));
}

const bridge = readPointer() || guessInstall();
if (bridge) run(bridge);
else standIn('HEPH-3D is not installed on this computer yet.');
