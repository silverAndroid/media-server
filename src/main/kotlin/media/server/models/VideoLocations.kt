package media.server.models

import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table

object VideoLocations : Table() {
    val id by IDKey()
    val videoID = integer("video_id").references(Videos.id, ReferenceOption.CASCADE)
    val season = integer("season")
    val episode = integer("episode")
    val path = text("path").uniqueIndex()
}