package media.server.models

import org.jetbrains.exposed.sql.Table

object Videos : Table() {
    val id by IDKey()
    val name = text("name")
    val year = integer("year").nullable()
    val tmdbID = integer("tmdb_id").uniqueIndex().nullable()
    val imageURL = text("image_url")
    val overview = text("overview")
}