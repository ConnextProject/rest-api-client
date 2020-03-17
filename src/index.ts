import fastify from "fastify";
import Helmet from "fastify-helmet";

import config from "./config";

import ClientManager from "./client";
import { requireParam } from "./utilities";

const app = fastify({ logger: config.debug });

const clientManager = new ClientManager();

app.register(Helmet);

// -- GET ---------------------------------------------------------------- //

app.get("/health", (req, res) => {
  res.status(204).send();
});

app.get("/hello", (req, res) => {
  res.status(200).send(`Hello World, this is Connext client`);
});

app.get("/balance/:assetId", async (req, res) => {
  try {
    requireParam(req.params, "assetId");
    res.status(200).send(await clientManager.balance(req.params.assetId));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get("/config", async (req, res) => {
  const config = clientManager.config;
  if (!config.multisigAddress) {
    res.status(500).send({ message: "Connext Client Not Yet Initialized" });
  }
  res.status(200).send(config);
});

app.get("hashlock-status/:hash", async (req, res) => {
  try {
    requireParam(req.params, "hash");
    res.status(200).send(await clientManager.hashLockStatus(req.params.hash));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// -- POST ---------------------------------------------------------------- //

app.post("/connect", async (req, res) => {
  try {
    if (!clientManager.mnemonic) {
      requireParam(req.body, "mnemonic");
    }
    await clientManager.initClient(req.body);
    res.status(200).send(clientManager.config);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/mnemonic", async (req, res) => {
  try {
    requireParam(req.body, "mnemonic");
    clientManager.mnemonic = req.body.mnemonic;
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/hashlock-transfer", async (req, res) => {
  try {
    res.status(200).send(await clientManager.hashLockTransfer(req.body));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/hashlock-resolve", async (req, res) => {
  try {
    requireParam(req.body, "preImage");
    res.status(200).send(await clientManager.resolveHashLock(req.body.preImage));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

const [host, port] = config.host.split(":");
app.listen(+port, host, (err, address) => {
  if (err) throw err;
  console.log(`Server listening on ${address}`);
  app.log.info(`Server listening on ${address}`);
});
