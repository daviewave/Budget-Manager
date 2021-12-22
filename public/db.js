const indexdb =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;

const request = indexdb.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onerror = function (e) {
  console.log("There was an error");
};

request.onsuccess = ({ target }) => {
  db = target.result;
  if (navigator.onLine) {
    checkDb();
  }
};

const transaction = db.transaction(["pending"], "readwrite");
const store = transaction.objectStore("pending");

const saveTransaction = () => {
  store.add();
};

const checkDb =
  ("/",
  async (req, res) => {
    const getAll = store.getAll();

    getAll.onsuccess = async () => {
      try {
        const response = await fetch("/api/transaction/bulk");
        res.status(200).json(response);
        store.clear();
      } catch (err) {
        res.status(500).json(err);
      }
    };
  });

window.addEventListener("online", checkDb);
