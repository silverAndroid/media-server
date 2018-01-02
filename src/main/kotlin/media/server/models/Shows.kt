package media.server.models

import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table

object Shows : Table() {
    val id by IDKey()
    val videoID = integer("video_id").references(Videos.id, ReferenceOption.CASCADE)
}