package com.example.project2

import android.os.Bundle
import android.text.TextUtils
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class RenderActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_render)
//        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
//            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
//            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
//            insets
//        }
        var text = findViewById<TextView>(R.id.textView2)
        var textValue = intent.getStringExtra("text")
        text.text = textValue

        text.textSize = intent.getFloatExtra("textSize", 32F)

        text.isSingleLine = intent.getBooleanExtra("singleLine", false)
        if (text.isSingleLine) {
            text.ellipsize = TextUtils.TruncateAt.MARQUEE
            text.marqueeRepeatLimit = -1 // marquee_forever
            text.isSelected = true
        }
    }
}