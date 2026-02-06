const fs = require("fs");
const path = require("path");

const STATE_FILE = path.join(__dirname, "../store-state/stores.json");

function readState() {
  return JSON.parse(fs.readFileSync(STATE_FILE));
}

function writeState(data) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2));
}

async function createStore(storeId) {
  const state = readState();

  if (state[storeId]) {
    return { status: "exists", store: state[storeId] };
  }

  state[storeId] = {
    id: storeId,
    status: "provisioning",
    createdAt: new Date().toISOString()
  };

  writeState(state);

  // simulate provisioning delay
  await new Promise((r) => setTimeout(r, 2000));

  state[storeId].status = "ready";
  writeState(state);

  return { status: "created", store: state[storeId] };
}

function deleteStore(storeId) {
  const state = readState();

  if (!state[storeId]) {
    return { status: "not_found" };
  }

  delete state[storeId];
  writeState(state);

  return { status: "deleted" };
}

function listStores() {
  return readState();
}

module.exports = {
  createStore,
  deleteStore,
  listStores
};
