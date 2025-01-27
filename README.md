# OCM Moderation Discord Bot

## Configuration file

The project configuration must be described in a `.env` file. Example file `.env.example` is [here](https://github.com/kotoyama/ocm-moderation-bot/blob/master/src/config/env/.env.example).

## Installation

```bash
$ bun install
```

## Running the app

```bash
# development
$ bun dev

# production mode
$ bun start
```

## Bot configuration

- Make sure that the Bot role is higher than the Mod role (Server Settings -> Roles)
- The Bot must have access to all channels where you want to execute its commands, as well as access to log channels
