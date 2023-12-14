async function createInfoLog(client, logMessage, source, user_id) {
    sql = `INSERT INTO logs(log_level, message, source, user_id) VALUES ("info","${logMessage}","${source}","${user_id}")`
    client.db.query(sql)
}

async function createWarnLog(client, logMessage, source, user_id) {
    sql = `INSERT INTO logs(log_level, message, source, user_id) VALUES ("warn","${logMessage}","${source}","${user_id}")`
    client.db.query(sql)
}

async function createErrorLog(client, logMessage, source, user_id) {
    sql = `INSERT INTO logs(log_level, message, source, user_id) VALUES ("error","${logMessage}","${source}","${user_id}")`
    client.db.query(sql)
}

module.exports = { createInfoLog, createWarnLog, createErrorLog }