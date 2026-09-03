# NoorulQuran ProGuard/R8 rules.
# Keep serializable data model classes (used with the canonical Quran asset + API models).
-keepattributes *Annotation*, InnerClasses

# kotlinx.serialization
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.noorulquran.app.**$$serializer { *; }
-keepclassmembers class com.noorulquran.app.** {
    *** Companion;
}
-keepclasseswithmembers class com.noorulquran.app.** {
    kotlinx.serialization.KSerializer serializer(...);
}
