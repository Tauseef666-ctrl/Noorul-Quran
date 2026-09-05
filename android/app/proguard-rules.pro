# NoorulQuran ProGuard/R8 rules.
# Keep serializable data model classes (used with the canonical Quran asset + API models).
-keepattributes *Annotation*, InnerClasses

# Application/DI container are resolved by name from the manifest and casts, not code refs.
-keep class com.noorulquran.app.NoorulQuranApp { *; }
-keep class com.noorulquran.app.AppContainer { *; }

# ViewModels are instantiated reflectively by AndroidViewModelFactory.
-keepclassmembers class * extends androidx.lifecycle.ViewModel {
    <init>(android.app.Application);
    <init>(androidx.lifecycle.SavedStateHandle);
}
-keepclassmembers class * extends androidx.lifecycle.AndroidViewModel {
    <init>(android.app.Application);
}

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
