package media.server.models

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import kotlin.properties.ReadOnlyProperty
import kotlin.reflect.KProperty

internal class IDKey(private val columnName: String = "id") : Table(), ReadOnlyProperty<Any?, Column<Int>> {
    override fun getValue(thisRef: Any?, property: KProperty<*>): Column<Int> = integer(columnName).primaryKey().autoIncrement()
}