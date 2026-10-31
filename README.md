# HEPH-3D for Claude Code and Codex

Design real, buildable machines with HEPH-3D and see them in 3D beside the conversation.

HEPH-3D is a free desktop app that turns a description into a machine you can
actually build: printable parts, real electronics at their true hole
patterns, wiring, a priced parts list and a QC report, all checked before
export. This plugin connects it to Claude Code or Codex, with a skill that
tells the assistant how to design with it.

## Install

1. Install HEPH-3D from [heph3d.com](https://heph3d.com) and open it once.
2. In Claude Code, run:

   ```
   /plugin marketplace add jangles-byte/HEPH3D-Plugin
   /plugin install heph@heph3d
   ```

   In Codex, run:

   ```
   codex plugin marketplace add jangles-byte/HEPH3D-Plugin
   codex plugin add heph@heph3d
   ```

Or, without leaving HEPH-3D: **Tools > Connect an assistant**, then
**Connect**. That does both steps for you.

## Try it

- "Design a desk fan with a 120 mm fan, a speed knob and a USB-C input."
- "Open my last HEPH project and show me what fails the checks."
- "Make a two-axis camera pan-tilt with two SG90 servos and export the STLs."

## How it works

The plugin runs a small Node launcher that finds HEPH-3D on this computer and
starts its bridge. The bridge only talks to HEPH-3D on your own machine;
nothing is sent to us. Without HEPH-3D installed, the assistant gets one tool
that explains where to download it.

The launcher passes its own environment on to the bridge so the bridge can
find Python and your projects. It reads no keys or tokens and sends nothing
anywhere.

## Data sent off your computer

- **Nothing to us.** The plugin and the bridge talk only to HEPH-3D on
  `127.0.0.1`.
- **A photo or sketch, only if you agree.** HEPH-3D can turn a picture into a
  3D shape using a free public model on Hugging Face. That uploads the
  picture to Hugging Face's servers, so the assistant must ask you first, and
  it is off otherwise.
- What you type to the assistant, and what it reads from your project, goes
  to Anthropic or OpenAI as part of your own conversation, under their
  policies.

Full details: https://heph3d.com/privacy

Needs Node.js 16 or later, which Claude Code and Codex already use.

- Guide: https://heph3d.com/guide
- Privacy: https://heph3d.com/privacy
- Support: contact@heph3d.com

Made by Merlin Picks LLC.
