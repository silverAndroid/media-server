package media.server.models

import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table

object ShowsSeasons : Table() {
    val id by IDKey()
    val showID = integer("show_id").references(Shows.id, ReferenceOption.CASCADE)
    val season = integer("season")
    val imageURL = text("image_url").nullable()
    val overview = text("overview").nullable()
}