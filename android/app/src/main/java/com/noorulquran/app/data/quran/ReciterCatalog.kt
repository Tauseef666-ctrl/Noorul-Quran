package com.noorulquran.app.data.quran

/** Curated reciters offered for playback (matching the web app's catalog). */
data class Reciter(
    val id: String,
    val name: String,
)

object ReciterCatalog {
    val ALL: List<Reciter> = listOf(
        Reciter("ar.alafasy", "Mishary Rashid Alafasy"),
        Reciter("ar.abdulbasitmurattal", "Abdul Basit (Murattal)"),
        Reciter("ar.husary", "Mahmoud Khalil Al-Husary"),
        Reciter("ar.minshawi", "Mohamed Siddiq El-Minshawi"),
        Reciter("ar.shaatree", "Abu Bakr Ash-Shaatree"),
        Reciter("ar.hudhaify", "Ali Al-Hudhaify"),
    )

    private val byId: Map<String, Reciter> = ALL.associateBy { it.id }

    fun nameFor(id: String): String = byId[id]?.name ?: "NoorulQuran"
    fun defaultId(): String = "ar.alafasy"
}
