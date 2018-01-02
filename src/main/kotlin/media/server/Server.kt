package media.server

import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.features.CallLogging
import io.ktor.features.DefaultHeaders
import io.ktor.http.ContentType
import io.ktor.response.respondText
import io.ktor.routing.get
import io.ktor.routing.routing
import org.jetbrains.exposed.sql.Database
import java.io.FileReader

@Suppress("unused")
fun Application.main() {
    val config = environment.config
    val ktorConfig = config.config("ktor")
    val serverConfig = config.config("server")

    val environment = ktorConfig.config("deployment").property("environment").getString()
    val secretsFolder = serverConfig.propertyOrNull("secret_folders")?.getString() ?: "src/main/resources/secrets/$environment"

    val dbName = FileReader("$secretsFolder/database.secret").readText()
    val username = FileReader("$secretsFolder/db_user.secret").readText()
    val password = FileReader("$secretsFolder/db_password.secret").readText()

    Database.connect(
            "jdbc:postgresql://db/$dbName",
            "org.postgresql.Driver",
            username,
            password
    )

    install(DefaultHeaders)
    install(CallLogging)
    routing {
        get("/") {
            call.respondText("My Example Blog", ContentType.Text.Html)
        }
    }
}