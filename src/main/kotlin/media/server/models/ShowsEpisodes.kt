package media.server.models

import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table

object ShowsEpisodes : Table() {
    val id by IDKey()
    val showID = integer("show_id") references Shows.id
    val season = integer("season").references(ShowsSeasons.season, ReferenceOption.CASCADE)
    val episode = integer("episode")
    val name = text("name")
    val imageURL = text("image_url")
    val overview = text("overview").nullable()
    val mpdLocation = text("mpd_location").nullable()
}