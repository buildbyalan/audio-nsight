interface StorageAdapter {
  init(): Promise<void>;
  setItem(key: string, value: any): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

class IndexedDBAdapter implements StorageAdapter {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'datavoxDB';
  private readonly version = 1;
  private readonly stores = {
    user: 'userStore',
    templates: 'templateStore',
    processes: 'processStore',
    audio: 'audioStore'
  };

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(this.stores.user)) {
          db.createObjectStore(this.stores.user);
        }
        if (!db.objectStoreNames.contains(this.stores.templates)) {
          db.createObjectStore(this.stores.templates);
        }
        if (!db.objectStoreNames.contains(this.stores.processes)) {
          db.createObjectStore(this.stores.processes);
        }
        if (!db.objectStoreNames.contains(this.stores.audio)) {
          db.createObjectStore(this.stores.audio);
        }
      };
    });
  }

  async setItem(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const store = key.split('_')[0];
      const tx = this.db!.transaction(this.stores[store] || this.stores.user, 'readwrite');
      const objectStore = tx.objectStore(this.stores[store] || this.stores.user);
      const request = objectStore.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getItem<T>(key: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const store = key.split('_')[0];
      const tx = this.db!.transaction(this.stores[store] || this.stores.user, 'readonly');
      const objectStore = tx.objectStore(this.stores[store] || this.stores.user);
      const request = objectStore.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removeItem(key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const store = key.split('_')[0];
      const tx = this.db!.transaction(this.stores[store] || this.stores.user, 'readwrite');
      const objectStore = tx.objectStore(this.stores[store] || this.stores.user);
      const request = objectStore.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(Object.values(this.stores), 'readwrite');
      let completed = 0;
      let errored = false;

      Object.values(this.stores).forEach(storeName => {
        const request = tx.objectStore(storeName).clear();
        request.onerror = () => {
          if (!errored) {
            errored = true;
            reject(request.error);
          }
        };
        request.onsuccess = () => {
          completed++;
          if (completed === Object.keys(this.stores).length) {
            resolve();
          }
        };
      });
    });
  }
}

class LocalStorageAdapter implements StorageAdapter {
  async init(): Promise<void> {
    // No initialization needed for localStorage
    return Promise.resolve();
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return Promise.resolve(item ? JSON.parse(item) : null);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

// Create and export storage instance with SSR support
let storage: StorageAdapter;

if (typeof window === 'undefined') {
  // Server-side dummy adapter
  storage = {
    init: async () => {},
    setItem: async () => {},
    getItem: async () => null,
    removeItem: async () => {},
    clear: async () => {},
  };
} else {
  // Client-side storage adapter
  storage = ('indexedDB' in window)
    ? new IndexedDBAdapter()
    : new LocalStorageAdapter();

  // Initialize storage
  storage.init().catch(console.error);
}

export default storage;
