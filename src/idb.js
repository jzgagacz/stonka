import { openDB } from 'idb'

export const idb = {
    db: openDB("db", 1, {
        upgrade(db) {
            db.createObjectStore('dailystocks');
            db.createObjectStore('intradaystocks');
            db.createObjectStore('followed');
            db.createObjectStore('compinfo');
            db.createObjectStore('intradaycrypto');
            db.createObjectStore('alerts');
            db.createObjectStore('settings');
            db.createObjectStore('timestamps');
            db.createObjectStore('token');
        },
    })
};