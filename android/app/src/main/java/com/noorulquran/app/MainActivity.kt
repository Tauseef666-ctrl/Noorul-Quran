package com.noorulquran.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import com.noorulquran.app.ui.NoorulQuranRoot
import com.noorulquran.app.ui.theme.NoorulQuranTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            NoorulQuranTheme {
                NoorulQuranRoot()
            }
        }
    }
}
