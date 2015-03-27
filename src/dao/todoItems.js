var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
sqlite3.verbose();
var IsThere = require("is-there");
var bcrypt = require("bcrypt");

function errorprint(err){
	if(err) console.error(arguments);
};

module.exports = {
	version: "1.0",
	file: "src/dao/todo.db",
	db: null,

	close: function(callback) {
		if (this.db) {
			this.db.close(callback);
			this.db = null;
		} else {
			callback();
		}
	},

	open: function(filename, callback) {
		this.file = filename;

		var exists = IsThere.sync(this.file);
		if (this.file === ":memory:" || !exists) {
			this.createDB(filename, callback);
		} else {
			this.db = new sqlite3.Database(this.file, sqlite3.OPEN_READWRITE, function(err) {
				if (err) errorprint(err);
				callback(err);
			});
		}


	},

	createDB: function(filename, callback) {
		this.file = filename;
		this.db = new sqlite3.Database(this.file, sqlite3.OPEN_READWRITE || sqlite3.OPEN_CREATE, function(err) {
			if (err) callback(err);
		});

		this.db.serialize();
			this.db.run("DROP TABLE IF EXISTS TodoItems",errorprint);
			this.db.run("DROP TABLE IF EXISTS TodoLists",errorprint);
			this.db.run("DROP TABLE IF EXISTS Users",errorprint);

			this.db.run("CREATE TABLE Users (userID INTEGER PRIMARY KEY, username TEXT, password TEXT)",errorprint);
			this.db.run("CREATE TABLE TodoLists (listID INTEGER PRIMARY KEY, listName TEXT, owner INTEGER, FOREIGN KEY(owner) REFERENCES Users(userID))",errorprint);
			this.db.run("CREATE TABLE TodoItems (itemID INTEGER PRIMARY KEY, listID INTEGER NOT NULL, itemName TEXT, itemText TEXT, state INTEGER, FOREIGN KEY(listID) REFERENCES TodoLists(listID))",errorprint);

			this.db.run("PRAGMA foreign_keys = ON", errorprint);
		this.db.parallelize();
		if (callback) callback();
	},

	getItems: function(listID, callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.getItems(listID, callback);
			});
			return;
		};

		var items = [];

		this.db.each("SELECT itemID,itemName,itemText,state FROM TodoItems WHERE listID=" + listID, function(err, row) {
			items.push({
				id: row.itemID,
				name: row.itemName,
				text: row.itemText,
				state: !!row.state
			});
		}, function() {
			callback(null, items);
		});
	},

	addItem: function(listID, name, text, state, callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.addItem(listID, name, text, state, callback);
			});
			return;
		};


		var stmt = this.db.prepare("INSERT INTO TodoItems (listID, itemName, itemText, state) VALUES (?,?,?,?)");

		stmt.run(listID, name, text, state, function(err) {
			if (err) {
				stmt.finalize();
				callback(err);
			} else {
				stmt.finalize(callback);
			}
		});
	},

	completeItem: function(itemID, callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.completeItem(itemID, callback);
			});
			return;
		};


		var stmt = this.db.prepare("UPDATE TodoItems SET state=1 WHERE itemID=?");
		var self = this;
		stmt.run(itemID, function(err) {
			if (err) {
				stmt.finalize();
				callback(err);
			} else {
				stmt.finalize(callback);
			}
		});
	},

	createList: function(listName, callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.createList(listName, callback);
			});
			return;
		};

		var stmt = this.db.prepare("INSERT INTO TodoLists (listName) VALUES (?)");
		var self = this;
		stmt.run(listName, function(err) {
			if (err) {
				stmt.finalize();
				callback(err);
			} else {
				stmt.finalize();
				self.db.get("SELECT last_insert_rowid() AS listID FROM TodoLists", callback);
			}
		});
	},

	renameList: function(listId, newName, callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.renameList(listId, newName, callback);
			});
			return;
		};

		var stmt = this.db.prepare("UPDATE TodoLists SET listName=? WHERE listID=?");
		var self = this;
		stmt.run(newName, listId, function(err) {
			if (err) {
				stmt.finalize();
				callback(err);
			} else {
				stmt.finalize(callback);
			}
		});
	},

	getLists: function(callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.getLists(callback);
			});
			return;
		};

		var items = [];
		this.db.each("SELECT listID, listName FROM TodoLists", function(err, row){
			items.push({
				id: row.listID,
				name: row.listName
			});
		}, function() {
			//TODO: error handling
			callback(null, items);
		});
	},
	getListNameFromID: function(id, callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.getListNameFromID(id,callback);
			});
			return;
		};

		var stmt = this.db.prepare("SELECT listName FROM TodoLists WHERE listID = ?");
		stmt.get(id, function(err, row) {
			if (err) {
				stmt.finalize();
				callback(err, null);
			} else {
				stmt.finalize();
				callback(null, row ? row.listName : null);
			}
		});
	},

	getUsers: function(callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.getUsers(callback);
			});
			return;
		};

		var items = [];
		this.db.each("SELECT userID, username FROM Users", function(err, row){
			items.push({
				id: row.userID,
				name: row.username
			});
		}, function() {
			//TODO: error handling
			callback(null, items);
		});
	},

	createUser: function(username, password, callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.createUser(username, password, callback);
			});
			return;
		};

		var passHash = bcrypt.hashSync(password, 10);
		var stmt = this.db.prepare("INSERT INTO Users (username, password) VALUES (?,?)");

		var self = this;
		stmt.run(username, passHash, function(err) {
			if (err) {
				stmt.finalize();
				callback(err);
			} else {
				stmt.finalize();
				self.db.get("SELECT last_insert_rowid() AS userID FROM Users", callback);
			}
		});
	},

	authenticateUser: function(username, password, callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function(err) {
				if(err) callback(err);
				else self.authenticateUser(username, password, callback);
			});
			return;
		};

		var stmt = this.db.prepare("SELECT password FROM Users WHERE username = ?");
		stmt.get(username, function(err, row) {
			if (err) {
				stmt.finalize();
				callback(err, null);
			} else {
				stmt.finalize();

				if (row) {
					callback(null, bcrypt.compareSync(password, row.password));
				} else {
					callback(null, false);
				}
				
			}
		});
	},

	getUserNameFromID: function(id, callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.getUserNameFromID(id,callback);
			});
			return;
		};

		var stmt = this.db.prepare("SELECT username FROM Users WHERE userID = ?");
		stmt.get(id, function(err, row) {
			if (err) {
				stmt.finalize();
				callback(err, null);
			} else {
				stmt.finalize();
				callback(null, row ? row.username : null);
			}
		});

	},

	getUserIDFromName: function(username, callback) {
		if (!this.db) {
			var self = this;
			this.open(this.file, function() {
				self.getUserIDFromName(id,callback);
			});
			return;
		};

		var stmt = this.db.prepare("SELECT userID FROM Users WHERE username = ?");
		stmt.get(username, function(err, row) {
			if (err) {
				stmt.finalize();
				callback(err, null);
			} else {
				stmt.finalize();
				callback(null, row ? row.userID : null);
			}
		});

	}
};