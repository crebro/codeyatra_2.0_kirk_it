const DB_NAME = 'VideoToDocDB';
const DB_VERSION = 1;
const STORE_EXTRACTIONS = 'extractions';
const STORE_FRAMES = 'frames';

export interface VideoExtraction {
  id: string;
  url: string;
  title: string | null;
  createdAt: number;
}

export interface Frame {
  id: string;
  videoId: string;
  blob: Blob;
  timestamp: number;
  index: number;
}

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_EXTRACTIONS)) {
        db.createObjectStore(STORE_EXTRACTIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_FRAMES)) {
        const frameStore = db.createObjectStore(STORE_FRAMES, { keyPath: 'id' });
        frameStore.createIndex('videoId', 'videoId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveExtraction(extraction: VideoExtraction, frames: Omit<Frame, 'id'>[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_EXTRACTIONS, STORE_FRAMES], 'readwrite');

  const extractionStore = tx.objectStore(STORE_EXTRACTIONS);
  const frameStore = tx.objectStore(STORE_FRAMES);

  extractionStore.put(extraction);

  for (const frame of frames) {
    const frameId = `${extraction.id}_${frame.index}`;
    frameStore.put({ ...frame, id: frameId });
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getExtractions(): Promise<VideoExtraction[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_EXTRACTIONS, 'readonly');
  const store = tx.objectStore(STORE_EXTRACTIONS);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const results = request.result as VideoExtraction[];
      // Sort by createdAt descending
      resolve(results.sort((a, b) => b.createdAt - a.createdAt));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getExtraction(id: string): Promise<VideoExtraction | undefined> {
  const db = await openDB();
  const tx = db.transaction(STORE_EXTRACTIONS, 'readonly');
  const store = tx.objectStore(STORE_EXTRACTIONS);
  const request = store.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getFrames(videoId: string): Promise<Frame[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_FRAMES, 'readonly');
  const store = tx.objectStore(STORE_FRAMES);
  const index = store.index('videoId');
  const request = index.getAll(videoId);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const results = request.result as Frame[];
      // Sort by index
      resolve(results.sort((a, b) => a.index - b.index));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteExtraction(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_EXTRACTIONS, STORE_FRAMES], 'readwrite');

  const extractionStore = tx.objectStore(STORE_EXTRACTIONS);
  const frameStore = tx.objectStore(STORE_FRAMES);

  extractionStore.delete(id);

  const index = frameStore.index('videoId');
  const request = index.getAllKeys(id);

  request.onsuccess = () => {
    for (const key of request.result) {
      frameStore.delete(key);
    }
  };

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateExtractionTitle(id: string, title: string): Promise<void> {
  const extraction = await getExtraction(id);
  if (!extraction) return;

  extraction.title = title;
  const db = await openDB();
  const tx = db.transaction(STORE_EXTRACTIONS, 'readwrite');
  const store = tx.objectStore(STORE_EXTRACTIONS);
  store.put(extraction);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
