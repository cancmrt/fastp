const sqlite3 = require('sqlite3').verbose();
class SqliteConnector {

    constructor(connection){
        this.connection = connection
        this.db = new sqlite3.Database(this.connection);
    }

    GetQuery(query,result){
        this.db.all(query, function(err, rows) {
            if(err) {
                throw err;
            }
            result(rows)
        });
    }
    ExecuteQuery(query,result){
        this.db.run(query, (err) => {
            if(err) {
                throw err;
            }
            result(true);
        })
    }

}

module.exports = SqliteConnector