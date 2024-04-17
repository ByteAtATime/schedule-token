# Schedule Token

This is a demo app I built to demonstrate the usage of [Scaffold-ETH Svelte](https://github.com/ByteAtATime/scaffold-eth-svelte). It's a very simple dApp that allows you to schedule a token send.

## How it works

There are two parts to this app: the frontend, built in Svelte, and the backend, built in Solidity.

There are minimal changes to the Hardhat backend, the only change being in `packages/hardhat/deploy/99_generateTsAbis.ts` where the path of the resulting contract is changed.

The bulk of the changes are in the Svelte frontend, located at `packages/svelte`.

Lastly, to execute the token sends, I have set up a simple `cron` job running every 15 minutes that calls the `executeScheduledSends` function in the contract. The script is very simple, and can be found at `execute.js`.
