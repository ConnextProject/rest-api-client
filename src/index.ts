import fastify from "fastify";
import Helmet from "fastify-helmet";

import config from "./config";

import ClientManager from "./client";
import { requireParam, fetchAll } from "./utilities";

const app = fastify({
  logger: { prettyPrint: config.debug ? { forceColor: true } : undefined },
});

let clientManager: ClientManager;

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
    await requireParam(req.params, "assetId");
    res.status(200).send(await clientManager.balance(req.params.assetId));
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.get("/config", async (req, res) => {
  try {
    res.status(200).send(await clientManager.getConfig());
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.get("/hashlock-status/:lockHash", async (req, res) => {
  try {
    await requireParam(req.params, "lockHash");
    res.status(200).send(await clientManager.hashLockStatus(req.params.lockHash));
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.get("/appinstance-details/:appInstanceId", async (req, res) => {
  try {
    await requireParam(req.params, "appInstanceId");
    res.status(200).send(await clientManager.getAppInstanceDetails(req.params.appInstanceId));
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

// -- POST ---------------------------------------------------------------- //

app.post("/connect", async (req, res) => {
  try {
    if (!clientManager.mnemonic) {
      await requireParam(req.body, "mnemonic");
    }
    await clientManager.initClient(req.body);
    res.status(200).send(await clientManager.getConfig());
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.post("/mnemonic", async (req, res) => {
  try {
    await requireParam(req.body, "mnemonic");
    clientManager.setMnemonic(req.body.mnemonic);
    res.status(200).send({ success: true });
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.post("/hashlock-transfer", async (req, res) => {
  try {
    await requireParam(req.body, "amount");
    await requireParam(req.body, "assetId");
    await requireParam(req.body, "lockHash");
    await requireParam(req.body, "timelock");
    await requireParam(req.body, "recipient");
    res.status(200).send(await clientManager.hashLockTransfer(req.body));
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.post("/hashlock-resolve", async (req, res) => {
  try {
    await requireParam(req.body, "lockHash");
    res.status(200).send(await clientManager.hashLockResolve(req.body.lockHash));
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.post("/deposit", async (req, res) => {
  try {
    await requireParam(req.body, "amount");
    await requireParam(req.body, "assetId");
    res.status(200).send(await clientManager.deposit(req.body));
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.post("/subscribe", async (req, res) => {
  try {
    await requireParam(req.body, "event");
    await requireParam(req.body, "webhook");
    res.status(200).send(await clientManager.subscribe(req.body));
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.post("/subscribe/batch", async (req, res) => {
  try {
    await requireParam(req.body, "params", "array");
    res.status(200).send(await clientManager.subscribeBatch(req.body.params));
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

// -- DELETE ---------------------------------------------------------------- //

app.delete("/subscribe", async (req, res) => {
  try {
    await requireParam(req.body, "id");
    res.status(200).send(await clientManager.unsubscribe(req.params.id));
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.delete("/subscribe/batch", async (req, res) => {
  try {
    await requireParam(req.body, "ids", "array");
    res.status(200).send(await clientManager.unsubcribeBatch(req.body.ids));
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.delete("/subscribe/all", async (req, res) => {
  try {
    res.status(200).send(await clientManager.unsubscribeAll());
  } catch (error) {
    app.log.error(error);
    res.status(500).send({ message: error.message });
  }
});

// -- INIT ---------------------------------------------------------------- //

app.ready(async () => {
  const { mnemonic, subscriptions, initOptions } = await fetchAll();
  clientManager = new ClientManager({ mnemonic, subscriptions, logger: app.log });
  if (initOptions && Object.keys(initOptions).length) {
    await clientManager.initClient(initOptions);
  }
});

const [host, port] = config.host.split(":");
app.listen(+port, host, (err, address) => {
  if (err) throw err;
  app.log.info(`Server listening on ${address}`);
});
