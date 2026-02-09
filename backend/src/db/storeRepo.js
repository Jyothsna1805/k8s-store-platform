const stores = [];

export function createStore(store) {
  stores.push(store);
  return store;
}

export function listStores() {
  return stores;
}

export function deleteStore(id) {
  const index = stores.findIndex(s => s.id === id);
  if (index !== -1) {
    stores.splice(index, 1);
    return true;
  }
  return false;
}
