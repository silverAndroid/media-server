package media.server.models

import org.jetbrains.exposed.sql.Table

object Directories : Table() {
    val id by IDKey()
    val path = text("path").uniqueIndex()
}